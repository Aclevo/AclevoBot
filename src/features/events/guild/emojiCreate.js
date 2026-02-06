/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "emojiCreate",
  run: async (bot, params) => {
    const [emoji] = params;

    bot.logger.info(
      "DISCORD",
      `Emoji created: ${emoji.name} in guild ${emoji.guild.name} (${emoji.guild.id})`,
    );

    // Create an emoji creation embed
    const emojiEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.green) // Green for creation
      .setTitle("Emoji Created")
      .setDescription(`A new emoji has been created in ${emoji.guild.name}`)
      .addFields(
        { name: "Emoji Name", value: emoji.name, inline: true },
        { name: "Emoji ID", value: emoji.id, inline: true },
        {
          name: "Animated",
          value: emoji.animated ? "Yes" : "No",
          inline: true,
          },
          { name: "URL", value: `[Link](${emoji.url})`, inline: true },
        )
        .setThumbnail(emoji.url) // Show the emoji as thumbnail
        .setFooter({
          text: `Server: ${emoji.guild.name}`,
          iconURL: emoji.guild.iconURL({ dynamic: true }) || undefined,
        })
        .setTimestamp();
  
      // Try to send the emoji creation message to the aclevo-bot-logs channel
      try {
        // Look for the hardcoded "aclevo-bot-logs" channel
        const logChannel = emoji.guild.channels.cache.find(
          (ch) => ch.name === "aclevo-bot-logs" && ch.type === 0, // Text channel
        );
  
        if (logChannel) {
          await logChannel.send({ embeds: [emojiEmbed] });
        }
      } catch (error) {
        bot.logger.warn(
          "DISCORD",
          `Could not send emoji creation message: ${error.message}`,
        );
      }
    
  },
});
