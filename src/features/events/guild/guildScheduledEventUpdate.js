/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

const formatDate = (date) =>
  date ? `<t:${Math.floor(date.getTime() / 1000)}:F>` : "None";

export default defineEvent({
  name: "guildScheduledEventUpdate",
  run: async (bot, params) => {
    const [oldEvent, newEvent] = params;
    const guild = newEvent.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Scheduled event updated: ${newEvent.name} in ${guild.name} (${guild.id})`,
    );

    let updateEntry = null;
    if (bot.utils.auditLog) {
      updateEntry = await bot.utils.auditLog.fetchLatest(
        guild,
        "GuildScheduledEventUpdate",
        newEvent.id,
      );
      if (updateEntry && Date.now() - updateEntry.createdTimestamp > 10000) {
        updateEntry = null;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Scheduled Event Updated")
      .setDescription(`A scheduled event was updated in ${guild.name}`)
      .addFields(
        { name: "Event Name", value: newEvent.name, inline: true },
        { name: "Event ID", value: newEvent.id, inline: true },
        {
          name: "Channel",
          value: newEvent.channelId ? `<#${newEvent.channelId}>` : "External",
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (updateEntry?.executor) {
      embed.addFields({
        name: "Updated By",
        value: `<@${updateEntry.executor.id}>`,
        inline: true,
      });
    }

    if (updateEntry?.reason) {
      embed.addFields({
        name: "Reason",
        value: updateEntry.reason,
      });
    }

    if (oldEvent.name !== newEvent.name) {
      embed.addFields(
        { name: "Old Name", value: oldEvent.name, inline: true },
        { name: "New Name", value: newEvent.name, inline: true },
      );
    }

    if (oldEvent.description !== newEvent.description) {
      embed.addFields(
        { name: "Old Description", value: oldEvent.description || "None" },
        { name: "New Description", value: newEvent.description || "None" },
      );
    }

    if (
      oldEvent.scheduledStartAt?.getTime() !==
      newEvent.scheduledStartAt?.getTime()
    ) {
      embed.addFields(
        {
          name: "Old Start",
          value: formatDate(oldEvent.scheduledStartAt),
          inline: true,
        },
        {
          name: "New Start",
          value: formatDate(newEvent.scheduledStartAt),
          inline: true,
        },
      );
    }

    if (
      oldEvent.scheduledEndAt?.getTime() !== newEvent.scheduledEndAt?.getTime()
    ) {
      embed.addFields(
        {
          name: "Old End",
          value: formatDate(oldEvent.scheduledEndAt),
          inline: true,
        },
        {
          name: "New End",
          value: formatDate(newEvent.scheduledEndAt),
          inline: true,
        },
      );
    }

    if (oldEvent.status !== newEvent.status) {
      embed.addFields(
        { name: "Old Status", value: `${oldEvent.status}`, inline: true },
        { name: "New Status", value: `${newEvent.status}`, inline: true },
      );
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send scheduled event update message: ${error.message}`,
      );
    }
  },
});
