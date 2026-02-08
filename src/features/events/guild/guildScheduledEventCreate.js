/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildScheduledEventCreate",
  run: async (bot, params) => {
    const [scheduledEvent] = params;
    const guild = scheduledEvent.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Scheduled event created: ${scheduledEvent.name} in ${guild.name} (${guild.id})`,
    );

    let createEntry = null;
    if (bot.utils.auditLog) {
      createEntry = await bot.utils.auditLog.fetchLatest(
        guild,
        "GuildScheduledEventCreate",
        scheduledEvent.id,
      );
      if (createEntry && Date.now() - createEntry.createdTimestamp > 10000) {
        createEntry = null;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.green)
      .setTitle("Scheduled Event Created")
      .setDescription(`A scheduled event was created in ${guild.name}`)
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
        {
          name: "Start",
          value: scheduledEvent.scheduledStartAt
            ? `<t:${Math.floor(scheduledEvent.scheduledStartAt.getTime() / 1000)}:F>`
            : "Unknown",
          inline: true,
        },
        {
          name: "End",
          value: scheduledEvent.scheduledEndAt
            ? `<t:${Math.floor(scheduledEvent.scheduledEndAt.getTime() / 1000)}:F>`
            : "None",
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (createEntry?.executor) {
      embed.addFields({
        name: "Created By",
        value: `<@${createEntry.executor.id}>`,
        inline: true,
      });
    }

    if (createEntry?.reason) {
      embed.addFields({
        name: "Reason",
        value: createEntry.reason,
      });
    }

    if (scheduledEvent.creatorId) {
      embed.addFields({
        name: "Creator",
        value: `<@${scheduledEvent.creatorId}>`,
        inline: true,
      });
    }

    if (scheduledEvent.description) {
      embed.addFields({
        name: "Description",
        value:
          scheduledEvent.description.length > 1024
            ? `${scheduledEvent.description.slice(0, 1021)}...`
            : scheduledEvent.description,
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
        `Could not send scheduled event create message: ${error.message}`,
      );
    }
  },
});
