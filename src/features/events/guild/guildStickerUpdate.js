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
  name: "guildStickerUpdate",
  run: async (bot, params) => {
    const [oldSticker, newSticker] = params;
    const guild = newSticker.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Sticker updated: ${newSticker.name} in guild ${guild.name} (${guild.id})`,
    );

    let updateEntry = null;
    if (bot.utils.auditLog) {
      updateEntry = await bot.utils.auditLog.fetchLatest(
        guild,
        "StickerUpdate",
        newSticker.id,
      );
      if (updateEntry && Date.now() - updateEntry.createdTimestamp > 10000) {
        updateEntry = null;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Sticker Updated")
      .setDescription(`A sticker was updated in ${guild.name}`)
      .addFields(
        { name: "Sticker Name", value: newSticker.name, inline: true },
        { name: "Sticker ID", value: newSticker.id, inline: true },
        { name: "Format", value: `${newSticker.format}`, inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (updateEntry?.executor) {
      embed.addFields({
        name: "Updated By",
        value: `<@${updateEntry.executor.id}>`,
        inline: true,
      });
    }

    if (updateEntry?.reason) {
      embed.addFields({
        name: "Reason",
        value: updateEntry.reason,
      });
    }

    if (oldSticker.name !== newSticker.name) {
      embed.addFields(
        { name: "Old Name", value: oldSticker.name, inline: true },
        { name: "New Name", value: newSticker.name, inline: true },
      );
    }

    if (oldSticker.description !== newSticker.description) {
      embed.addFields(
        { name: "Old Description", value: formatValue(oldSticker.description) },
        { name: "New Description", value: formatValue(newSticker.description) },
      );
    }

    if (oldSticker.tags !== newSticker.tags) {
      embed.addFields(
        { name: "Old Tags", value: formatValue(oldSticker.tags) },
        { name: "New Tags", value: formatValue(newSticker.tags) },
      );
    }

    if (newSticker.url) {
      embed.setThumbnail(newSticker.url);
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send sticker update message: ${error.message}`,
      );
    }
  },
});
