/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

// Bun-native imports (no require())
import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";

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
      process.exit(-1);
    };

    // Config validation (same logic, cleaner syntax)
    if (typeof this.config.debug !== "boolean")
      crash("Debug not set! Set it in .env under BOT_DEBUG_ENABLED");

    if (!this.config.apis?.base)
      crash("Base API not set! Set it in .env under API_BASE");

    const { discord } = this.config;
    if (!discord?.clientName)
      crash("Bot Name not set! Set it in .env under BOT_CLIENT_NAME");
    if (!discord?.clientID)
      crash("Bot ID not set! Set it in .env under BOT_CLIENT_ID");
    if (!discord?.clientSecret)
      crash("Bot Secret not set! Set it in .env under BOT_CLIENT_SECRET");
    if (!discord?.token)
      crash("Bot Token not set! Set it in .env under BOT_TOKEN");
    if (typeof discord.enableSlashCommands !== "boolean")
      crash(
        "Enable Slash Commands not set! Set it in .env under COMMAND_SLASH_ENABLED",
      );
    if (
      discord.enableSlashCommands &&
      typeof discord.registerCommandsOnStart !== "boolean"
    )
      crash(
        "Register Slash Commands On Start not set! Set it in .env under COMMAND_SLASH_REG_ON_START",
      );

    // Initialize Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
      ],
    });

    return true;
  }

  async initUtils() {
    const importantUtils = ["db", "database", "func", "functions"];
    this.utils = {};

    // Bun.Glob: Native, synchronous, and significantly faster than fs.readdirSync
    const glob = new Bun.Glob("*.js");
    const utilsDir = `${this.baseDir}/utils`;

    for (const file of glob.scanSync({ cwd: utilsDir })) {
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
          process.exit(-1);
        }
      }
    }

    return true;
  }

  async initEvents() {
    if (!this.client) throw new Error("Please init the client first.");

    this.events = new Collection();
    const glob = new Bun.Glob("**/*.js");
    const evtsDir = `${this.baseDir}/evts`;

    for (const filePath of glob.scanSync({ cwd: evtsDir })) {
      const start = Date.now();
      const absolutePath = `${evtsDir}/${filePath}`;
      const fileName = filePath.replace(/\.js$/, "").split("/").pop();

      try {
        // Clear module cache using Bun's native approach
        if (this.functions?.clearCache) this.functions.clearCache(absolutePath);

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
    }

    return true;
  }

  async initCommands() {
    if (!this.client) throw new Error("Please init the client first.");

    this.commands = {
      slash: new Collection(),
      slash_data: [],
    };

    const glob = new Bun.Glob("**/*.js");
    const cmdsDir = `${this.baseDir}/cmds`;

    for (const filePath of glob.scanSync({ cwd: cmdsDir })) {
      const start = Date.now();
      const absolutePath = `${cmdsDir}/${filePath}`;
      const fileName = filePath.replace(/\.js$/, "").split("/").pop();

      try {
        if (this.functions?.clearCache) this.functions.clearCache(absolutePath);

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
    }

    return true;
  }

  login() {
    return this.client
      .login(this.config.discord.token)
      .then(() => {
        this.logger.info("BOOTSTRAP", "Logged in!");
        this.uptime.readyAt = Date.now();
      })
      .catch((err) => {
        this.logger.error("BOOTSTRAP", `Login failed: ${err.message}`);
        process.exit(-1);
      });
  }
}

// Main initialization function (ESM compatible)
export default async function botInit(config) {
  if (!config) {
    console.error(
      "\x1b[31mPlease make sure to be coming from src/index.js ... :c\x1b[0m",
    );
    process.exit(-1);
  }

  console.log("Starting the bot, please wait.");
  const bot = new Bot(config);

  await bot.init();
  await bot.initUtils();

  const verifyUtil = (name) => {
    if (!bot.utils?.[name]) {
      bot.logger.error("BOOTSTRAP", `Failed to find ${name}. Exiting...!`);
      process.exit(-1);
    }
  };

  verifyUtil("functions");
  verifyUtil("database");

  bot.functions = new bot.utils.functions(bot);

  const db = new bot.utils.database(bot);
  try {
    await db.init({
      database: process.env.DB_NAME ?? "thecodingbot.sqlite",
      dbCfg: {
        dialect: "sqlite",
        storage: process.env.DB_STORAGE ?? "./database.sqlite",
        logging: (data) => bot.logger.debug("DATABASE", data),
      },
    });
    bot.logger.info("DATABASE", "Database connected successfully");
  } catch (error) {
    bot.logger.warn("DATABASE", `Database connection failed: ${error.message}`);
    bot.logger.warn(
      "DATABASE",
      "Bot will continue without database functionality",
    );
    // Optionally disable features that require database
    bot.db = null;
  }

  if (bot.utils.language) {
    bot.lang = new bot.utils.language(bot);
    if (bot.lang?.init) await bot.lang.init();
  } else {
    bot.logger.warn("SYSTEM", "Language utility not available");
    bot.lang = null;
  }

  await bot.initEvents();
  await bot.initCommands();
  await bot.login();

  return bot;
}

// Prevent direct execution (Bun-compatible check)
if (import.meta.main) {
  console.error(
    "\x1b[31mPlease make sure to be coming from src/index.js ... :c\x1b[0m",
  );
  process.exit(-1);
}
