import { describe, it, expect } from "bun:test";
import loadConfig from "../src/utils/config.js";

describe("smoke", () => {
  it("boots without login and loads modules", async () => {
    process.env.API_BASE = process.env.API_BASE || "https://example.com";
    process.env.BOT_CLIENT_NAME = process.env.BOT_CLIENT_NAME || "AclevoBot";
    process.env.BOT_CLIENT_ID = process.env.BOT_CLIENT_ID || "123";
    process.env.BOT_CLIENT_SECRET =
      process.env.BOT_CLIENT_SECRET || "secret";
    process.env.BOT_TOKEN = process.env.BOT_TOKEN || "token";
    process.env.NO_LOGIN = "true";

    const config = loadConfig();
    const botModule = await import("../src/bot.js");
    const botInit = botModule.default ?? botModule;
    const bot = await botInit(config);

    expect(bot).toBeTruthy();
    expect(bot.client).toBeTruthy();

    if (bot?.client) {
      await bot.client.destroy();
    }
  });
});
