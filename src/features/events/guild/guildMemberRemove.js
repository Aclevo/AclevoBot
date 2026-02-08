/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildMemberRemove",
  run: async (bot, params) => {
    const [member] = params;

    bot.logger.info(
      "DISCORD",
      `${member.user.tag} left guild ${member.guild.name} (${member.guild.id})`,
    );

    // Create a goodbye embed
    const goodbyeEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red) // Using the color defined in config
      .setTitle(`Goodbye from ${member.guild.name}`)
      .setDescription(`<@${member.user.id}> has left the server`)
      .addFields(
        { name: "User Tag", value: member.user.tag, inline: true },
        {
          name: "Member Since",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
          inline: true,
          },
          {
            name: "Final Member Count",
            value: `${member.guild.memberCount} members`,
            inline: true,
          },
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `ID: ${member.user.id}`,
          iconURL: member.guild.iconURL({ dynamic: true }) || undefined,
        })
        .setTimestamp();
  
      // Try to send the goodbye message to the aclevo-bot-logs channel
      try {
        const logChannel = bot.functions.getLogChannel(member.guild);
  
        // Send the goodbye message if we found the channel
        if (logChannel) {
          await logChannel.send({ embeds: [goodbyeEmbed] });
        }
      } catch (error) {
        bot.logger.warn(
          "DISCORD",
          `Could not send goodbye message: ${error.message}`,
        );
      }
    
  },
});
