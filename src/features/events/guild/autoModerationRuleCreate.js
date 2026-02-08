/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "autoModerationRuleCreate",
  run: async (bot, params) => {
    const [rule] = params;
    const guild = rule.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `AutoMod rule created: ${rule.name} in ${guild.name} (${guild.id})`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.green)
      .setTitle("AutoMod Rule Created")
      .setDescription(`An AutoMod rule was created in ${guild.name}`)
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
        `Could not send AutoMod create message: ${error.message}`,
      );
    }
  },
});
