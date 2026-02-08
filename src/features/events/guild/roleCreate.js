/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "roleCreate",
  run: async (bot, params) => {
    const [role] = params;

    bot.logger.info(
      "DISCORD",
      `Role created: ${role.name} in guild ${role.guild.name} (${role.guild.id})`,
    );

    let createEntry = null;
    if (bot.utils.auditLog) {
      createEntry = await bot.utils.auditLog.fetchLatest(
        role.guild,
        "RoleCreate",
        role.id,
      );
      if (createEntry && Date.now() - createEntry.createdTimestamp > 10000) {
        createEntry = null;
      }
    }

    // Create a role creation embed
    const roleEmbed = new EmbedBuilder()
      .setColor(role.color || bot.config.colors.blue) // Use role color if available, otherwise default
      .setTitle("Role Created")
      .setDescription(`A new role has been created in ${role.guild.name}`)
      .addFields(
        { name: "Role Name", value: role.name, inline: true },
        { name: "Role ID", value: role.id, inline: true },
        { name: "Color", value: role.hexColor, inline: true },
        { name: "Position", value: role.position.toString(), inline: true },
        {
          name: "Mentionable",
          value: role.mentionable ? "Yes" : "No",
          inline: true,
        },
        { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
      )
      .setFooter({
        text: `Server: ${role.guild.name}`,
        iconURL: role.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (createEntry?.executor) {
      roleEmbed.addFields({
        name: "Created By",
        value: `<@${createEntry.executor.id}>`,
        inline: true,
      });
    }

    if (createEntry?.reason) {
      roleEmbed.addFields({
        name: "Reason",
        value: createEntry.reason,
      });
    }

    // Try to send the role creation message to the aclevo-bot-logs channel
    try {
      const logChannel = bot.functions.getLogChannel(role.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [roleEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send role creation message: ${error.message}`,
      );
    }
  },
});
