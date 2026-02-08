/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageReactionRemoveEmoji",
  run: async (bot, params) => {
    const [reaction] = params;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        bot.logger.warn(
          "DISCORD",
          `Could not fetch partial reaction: ${error.message}`,
        );
        return;
      }
    }

    const message = reaction.message;
    const guild = message.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `All ${reaction.emoji.name} reactions removed from message ${message.id} in #${message.channel.name}`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("Reaction Emoji Cleared")
      .setDescription(`All reactions for an emoji were removed in #${message.channel.name}`)
      .addFields(
        { name: "Emoji", value: reaction.emoji.toString(), inline: true },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Message ID", value: message.id, inline: true },
        { name: "Jump to Message", value: `[Click here](${message.url})`, inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (message.author) {
      embed.addFields({
        name: "Message Author",
        value: `<@${message.author.id}>`,
        inline: true,
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send reaction remove emoji message: ${error.message}`,
      );
    }
  },
});
