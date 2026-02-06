/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildCreate",
  run: async (bot, params) => {
    const [guild] = params;

    bot.logger.info(
      "DISCORD",
      `Joined guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`,
    );

    // Create a join embed
    const joinEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.green) // Using the color defined in config
      .setTitle(`Added to Server: ${guild.name}`)
      .setDescription(`Thanks for inviting me to your server!`)
      .addFields(
        { name: "Server Name", value: guild.name, inline: true },
        { name: "Server ID", value: guild.id, inline: true },
        {
          name: "Member Count",
          value: `${guild.memberCount} members`,
          inline: true,
          },
          {
            name: "Created",
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
          {
            name: "Region",
            value: guild.preferredLocale || "Not set",
            inline: true,
          },
        )
        .setThumbnail(guild.iconURL({ dynamic: true }) || null)
        .setFooter({
          text: `Bot is now in ${bot.client.guilds.cache.size} servers`,
          iconURL: bot.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();
  
      // Try to send the join message to the aclevo-bot-logs channel
      try {
        // Look for the hardcoded "aclevo-bot-logs" channel
        const logChannel = guild.channels.cache.find(
          (ch) => ch.name === "aclevo-bot-logs" && ch.type === 0, // Text channel
        );
  
        if (logChannel) {
          await logChannel.send({ embeds: [joinEmbed] });
        }
      } catch (error) {
        bot.logger.warn(
          "DISCORD",
          `Could not send join message: ${error.message}`,
        );
      }
    
  },
});
