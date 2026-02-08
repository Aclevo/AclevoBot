/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildStickerCreate",
  run: async (bot, params) => {
    const [sticker] = params;
    const guild = sticker.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Sticker created: ${sticker.name} in guild ${guild.name} (${guild.id})`,
    );

    let createEntry = null;
    if (bot.utils.auditLog) {
      createEntry = await bot.utils.auditLog.fetchLatest(
        guild,
        "StickerCreate",
        sticker.id,
      );
      if (createEntry && Date.now() - createEntry.createdTimestamp > 10000) {
        createEntry = null;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.green)
      .setTitle("Sticker Created")
      .setDescription(`A new sticker was created in ${guild.name}`)
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

    if (createEntry?.executor) {
      embed.addFields({
        name: "Created By",
        value: `<@${createEntry.executor.id}>`,
        inline: true,
      });
    }

    if (createEntry?.reason) {
      embed.addFields({
        name: "Reason",
        value: createEntry.reason,
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
        `Could not send sticker create message: ${error.message}`,
      );
    }
  },
});
