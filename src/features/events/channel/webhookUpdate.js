/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "webhookUpdate",
  run: async (bot, params) => {
    const [channel] = params;
    const guild = channel.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Webhook updated in #${channel.name} (${channel.id}) in guild ${guild.name} (${guild.id})`,
    );

    let updateEntry = null;
    if (bot.utils.auditLog) {
      updateEntry = await bot.utils.auditLog.fetchLatest(
        guild,
        "WebhookUpdate",
      );
      const isRecent =
        updateEntry && Date.now() - updateEntry.createdTimestamp <= 10000;
      const channelMatch = updateEntry?.extra?.channel?.id
        ? updateEntry.extra.channel.id === channel.id
        : true;
      if (!isRecent || !channelMatch) updateEntry = null;
    }

    const webhookEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Webhook Updated")
      .setDescription(`A webhook was updated in ${guild.name}`)
      .addFields(
        { name: "Channel", value: `<#${channel.id}>`, inline: true },
        { name: "Channel ID", value: channel.id, inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (updateEntry?.executor) {
      webhookEmbed.addFields({
        name: "Updated By",
        value: `<@${updateEntry.executor.id}>`,
        inline: true,
      });
    }

    if (updateEntry?.reason) {
      webhookEmbed.addFields({
        name: "Reason",
        value: updateEntry.reason,
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [webhookEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send webhook update message: ${error.message}`,
      );
    }
  },
});
