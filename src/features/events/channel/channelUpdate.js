import { EmbedBuilder, ChannelType } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "channelUpdate",
  run: async (bot, params) => {
    const [oldChannel, newChannel] = params;

    bot.logger.info(
      "DISCORD",
      `Channel updated: #${newChannel.name} in guild ${newChannel.guild.name} (${newChannel.guild.id})`,
    );

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
      channelTypeMap[newChannel.type] || "Unknown Channel Type";

    const formatValue = (value) =>
      value === null || value === undefined || value === ""
        ? "None"
        : String(value);

    const updateEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Channel Updated")
      .setDescription(`A channel was updated in ${newChannel.guild.name}`)
      .addFields(
        { name: "Channel", value: `#${newChannel.name}`, inline: true },
        { name: "Channel ID", value: newChannel.id, inline: true },
        { name: "Channel Type", value: channelTypeName, inline: true },
      )
      .setFooter({
        text: `Server: ${newChannel.guild.name}`,
        iconURL: newChannel.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (oldChannel.name !== newChannel.name) {
      updateEmbed.addFields(
        { name: "Old Name", value: oldChannel.name, inline: true },
        { name: "New Name", value: newChannel.name, inline: true },
      );
    }

    if ("topic" in newChannel && oldChannel.topic !== newChannel.topic) {
      updateEmbed.addFields(
        { name: "Old Topic", value: formatValue(oldChannel.topic) },
        { name: "New Topic", value: formatValue(newChannel.topic) },
      );
    }

    if ("nsfw" in newChannel && oldChannel.nsfw !== newChannel.nsfw) {
      updateEmbed.addFields(
        {
          name: "Old NSFW",
          value: oldChannel.nsfw ? "Yes" : "No",
          inline: true,
        },
        {
          name: "New NSFW",
          value: newChannel.nsfw ? "Yes" : "No",
          inline: true,
        },
      );
    }

    if (
      "rateLimitPerUser" in newChannel &&
      oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser
    ) {
      updateEmbed.addFields(
        {
          name: "Old Slowmode",
          value: `${oldChannel.rateLimitPerUser || 0}s`,
          inline: true,
        },
        {
          name: "New Slowmode",
          value: `${newChannel.rateLimitPerUser || 0}s`,
          inline: true,
        },
      );
    }

    try {
      const logChannel = bot.functions.getLogChannel(newChannel.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [updateEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send channel update message: ${error.message}`,
      );
    }
  },
});
