/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import loadConfig from "./utils/config.js";

const config = loadConfig();

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
