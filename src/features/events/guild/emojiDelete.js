/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "emojiDelete",
  run: async (bot, params) => {
    const [emoji] = params;

    bot.logger.info(
      "DISCORD",
      `Emoji deleted: ${emoji.name} in guild ${emoji.guild.name} (${emoji.guild.id})`,
    );

    // Create an emoji deletion embed
    const emojiEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red) // Red for deletion
      .setTitle("Emoji Deleted")
      .setDescription(`An emoji has been deleted in ${emoji.guild.name}`)
      .addFields(
        { name: "Emoji Name", value: emoji.name, inline: true },
        { name: "Emoji ID", value: emoji.id, inline: true },
        {
          name: "Animated",
          value: emoji.animated ? "Yes" : "No",
          inline: true,
          },
        )
        .setFooter({
          text: `Server: ${emoji.guild.name}`,
          iconURL: emoji.guild.iconURL({ dynamic: true }) || undefined,
        })
        .setTimestamp();
  
      // Try to send the emoji deletion message to the aclevo-bot-logs channel
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
          `Could not send emoji deletion message: ${error.message}`,
        );
      }
    
  },
});
