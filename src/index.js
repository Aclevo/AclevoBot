/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

/* Bun replaces Node's fs module with its own built‑in file API. No import needed here. */
/* Bun provides a global `path` object, but we can avoid importing it entirely by using URL resolution for our file path. */
/* Bun automatically loads .env files, so no need for dotenv import */

const config = {
  debug: process.env.BOT_DEBUG_ENABLED == "true",
  apis: {
    base: process.env.API_BASE,
  },
  // == DISCORD
  discord: {
    // 1. Bot
    clientName: process.env.BOT_CLIENT_NAME,
    clientID: process.env.BOT_CLIENT_ID,
    clientSecret: process.env.BOT_CLIENT_SECRET,
    token: process.env.BOT_TOKEN,
    shardingEnabled: process.env.BOT_SHARDING_ENABLED == "true",

    // 2. Interactions
    enableSlashCommands: process.env.COMMAND_SLASH_ENABLED == "true",
    registerCommandsOnStart: process.env.COMMAND_SLASH_REG_ON_START == "true",
    // enablePrefixCommands: (process.env.COMMAND_PREFIX_ENABLED == "true"),

    // 3. Management
    owners: (() => {
      const ownersRaw = process.env.OWNERS || "";
      if (!ownersRaw) return [];
      return ownersRaw
        .split(",")
        .map((owner) => owner.trim())
        .filter(Boolean);
    })(),
    // 4. Invites
    supportInviteBase: process.env.LINK_SUPPORT,
    botInviteBase: process.env.LINK_INVITE,
    botInvitePerms: process.env.PERMISSIONS || 8,
    cacheOnStart: process.env.BOT_CACHE_ON_START == "true",
  },
  // == COLORS
  colors: {
    red: 16711680,
    green: 65280,
    blue: 255,
    yellow: 16776960,
    orange: 16753920,
    purple: 8388736,
    pink: 16761035,
    teal: 32768,
    cyan: 65535,
    magenta: 16711935,
    random: (toReturn) => {
      const colorsN = Object.keys(config.colors).filter((c) => c !== "random");
      const name = colorsN[Math.floor(Math.random() * colorsN.length)];

      return toReturn == "name"
        ? name
        : toReturn == "value"
          ? config.colors[name]
          : { name, value: config.colors[name] };
    },
  },
};

const botJSFile = new URL("./bot.js", import.meta.url).pathname;

const main = async () => {
  if (config.shardingEnabled) {
    throw new Error("Please do not use sharing, yet.");
  }

  const botModule = await import(botJSFile);
  const botInit = botModule.default ?? botModule;
  await botInit(config);
};

try {
  await main();
} catch (err) {
  const message = err?.message || String(err);
  console.error("\x1b[31mShutdown requested: " + message + "\x1b[0m");
  process.exitCode = 1;
}
