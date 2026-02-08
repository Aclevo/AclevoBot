/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { Routes, REST } from "discord.js";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "clientReady",
  run: async (bot, params) => {
    const parseBool = (value) => value === "true";
    // bot.footerText = bot.footerText.replaceAll("%currentYear%", new Date().getFullYear());
    bot.logger.info("DISCORD", `Logged in as ${bot.client.user.tag}`);

    if (
      bot.commands &&
      (bot.commands ? bot.commands.slash_data : false) &&
      bot.config.discord.registerCommandsOnStart
    ) {
      const startRegister = new Date().getTime();
      const commandsPayload = JSON.stringify(bot.commands.slash_data);
      const commandsHash = createHash("sha256")
        .update(commandsPayload)
        .digest("hex");
      const hashPath = `${bot.baseDir}/../logs/command-hash.json`;
      const forceRegister = parseBool(process.env.COMMAND_SLASH_FORCE_REG);

      let lastHash = null;
      if (!forceRegister && existsSync(hashPath)) {
        try {
          const stored = JSON.parse(readFileSync(hashPath, "utf8"));
          lastHash = stored?.hash || null;
        } catch {
          lastHash = null;
        }
      }

      if (!forceRegister && lastHash === commandsHash) {
        bot.logger.info(
          "DISCORD",
          "Slash commands unchanged; skipping registration.",
        );
      } else {
        bot.logger.info("DISCORD", "Now registering slash commands...");
        const rest = new REST({ version: "10" }).setToken(
          bot.config.discord.token,
        );
        try {
          await rest.put(Routes.applicationCommands(bot.client.user.id), {
            body: bot.commands.slash_data,
          });
          writeFileSync(
            hashPath,
            JSON.stringify({ hash: commandsHash, at: Date.now() }),
          );
          bot.logger.debug(
            "DISCORD",
            `Successfully registered all slash commands in ${new Date().getTime() - startRegister}ms.`,
          );
        } catch (Ex) {
          bot.logger.error("DISCORD", `Could not register slash commands.`);
          console.log(Ex);
        }
      }
    }

    bot.uptime.readyAt = new Date().getTime();
    const totalTime = bot.uptime.readyAt - bot.uptime.startAt;
    bot.logger.info(
      "SYSTEM",
      `Startup finished! It took ${totalTime}ms (${totalTime / 1000}s)!`,
    );

    if (
      !bot.config.discord.botInviteBase ||
      bot.config.discord.botInviteBase == null ||
      bot.config.discord.botInviteBase == ""
    ) {
      bot.config.discord.botInvite = `https://discord.com/oauth2/authorize?client_id=${bot.client.user.id}&permissions=${bot.config.discord.botInvitePerms}&scope=bot`;
    } else bot.config.discord.botInvite = bot.config.discord.botInviteBase;

    const cacheTimeout = setTimeout(() => {
      if (bot.runtime?.shuttingDown || bot.client?.isReady?.() === false) {
        return;
      }

      if (bot.client.guilds.cache.size < 1) {
        bot.logger.info(
          "SYSTEM",
          `We have detected this bot is in no servers. So, here's your link to add it to the first server!\n\t${bot.config.discord.botInvite}`,
        );
      } else {
        if (!bot.config.discord.cacheOnStart) {
          bot.logger.info(
            "SYSTEM",
            "Startup cache disabled (BOT_CACHE_ON_START=false). Skipping full guild caching.",
          );
          return;
        }

        let servCount = 0;
        const guilds = Array.from(bot.client.guilds.cache.values());
        const maxConcurrency = Number(process.env.BOT_CACHE_CONCURRENCY) || 3;
        const memberCacheMax = Number(process.env.BOT_MEMBER_CACHE_MAX) || 2000;
        const cacheMembers =
          parseBool(process.env.BOT_CACHE_MEMBERS) ||
          process.env.BOT_CACHE_MEMBERS == null;

        const safeFetch = async (guild, label, fn) => {
          if (bot.runtime?.shuttingDown) return;
          try {
            await fn();
          } catch (err) {
            if (bot.runtime?.shuttingDown) return;
            const msg = err?.message || String(err);
            if (msg.includes("Shard") && msg.includes("not found")) return;
            bot.logger.debug(
              "DISCORD",
              `[${guild.id}] Cache fetch failed (${label}): ${msg}`,
            );
          }
        };

        let cursor = 0;
        const workerCount = Math.max(
          1,
          Math.min(maxConcurrency, guilds.length),
        );

        const workers = Array.from({ length: workerCount }, async () => {
          while (cursor < guilds.length) {
            const index = cursor++;
            const guild = guilds[index];

            if (!guild.available) {
              bot.logger.info(
                "DISCORD",
                `[${guild.id}] I'm not available! Will not be able to cache.`,
              );
              continue;
            }

            // Light stagger to reduce rate-limit bursts.
            if (index % 10 === 0) await bot.functions.sleep(500);

            if (
              bot.runtime?.shuttingDown ||
              bot.client?.isReady?.() === false
            ) {
              return;
            }

            const tasks = [
              safeFetch(guild, "channels", () => guild.channels.fetch()),
              safeFetch(guild, "roles", () => guild.roles.fetch()),
            ];

            if (cacheMembers && guild.memberCount <= memberCacheMax) {
              tasks.push(
                safeFetch(guild, "members", () => guild.members.fetch()),
              );
            }

            await Promise.all(tasks);

            bot.logger.debug(
              "DISCORD",
              `[${guild.id}] Cached ${guild.members.cache.size} members, ${guild.channels.cache.size} channels, and ${guild.roles.cache.size} roles.`,
            );
            servCount++;
          }
        });

        Promise.all(workers)
          .then(() => {
            bot.logger.debug(
              "DISCORD",
              `Cached ${servCount}/${bot.client.guilds.cache.size} guilds!`,
            );
          })
          .catch((err) => {
            bot.logger.debug(
              "DISCORD",
              `Error occurred during caching!\n${err}`,
            );
          });
      }
    }, 1500); // Give any extra time to show other stuff.
    if (bot.runtime?.timers) bot.runtime.timers.add(cacheTimeout);
  },
});
