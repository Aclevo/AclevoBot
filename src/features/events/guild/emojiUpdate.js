import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "emojiUpdate",
  run: async (bot, params) => {
    const [oldEmoji, newEmoji] = params;

    bot.logger.info(
      "DISCORD",
      `Emoji updated: ${newEmoji.name} in guild ${newEmoji.guild.name} (${newEmoji.guild.id})`,
    );

    let updateEntry = null;
    if (bot.utils.auditLog) {
      updateEntry = await bot.utils.auditLog.fetchLatest(
        newEmoji.guild,
        "EmojiUpdate",
        newEmoji.id,
      );
      if (updateEntry && Date.now() - updateEntry.createdTimestamp > 10000) {
        updateEntry = null;
      }
    }

    const updateEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Emoji Updated")
      .setDescription(`An emoji was updated in ${newEmoji.guild.name}`)
      .addFields(
        { name: "Emoji ID", value: newEmoji.id, inline: true },
        {
          name: "Animated",
          value: newEmoji.animated ? "Yes" : "No",
          inline: true,
        },
      )
      .setThumbnail(newEmoji.url)
      .setFooter({
        text: `Server: ${newEmoji.guild.name}`,
        iconURL: newEmoji.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (updateEntry?.executor) {
      updateEmbed.addFields({
        name: "Updated By",
        value: `<@${updateEntry.executor.id}>`,
        inline: true,
      });
    }

    if (updateEntry?.reason) {
      updateEmbed.addFields({
        name: "Reason",
        value: updateEntry.reason,
      });
    }

    if (oldEmoji.name !== newEmoji.name) {
      updateEmbed.addFields(
        { name: "Old Name", value: oldEmoji.name, inline: true },
        { name: "New Name", value: newEmoji.name, inline: true },
      );
    }

    updateEmbed.addFields({
      name: "URL",
      value: `[Link](${newEmoji.url})`,
      inline: true,
    });

    try {
      const logChannel = bot.functions.getLogChannel(newEmoji.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [updateEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send emoji update message: ${error.message}`,
      );
    }
  },
});
