/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder, ChannelType } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "channelDelete",
  run: async (bot, params) => {
    const [channel] = params;

    bot.logger.info(
      "DISCORD",
      `Channel deleted: #${channel.name} in guild ${channel.guild.name} (${channel.guild.id})`,
    );

    // Determine channel type for embed
    const channelTypeMap = {
      [ChannelType.GuildText]: "Text Channel",
      [ChannelType.GuildVoice]: "Voice Channel",
      [ChannelType.GuildCategory]: "Category",
      [ChannelType.GuildAnnouncement]: "Announcement Channel",
      [ChannelType.GuildStageVoice]: "Stage Channel",
      [ChannelType.PrivateThread]: "Private Thread",
      [ChannelType.PublicThread]: "Public Thread",
      [ChannelType.GuildForum]: "Forum Channel",
    };

    const channelTypeName =
      channelTypeMap[channel.type] || "Unknown Channel Type";

    let deleteEntry = null;
    if (bot.utils.auditLog) {
      deleteEntry = await bot.utils.auditLog.fetchLatest(
        channel.guild,
        "ChannelDelete",
        channel.id,
      );
      if (deleteEntry && Date.now() - deleteEntry.createdTimestamp > 10000) {
        deleteEntry = null;
      }
    }

    // Create a channel deletion embed
    const channelEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red) // Using the color defined in config
      .setTitle("Channel Deleted")
      .setDescription(`A channel has been deleted in ${channel.guild.name}`)
      .addFields(
        { name: "Channel Name", value: `#${channel.name}`, inline: true },
        { name: "Channel Type", value: channelTypeName, inline: true },
        { name: "Channel ID", value: channel.id, inline: true },
        {
          name: "Created",
          value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${channel.guild.name}`,
        iconURL: channel.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (deleteEntry?.executor) {
      channelEmbed.addFields({
        name: "Deleted By",
        value: `<@${deleteEntry.executor.id}>`,
        inline: true,
      });
    }

    if (deleteEntry?.reason) {
      channelEmbed.addFields({
        name: "Reason",
        value: deleteEntry.reason,
      });
    }

    // Try to send the channel deletion message to the aclevo-bot-logs channel
    try {
      const logChannel = bot.functions.getLogChannel(channel.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [channelEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send channel deletion message: ${error.message}`,
      );
    }
  },
});
