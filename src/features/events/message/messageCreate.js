/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageCreate",
  run: async (bot, params) => {
    const [message] = params;

    // Skip if message is from a bot
    if (message.author.bot) return;

    // Add function to auto-publish announcements
    if (message.channel.name === "announcements") {
      await message.crosspost();
      return;
    }

    if (message.channel.name === "trashcan") {
      // Disboard's Bot ID
      if (message.author.id == "302050872383242240") {
        await message.reply(
          "Server bumped! A reminder will be sent in 2 hours.",
        );
        setTimeout(
          () => {
            const bumpEmbed = new EmbedBuilder()
              .setColor(bot.config.colors.blue)
              .setTitle("Bump")
              .setDescription(
                "It's time to bump the server! Do /bump to bump the server.",
              )
              .setFooter({
                text: `Bumping the server helps keep it alive.`,
              })
              .setTimestamp();

            const bumpRole = message.guild.roles.cache.find(
              (role) => role.name === "Bumpers",
            );
            message.channel.send(`<@&${bumpRole.id}>`, { embeds: [bumpEmbed] });
          },
          1000 * 60 * 60 * 2,
        );
      }
      return;
    }

    // Handle bot mentions
    if (
      message.mentions.has(bot.client.user.id) &&
      !message.mentions.everyone &&
      !message.reference
    ) {
      // Respond to bot mentions with prefix info using an embed
      try {
        const mentionEmbed = new EmbedBuilder()
          .setColor(bot.config.colors.blue)
          .setTitle("Hello there!")
          .setDescription(
            `Please use the slash commands. Do /help for more information.`,
          )
          .setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await message.reply({ embeds: [mentionEmbed] });
      } catch (err) {
        bot.logger.warn(
          "DISCORD",
          `Could not reply to mention: ${err.message}`,
        );
      }
      return;
    }
  },
});
