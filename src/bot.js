/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

// Bun-native imports (no require())
import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Options,
} from "discord.js";
import { loadModules } from "./utils/loader.js";
import { createShutdown } from "./utils/shutdown.js";

// Use import.meta.dir instead of __dirname
const baseDir = import.meta.dir;

// Load logger using native ESM dynamic import
const LoggerModule = await import(`${baseDir}/utils/logger.js`);
const Logger = LoggerModule.default ?? LoggerModule;
const loggerMeta = Logger.meta();

class Bot {
  constructor(config) {
    this.uptime = {
      startAt: Date.now(),
      readyAt: null,
    };

    this.baseDir = baseDir;
    this.config = config;
    this.client = null;
    this.runtime = {
      logChannelCache: new Map(),
      serverInfoCache: new Map(),
      timers: new Set(),
      shuttingDown: false,
    };

    this.version = {
      major: 1,
      minor: 0,
      revision: 0,
      release: "STABLE",

      getBuild: () => this.version.release,
      getVersion: () =>
        `${this.version.major}.${this.version.minor}.${this.version.revision}`,
      getFull: () => `${this.version.getVersion()} ${this.version.getBuild()}`,
    };

    // Logger init
    this.logger = new Logger.execute(this);
  }

  init() {
    this.logger.info(
      "BOOTSTRAP",
      `Bootstrapper ${loggerMeta.name} initialized!`,
    );
    this.logger.info(
      "BOOTSTRAP",
      `AclevoBot v${this.version.getFull()} by Aclevo.`,
    );

    const crash = (msg) => {
      this.logger.error("BOOTSTRAP", `Check failed while starting: ${msg}`);
      throw new Error(msg);
    };

    // Config validation (same logic, cleaner syntax)
    const validations = [
      {
        check: () => typeof this.config.debug === "boolean",
        error: "Debug not set! Set it in .env under BOT_DEBUG_ENABLED",
      },
      {
        check: () => !!this.config.apis?.base,
        error: "Base API not set! Set it in .env under API_BASE",
      },
      {
        check: () => !!this.config.discord?.clientName,
        error: "Bot Name not set! Set it in .env under BOT_CLIENT_NAME",
      },
      {
        check: () => !!this.config.discord?.clientID,
        error: "Bot ID not set! Set it in .env under BOT_CLIENT_ID",
      },
      {
        check: () => !!this.config.discord?.clientSecret,
        error: "Bot Secret not set! Set it in .env under BOT_CLIENT_SECRET",
      },
      {
        check: () => !!this.config.discord?.token,
        error: "Bot Token not set! Set it in .env under BOT_TOKEN",
      },
      {
        check: () =>
          typeof this.config.discord.enableSlashCommands === "boolean",
        error:
          "Enable Slash Commands not set! Set it in .env under COMMAND_SLASH_ENABLED",
      },
      {
        check: () =>
          !this.config.discord.enableSlashCommands ||
          typeof this.config.discord.registerCommandsOnStart === "boolean",
        error:
          "Register Slash Commands On Start not set! Set it in .env under COMMAND_SLASH_REG_ON_START",
      },
    ];

    for (const { check, error } of validations) {
      if (!check()) crash(error);
    }

    // Initialize Discord client
    this.client = new Client({
      ws: {
        compress: true,
      },
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
      ],
      // Keep caches bounded to reduce memory usage
      makeCache: Options.cacheWithLimits({
        MessageManager: 200,
        ThreadManager: 50,
        GuildMemberManager: Number(process.env.BOT_MEMBER_CACHE_LIMIT) || 2000,
        UserManager: Number(process.env.BOT_USER_CACHE_LIMIT) || 2000,
      }),
      sweepers: {
        messages: {
          interval: 900,
          lifetime: 300,
          filter: () => true, // Keep all messages within lifetime
        },
        threads: {
          interval: 900,
          lifetime: 900,
          filter: () => true, // Keep all threads within lifetime
        },
        users: {
          interval: 7200,
          lifetime: 1800,
          filter: () => true, // Keep all users within lifetime
        },
      },
    });

