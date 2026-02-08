/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "autoModerationActionExecution",
  run: async (bot, params) => {
    const [execution] = params;
    const guild = execution.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `AutoMod action executed in ${guild.name} (${guild.id}) for rule ${execution.ruleId}`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("AutoMod Action Executed")
      .setDescription(`An AutoMod action was executed in ${guild.name}`)
      .addFields(
        { name: "Rule ID", value: execution.ruleId, inline: true },
        { name: "Action Type", value: `${execution.action.type}`, inline: true },
        { name: "User", value: `<@${execution.userId}>`, inline: true },
        {
          name: "Channel",
          value: execution.channelId ? `<#${execution.channelId}>` : "Unknown",
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (execution.ruleName) {
      embed.addFields({ name: "Rule Name", value: execution.ruleName, inline: true });
    }

    if (execution.matchedContent) {
      const content =
        execution.matchedContent.length > 1024
          ? `${execution.matchedContent.slice(0, 1021)}...`
          : execution.matchedContent;
      embed.addFields({ name: "Matched Content", value: content });
    }

    if (execution.matchedKeyword) {
      embed.addFields({ name: "Matched Keyword", value: execution.matchedKeyword });
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send AutoMod action message: ${error.message}`,
      );
    }
  },
});
