/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "None";
  return String(value);
};

export default defineEvent({
  name: "threadUpdate",
  run: async (bot, params) => {
    const [oldThread, newThread] = params;
    const guild = newThread.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Thread updated: ${newThread.name} in guild ${guild.name} (${guild.id})`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Thread Updated")
      .setDescription(`A thread was updated in ${guild.name}`)
      .addFields(
        { name: "Thread Name", value: newThread.name, inline: true },
        { name: "Thread ID", value: newThread.id, inline: true },
        {
          name: "Parent Channel",
          value: newThread.parent ? `<#${newThread.parent.id}>` : "Unknown",
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (oldThread.name !== newThread.name) {
      embed.addFields(
        { name: "Old Name", value: oldThread.name, inline: true },
        { name: "New Name", value: newThread.name, inline: true },
      );
    }

    if (oldThread.archived !== newThread.archived) {
      embed.addFields(
        { name: "Old Archived", value: oldThread.archived ? "Yes" : "No", inline: true },
        { name: "New Archived", value: newThread.archived ? "Yes" : "No", inline: true },
      );
    }

    if (oldThread.locked !== newThread.locked) {
      embed.addFields(
        { name: "Old Locked", value: oldThread.locked ? "Yes" : "No", inline: true },
        { name: "New Locked", value: newThread.locked ? "Yes" : "No", inline: true },
      );
    }

    if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
      embed.addFields(
        {
          name: "Old Auto-Archive",
          value: formatValue(oldThread.autoArchiveDuration),
          inline: true,
        },
        {
          name: "New Auto-Archive",
          value: formatValue(newThread.autoArchiveDuration),
          inline: true,
        },
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
        `Could not send thread update message: ${error.message}`,
      );
    }
  },
});
