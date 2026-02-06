/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "roleDelete",
  run: async (bot, params) => {
    const [role] = params;

    bot.logger.info(
      "DISCORD",
      `Role deleted: ${role.name} in guild ${role.guild.name} (${role.guild.id})`,
    );

    // Create a role deletion embed
    const roleEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red) // Red for deletion
      .setTitle("Role Deleted")
      .setDescription(`A role has been deleted in ${role.guild.name}`)
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
  
      // Try to send the role deletion message to the aclevo-bot-logs channel
      try {
        // Look for the hardcoded "aclevo-bot-logs" channel
        const logChannel = role.guild.channels.cache.find(
          (ch) => ch.name === "aclevo-bot-logs" && ch.type === 0, // Text channel
        );
  
        if (logChannel) {
          await logChannel.send({ embeds: [roleEmbed] });
        }
      } catch (error) {
        bot.logger.warn(
          "DISCORD",
          `Could not send role deletion message: ${error.message}`,
        );
      }
    
  },
});
