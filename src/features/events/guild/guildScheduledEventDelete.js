/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildScheduledEventDelete",
  run: async (bot, params) => {
    const [scheduledEvent] = params;
    const guild = scheduledEvent.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Scheduled event deleted: ${scheduledEvent.name} in ${guild.name} (${guild.id})`,
    );

    let deleteEntry = null;
    if (bot.utils.auditLog) {
      deleteEntry = await bot.utils.auditLog.fetchLatest(
        guild,
        "GuildScheduledEventDelete",
        scheduledEvent.id,
      );
      if (deleteEntry && Date.now() - deleteEntry.createdTimestamp > 10000) {
        deleteEntry = null;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("Scheduled Event Deleted")
      .setDescription(`A scheduled event was deleted in ${guild.name}`)
      .addFields(
        { name: "Event Name", value: scheduledEvent.name, inline: true },
        { name: "Event ID", value: scheduledEvent.id, inline: true },
        {
          name: "Channel",
          value: scheduledEvent.channelId
            ? `<#${scheduledEvent.channelId}>`
            : "External",
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (deleteEntry?.executor) {
      embed.addFields({
        name: "Deleted By",
        value: `<@${deleteEntry.executor.id}>`,
        inline: true,
      });
    }

    if (deleteEntry?.reason) {
      embed.addFields({
        name: "Reason",
        value: deleteEntry.reason,
      });
    }

    if (scheduledEvent.creatorId) {
      embed.addFields({
        name: "Creator",
        value: `<@${scheduledEvent.creatorId}>`,
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
        `Could not send scheduled event delete message: ${error.message}`,
      );
    }
  },
});
