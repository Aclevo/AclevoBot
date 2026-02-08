/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "autoModerationRuleDelete",
  run: async (bot, params) => {
    const [rule] = params;
    const guild = rule.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `AutoMod rule deleted: ${rule.name} in ${guild.name} (${guild.id})`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("AutoMod Rule Deleted")
      .setDescription(`An AutoMod rule was deleted in ${guild.name}`)
      .addFields(
        { name: "Rule Name", value: rule.name, inline: true },
        { name: "Rule ID", value: rule.id, inline: true },
        { name: "Enabled", value: rule.enabled ? "Yes" : "No", inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (rule.creatorId) {
      embed.addFields({
        name: "Creator",
        value: `<@${rule.creatorId}>`,
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
        `Could not send AutoMod delete message: ${error.message}`,
      );
    }
  },
});
