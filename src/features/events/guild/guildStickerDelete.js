/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildStickerDelete",
  run: async (bot, params) => {
    const [sticker] = params;
    const guild = sticker.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Sticker deleted: ${sticker.name} in guild ${guild.name} (${guild.id})`,
    );

    let deleteEntry = null;
    if (bot.utils.auditLog) {
      deleteEntry = await bot.utils.auditLog.fetchLatest(
        guild,
        "StickerDelete",
        sticker.id,
      );
      if (deleteEntry && Date.now() - deleteEntry.createdTimestamp > 10000) {
        deleteEntry = null;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("Sticker Deleted")
      .setDescription(`A sticker was deleted in ${guild.name}`)
      .addFields(
        { name: "Sticker Name", value: sticker.name, inline: true },
        { name: "Sticker ID", value: sticker.id, inline: true },
        { name: "Format", value: `${sticker.format}`, inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (deleteEntry?.executor) {
      embed.addFields({
        name: "Deleted By",
        value: `<@${deleteEntry.executor.id}>`,
        inline: true,
      });
    }

    if (deleteEntry?.reason) {
      embed.addFields({
        name: "Reason",
        value: deleteEntry.reason,
      });
    }

    if (sticker.description) {
      embed.addFields({
        name: "Description",
        value:
          sticker.description.length > 1024
            ? `${sticker.description.slice(0, 1021)}...`
            : sticker.description,
      });
    }

    if (sticker.tags) {
      embed.addFields({
        name: "Tags",
        value:
          sticker.tags.length > 1024
            ? `${sticker.tags.slice(0, 1021)}...`
            : sticker.tags,
      });
    }

    if (sticker.url) {
      embed.setThumbnail(sticker.url);
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send sticker delete message: ${error.message}`,
      );
    }
  },
});
