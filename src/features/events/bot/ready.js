/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { Routes, REST } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "clientReady",
  run: async (bot, params) => {
    // bot.footerText = bot.footerText.replaceAll("%currentYear%", new Date().getFullYear());
    bot.logger.info("DISCORD", `Logged in as ${bot.client.user.tag}`);

    if (
      bot.commands &&
      (bot.commands ? bot.commands.slash_data : false) &&
      bot.config.discord.registerCommandsOnStart
    ) {
      const startRegister = new Date().getTime();
      bot.logger.info("DISCORD", "Now registering slash commands...");
      const rest = new REST({ version: "10" }).setToken(
        bot.config.discord.token,
      );
      try {
        await rest.put(Routes.applicationCommands(bot.client.user.id), {
          body: bot.commands.slash_data,
        });
        bot.logger.debug(
          "DISCORD",
          `Successfully registered all slash commands in ${new Date().getTime() - startRegister}ms.`,
        );
      } catch (Ex) {
        bot.logger.error("DISCORD", `Could not register slash commands.`);
        console.log(Ex);
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
        const guildPromises = [];

        const guilds = Array.from(bot.client.guilds.cache.values());
        for (const [index, guild] of guilds.entries()) {
          if (!guild.available) {
            bot.logger.info(
              "DISCORD",
              `[${guild.id}] I'm not available! Will not be able to cache.`,
            );
            continue;
          }

          // Add delay every 10th guild to prevent rate limiting
          const delay = index % 10 == 0 ? 1000 : 0;

          const safeFetch = async (label, fn) => {
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

          const promise = (async () => {
            if (delay > 0) await bot.functions.sleep(delay);
            if (
              bot.runtime?.shuttingDown ||
              bot.client?.isReady?.() === false
            ) {
              return;
            }

            // Fetch all resources concurrently for each guild
            await Promise.all([
              safeFetch("members", () => guild.members.fetch()),
              safeFetch("channels", () => guild.channels.fetch()),
              safeFetch("roles", () => guild.roles.fetch()),
            ]);

            bot.logger.debug(
              "DISCORD",
              `[${guild.id}] Cached ${guild.members.cache.size} members, ${guild.channels.cache.size} channels, and ${guild.roles.cache.size} roles.`,
            );
            servCount++;
          })();

          guildPromises.push(promise);
        }
        Promise.all(guildPromises)
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
