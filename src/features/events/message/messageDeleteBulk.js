import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageDeleteBulk",
  run: async (bot, params) => {
    const [messages] = params;

    bot.logger.info(
      "DISCORD",
      `Bulk message deletion: ${messages.size} messages deleted in a channel`,
    );

    const sampleMessage = messages.first();
    const channel = sampleMessage?.channel || null;
    const guild = sampleMessage?.guild || channel?.guild || null;

    if (!guild) return;

    let bulkEntry = null;
    if (bot.utils.auditLog) {
      bulkEntry = await bot.utils.auditLog.fetchLatest(
        guild,
        "MessageBulkDelete",
      );
      const isRecent =
        bulkEntry && Date.now() - bulkEntry.createdTimestamp <= 10000;
      const channelMatch = bulkEntry?.extra?.channel?.id
        ? bulkEntry.extra.channel.id === channel?.id
        : true;
      if (!isRecent || !channelMatch) bulkEntry = null;
    }

    const deleteEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("Bulk Messages Deleted")
      .setDescription(
        channel
          ? `Messages were deleted in <#${channel.id}>`
          : "Messages were deleted in an unknown channel",
      )
      .addFields(
        { name: "Count", value: `${messages.size}`, inline: true },
        channel
          ? { name: "Channel", value: `<#${channel.id}>`, inline: true }
          : { name: "Channel", value: "Unknown", inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (bulkEntry?.executor) {
      deleteEmbed.addFields({
        name: "Deleted By",
        value: `<@${bulkEntry.executor.id}>`,
        inline: true,
      });
    }

    if (bulkEntry?.reason) {
      deleteEmbed.addFields({
        name: "Reason",
        value: bulkEntry.reason,
      });
    }

    const sampleIds = messages.map((message) => message.id).slice(0, 5);
    if (sampleIds.length > 0) {
      deleteEmbed.addFields({
        name: "Sample Message IDs",
        value: sampleIds.join(", "),
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);

      if (logChannel) {
        await logChannel.send({ embeds: [deleteEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send bulk delete message: ${error.message}`,
      );
    }
  },
});
