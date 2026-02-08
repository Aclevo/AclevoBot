/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageReactionRemoveAll",
  run: async (bot, params) => {
    const [message] = params;
    const guild = message.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `All reactions removed from message ${message.id} in #${message.channel.name}`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("All Reactions Removed")
      .setDescription(`All reactions were removed in #${message.channel.name}`)
      .addFields(
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
        `Could not send reaction remove all message: ${error.message}`,
      );
    }
  },
});
