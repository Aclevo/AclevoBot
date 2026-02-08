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

    let deleteEntry = null;
    if (bot.utils.auditLog) {
      deleteEntry = await bot.utils.auditLog.fetchLatest(
        emoji.guild,
        "EmojiDelete",
        emoji.id,
      );
      if (deleteEntry && Date.now() - deleteEntry.createdTimestamp > 10000) {
        deleteEntry = null;
      }
    }

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

    if (deleteEntry?.executor) {
      emojiEmbed.addFields({
        name: "Deleted By",
        value: `<@${deleteEntry.executor.id}>`,
        inline: true,
      });
    }

    if (deleteEntry?.reason) {
      emojiEmbed.addFields({
        name: "Reason",
        value: deleteEntry.reason,
      });
    }

    // Try to send the emoji deletion message to the aclevo-bot-logs channel
    try {
      const logChannel = bot.functions.getLogChannel(emoji.guild);

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
