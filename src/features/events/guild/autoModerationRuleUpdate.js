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
  name: "autoModerationRuleUpdate",
  run: async (bot, params) => {
    const [oldRule, newRule] = params;
    const guild = newRule.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `AutoMod rule updated: ${newRule.name} in ${guild.name} (${guild.id})`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("AutoMod Rule Updated")
      .setDescription(`An AutoMod rule was updated in ${guild.name}`)
      .addFields(
        { name: "Rule Name", value: newRule.name, inline: true },
        { name: "Rule ID", value: newRule.id, inline: true },
        { name: "Enabled", value: newRule.enabled ? "Yes" : "No", inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (oldRule.name !== newRule.name) {
      embed.addFields(
        { name: "Old Name", value: oldRule.name, inline: true },
        { name: "New Name", value: newRule.name, inline: true },
      );
    }

    if (oldRule.enabled !== newRule.enabled) {
      embed.addFields(
        { name: "Old Enabled", value: oldRule.enabled ? "Yes" : "No", inline: true },
        { name: "New Enabled", value: newRule.enabled ? "Yes" : "No", inline: true },
      );
    }

    if (oldRule.exemptRoles?.size !== newRule.exemptRoles?.size) {
      const oldRoles = oldRule.exemptRoles?.map((role) => `<@&${role.id}>`).join(", ") || "None";
      const newRoles = newRule.exemptRoles?.map((role) => `<@&${role.id}>`).join(", ") || "None";
      embed.addFields(
        { name: "Old Exempt Roles", value: formatValue(oldRoles) },
        { name: "New Exempt Roles", value: formatValue(newRoles) },
      );
    }

    if (oldRule.exemptChannels?.size !== newRule.exemptChannels?.size) {
      const oldCh = oldRule.exemptChannels?.map((ch) => `<#${ch.id}>`).join(", ") || "None";
      const newCh = newRule.exemptChannels?.map((ch) => `<#${ch.id}>`).join(", ") || "None";
      embed.addFields(
        { name: "Old Exempt Channels", value: formatValue(oldCh) },
        { name: "New Exempt Channels", value: formatValue(newCh) },
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
        `Could not send AutoMod update message: ${error.message}`,
      );
    }
  },
});
