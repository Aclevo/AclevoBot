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

// Use import.meta.dir instead of __dirname
const baseDir = import.meta.dir;

// Load logger using native ESM dynamic import
const LoggerModule = await import(`${baseDir}/utils/logger.js`);
const Logger = (LoggerModule.default ?? LoggerModule)();
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
      ],
      partials: [Partials.Channel],
      // Keep caches bounded to reduce memory usage
      makeCache: Options.cacheWithLimits({
        MessageManager: 200,
        ThreadManager: 50,
      }),
      sweepers: {
        messages: {
          interval: 600,
          lifetime: 300,
          filter: () => true, // Keep all messages within lifetime
        },
        threads: {
          interval: 600,
          lifetime: 900,
          filter: () => true, // Keep all threads within lifetime
        },
        users: {
          interval: 3600,
          lifetime: 1800,
          filter: () => true, // Keep all users within lifetime
        },
      },
    });

    return true;
  }

  scanGlob(pattern, cwd) {
    const glob = new Bun.Glob(pattern);
    return glob.scanSync({ cwd });
  }

  async initUtils() {
    const importantUtils = ["func", "functions"];
    this.utils = {};

    // Bun.Glob: Native, synchronous, and significantly faster than fs.readdirSync
    const utilsDir = `${this.baseDir}/utils`;

    const files = this.scanGlob("*.js", utilsDir);
    await Promise.all(
      files.map(async (file) => {
        const start = Date.now();
        const filePath = `${utilsDir}/${file}`;
        const fileName = file.replace(/\.js$/, "");

        try {
          // Native ESM dynamic import (Bun caches these efficiently)
          const utilModule = await import(filePath);
          const util = (utilModule.default ?? utilModule)(this, {});
          const meta = util.meta();

          this.utils[fileName] = util.execute;
          this.logger.debug(
            "BOOTSTRAP",
            `Load util ${meta.name}: OK in ${Date.now() - start}ms`,
          );
        } catch (err) {
          this.logger.error(
            "BOOTSTRAP",
            `Load util ${fileName}: NOT OK - ${err.message}`,
          );
          console.error(err.stack);

          if (importantUtils.includes(fileName)) {
            this.logger.error(
              "BOOTSTRAP",
              "Important util failed to load. Exiting...!",
            );
            throw new Error("Important util failed to load");
          }
        }
      }),
    );

    return true;
  }

  async initEvents() {
    if (!this.client) throw new Error("Please init the client first.");

    this.events = new Collection();
    const evtsDir = `${this.baseDir}/evts`;

    const files = this.scanGlob("**/*.js", evtsDir);
    await Promise.all(
      files.map(async (filePath) => {
        const start = Date.now();
        const absolutePath = `${evtsDir}/${filePath}`;
        const fileName = filePath.replace(/\.js$/, "").split("/").pop();

        try {
          // Clear module cache using Bun's native approach
          if (this.functions?.clearCache)
            this.functions.clearCache(absolutePath);

          const eventModule = await import(absolutePath);
          const event = (eventModule.default ?? eventModule)();
          const meta = event.meta();

          if (meta.type === "rest") {
            this.client.rest.on(meta.name, (...args) => event.run(this, args));
          } else {
            this.client.on(meta.name, (...args) => event.run(this, args));
          }

          this.logger.debug(
            "BOOTSTRAP",
            `Load event ${meta.name}: OK in ${Date.now() - start}ms`,
          );
        } catch (err) {
          this.logger.error(
            "BOOTSTRAP",
            `Load event ${fileName}: NOT OK - ${err.message}`,
          );
          console.error(err.stack);
        }
      }),
    );

    return true;
  }

  async initCommands() {
    if (!this.client) throw new Error("Please init the client first.");

    this.commands = {
      slash: new Collection(),
      slash_data: [],
    };

    const cmdsDir = `${this.baseDir}/cmds`;

    const files = this.scanGlob("**/*.js", cmdsDir);
    await Promise.all(
      files.map(async (filePath) => {
        const start = Date.now();
        const absolutePath = `${cmdsDir}/${filePath}`;
        const fileName = filePath.replace(/\.js$/, "").split("/").pop();

        try {
          if (this.functions?.clearCache)
            this.functions.clearCache(absolutePath);

          const cmdModule = await import(absolutePath);
          const command = (cmdModule.default ?? cmdModule)();
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

          this.logger.debug(
            "BOOTSTRAP",
            `Load command ${meta.name}: OK in ${Date.now() - start}ms`,
          );
        } catch (err) {
          this.logger.error(
            "BOOTSTRAP",
            `Load command ${fileName}: NOT OK - ${err.message}`,
          );
          console.error(err.stack);
        }
      }),
    );

    return true;
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
  let shuttingDown = false;
  const shutdown = async (bot, code, reason) => {
    if (shuttingDown) return;
    shuttingDown = true;

    if (reason) {
      bot?.logger?.error("SYSTEM", `Shutdown requested: ${reason}`);
    }

    try {
      if (bot?.client) {
        await bot.client.destroy();
      }
    } catch (err) {
      bot?.logger?.error(
        "SYSTEM",
        `Error while destroying client: ${err?.message || err}`,
      );
    } finally {
      process.exitCode = code;
    }
  };

  if (!config) {
    await shutdown(
      null,
      1,
      "Please make sure to be coming from src/index.js ... :c",
    );
    return null;
  }

  console.log("Starting the bot, please wait.");
  const bot = new Bot(config);

  try {
    bot.init();
    await bot.initUtils();
    await Promise.all([bot.initEvents(), bot.initCommands()]);
  } catch (err) {
    await shutdown(bot, 1, err?.message || err);
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
    await bot.login();
  } catch (err) {
    await shutdown(bot, 1, err?.message || err);
    return null;
  }

  // Properly set up signal handlers with access to the bot instance
  const handleExitSignal = async (signal) => {
    await shutdown(bot, 0, `Received ${signal} signal.`);
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
    await shutdown(bot, 1, "Unhandled promise rejection.");
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
