/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageDelete",
  run: async (bot, params) => {
    const [message] = params;

    // Skip if message is from a bot
    if (message.author?.bot) return;

    bot.logger.info(
      "DISCORD",
      `Message by ${message.author?.tag || "unknown"} deleted in #${message.channel.name}`,
    );

    let deleteEntry = null;
    if (message.guild && bot.utils.auditLog && message.author?.id) {
      deleteEntry = await bot.utils.auditLog.fetchLatest(
        message.guild,
        "MessageDelete",
        message.author.id,
      );
      const isRecent =
        deleteEntry && Date.now() - deleteEntry.createdTimestamp <= 10000;
      const channelMatch =
        deleteEntry?.extra?.channel?.id === message.channel.id;
      if (!isRecent || !channelMatch) deleteEntry = null;
    }

    // Create a message deletion embed
    const deleteEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red) // Red for deletion
      .setTitle("Message Deleted")
      .setDescription(`A message was deleted in #${message.channel.name}`)
      .addFields(
        {
          name: "Author",
          value: message.author ? `<@${message.author.id}>` : "Unknown",
          inline: true,
        },
        {
          name: "Author Tag",
          value: message.author?.tag || "Unknown",
          inline: true,
        },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Message ID", value: message.id, inline: true },
      )
      .setFooter({
        text: `Server: ${message.guild?.name || "DM"}`,
        iconURL: message.guild?.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (deleteEntry?.executor) {
      deleteEmbed.addFields({
        name: "Deleted By",
        value: `<@${deleteEntry.executor.id}>`,
        inline: true,
      });
    }

    if (deleteEntry?.reason) {
      deleteEmbed.addFields({
        name: "Reason",
        value: deleteEntry.reason,
      });
    }

    // Add message content if available (truncate if too long)
    if (message.content) {
      const content =
        message.content.length > 1024
          ? message.content.substring(0, 1020) + "..."
          : message.content;
      deleteEmbed.addFields({ name: "Deleted Content", value: content });
    }

    // Try to send the message deletion message to the aclevo-bot-logs channel
    try {
      const logChannel = bot.functions.getLogChannel(message.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [deleteEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send message deletion message: ${error.message}`,
      );
    }
  },
});