    return true;
  }

  async initUtils() {
    const importantUtils = ["func", "functions"];
    this.utils = {};

    const utilsDir = `${this.baseDir}/utils`;
    const importantSet = new Set(importantUtils);

    return loadModules({
      pattern: "*.js",
      cwd: utilsDir,
      logger: this.logger,
      kind: "util",
      onLoad: async ({ module, fileName }) => {
        const utilModule = module.default ?? module;
        const util =
          typeof utilModule === "function" ? utilModule(this, {}) : utilModule;
        const meta = util.meta?.() ?? { name: fileName };

        this.utils[fileName] = util.execute;
        return meta.name || fileName;
      },
      onError: async ({ fileName }) => {
        if (importantSet.has(fileName)) {
          this.logger.error(
            "BOOTSTRAP",
            "Important util failed to load. Exiting...!",
          );
          throw new Error("Important util failed to load");
        }
      },
    });
  }

  async initEvents() {
    if (!this.client) throw new Error("Please init the client first.");

    this.events = new Collection();
    const evtsDir = `${this.baseDir}/features/events`;

    return loadModules({
      pattern: "**/*.js",
      cwd: evtsDir,
      logger: this.logger,
      kind: "event",
      onLoad: async ({ module, absolutePath, fileName }) => {
        if (this.functions?.clearCache) {
          this.functions.clearCache(absolutePath);
        }

        const eventModule = module.default ?? module;
        const event =
          typeof eventModule === "function" ? eventModule() : eventModule;
        const meta = event.meta?.() ?? event.meta;

        if (meta.type === "rest") {
          this.client.rest.on(meta.name, (...args) => event.run(this, args));
        } else {
          this.client.on(meta.name, (...args) => event.run(this, args));
        }

        return meta.name || fileName;
      },
    });
  }

  async initCommands() {
    if (!this.client) throw new Error("Please init the client first.");

    this.commands = {
      slash: new Collection(),
      slash_data: [],
    };

    const cmdsDir = `${this.baseDir}/features/commands`;

    return loadModules({
      pattern: "**/*.js",
      cwd: cmdsDir,
      logger: this.logger,
      kind: "command",
      onLoad: async ({ module, absolutePath, filePath, fileName }) => {
        if (this.functions?.clearCache) {
          this.functions.clearCache(absolutePath);
        }

        const cmdModule = module.default ?? module;
        const command =
          typeof cmdModule === "function" ? cmdModule() : cmdModule;
        if (!("meta" in command) || !("execute" in command)) {
          throw new Error('missing required "meta" or "execute" property');
        }

        const meta = command.meta().toJSON();
        const category = filePath.split("/")[0];

        this.commands.slash.set(meta.name, {
          ...command,
          meta: {
            ...meta,
            category,
            ownerOnly: meta.ownerOnly || category === "Owner",
          },
        });
        this.commands.slash_data.push(meta);

        return meta.name || fileName;
      },
    });
  }

  async login() {
    return this.client
      .login(this.config.discord.token)
      .then(() => {
        this.logger.info("BOOTSTRAP", "Logged in!");
        this.uptime.readyAt = Date.now();
      })
      .catch((err) => {
        this.logger.error("BOOTSTRAP", `Login failed: ${err.message}`);
        throw err;
      });
  }
}

// Main initialization function (ESM compatible)
export default async function botInit(config) {
  let bot = null;
  const shutdown = createShutdown({
    logger: {
      error: (...args) => bot?.logger?.error?.(...args),
    },
  });

  if (!config) {
    await shutdown({
      code: 1,
      reason: "Please make sure to be coming from src/index.js ... :c",
    });
    return null;
  }

  console.log("Starting the bot, please wait.");
  bot = new Bot(config);

  try {
    bot.init();
    await bot.initUtils();
    await Promise.all([bot.initEvents(), bot.initCommands()]);
  } catch (err) {
    await shutdown({
      code: 1,
      reason: err?.message || err,
      cleanup: async () => {
        if (bot?.client) await bot.client.destroy();
      },
    });
    return null;
  }

  const verifyUtil = (name) => {
    if (!bot.utils?.[name]) {
      bot.logger.error("BOOTSTRAP", `Failed to find ${name}. Exiting...!`);
      throw new Error(`Missing util: ${name}`);
    }
  };

  try {
    verifyUtil("functions");
    // Note: Database functionality has been removed

    bot.functions = new bot.utils.functions(bot);
    if (process.env.NO_LOGIN === "true") {
      bot.logger.warn("BOOTSTRAP", "NO_LOGIN=true; skipping Discord login.");
    } else {
      await bot.login();
    }
  } catch (err) {
    await shutdown({
      code: 1,
      reason: err?.message || err,
      cleanup: async () => {
        if (bot?.client) await bot.client.destroy();
      },
    });
    return null;
  }

  // Properly set up signal handlers with access to the bot instance
  const handleExitSignal = async (signal) => {
    await shutdown({
      code: 0,
      reason: `Received ${signal} signal.`,
      cleanup: async () => {
        if (bot?.client) await bot.client.destroy();
      },
    });
  };

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => handleExitSignal(signal));
  }

  process.on("unhandledRejection", async (reason, promise) => {
    bot.logger.error("SYSTEM", "Unhandled Rejection");
    bot.logger.error(
      "SYSTEM",
      `Promise: ${promise} | Reason: ${reason?.message || reason}`,
    );
    await shutdown({
      code: 1,
      reason: "Unhandled promise rejection.",
      cleanup: async () => {
        if (bot?.client) await bot.client.destroy();
      },
    });
  });

  return bot;
}

// Prevent direct execution (Bun-compatible check)
if (import.meta.main) {
  console.error(
    "\x1b[31mPlease make sure to be coming from src/index.js ... :c\x1b[0m",
  );
  process.exitCode = 1;
}
