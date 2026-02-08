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
  name: "guildAuditLogEntryCreate",
  run: async (bot, params) => {
    const [entry, guild] = params;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Audit log entry created in ${guild.name} (${guild.id}): ${entry.action}`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Audit Log Entry Created")
      .setDescription(`An audit log entry was created in ${guild.name}`)
      .addFields(
        { name: "Action", value: `${entry.action}`, inline: true },
        {
          name: "Executor",
          value: entry.executor ? `<@${entry.executor.id}>` : "Unknown",
          inline: true,
        },
        {
          name: "Target",
          value: entry.target ? `${entry.target}` : "Unknown",
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (entry.reason) {
      embed.addFields({ name: "Reason", value: entry.reason });
    }

    if (entry.changes && entry.changes.length > 0) {
      const changes = entry.changes
        .slice(0, 6)
        .map((change) => `${change.key}: ${formatValue(change.old)} → ${formatValue(change.new)}`)
        .join("\n");
      embed.addFields({
        name: "Changes",
        value: changes.length > 1024 ? `${changes.slice(0, 1021)}...` : changes,
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
        `Could not send audit log message: ${error.message}`,
      );
    }
  },
});
