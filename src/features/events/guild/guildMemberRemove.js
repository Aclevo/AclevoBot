/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildMemberRemove",
  run: async (bot, params) => {
    const [member] = params;

    bot.logger.info(
      "DISCORD",
      `${member.user.tag} left guild ${member.guild.name} (${member.guild.id})`,
    );

    let kickEntry = null;
    if (bot.utils.auditLog) {
      kickEntry = await bot.utils.auditLog.fetchLatest(
        member.guild,
        "MemberKick",
        member.user.id,
      );
      if (kickEntry && Date.now() - kickEntry.createdTimestamp > 10000) {
        kickEntry = null;
      }
    }

    const isKick = Boolean(kickEntry);

    // Create a goodbye embed
    const goodbyeEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red) // Using the color defined in config
      .setTitle(
        isKick
          ? `Member Kicked from ${member.guild.name}`
          : `Goodbye from ${member.guild.name}`,
      )
      .setDescription(
        isKick
          ? `<@${member.user.id}> was kicked from the server`
          : `<@${member.user.id}> has left the server`,
      )
      .addFields(
        { name: "User Tag", value: member.user.tag, inline: true },
        {
          name: "Member Since",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Final Member Count",
          value: `${member.guild.memberCount} members`,
          inline: true,
        },
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `ID: ${member.user.id}`,
        iconURL: member.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (isKick) {
      goodbyeEmbed.addFields({
        name: "Kicked By",
        value: kickEntry.executor ? `<@${kickEntry.executor.id}>` : "Unknown",
        inline: true,
      });

      if (kickEntry.reason) {
        goodbyeEmbed.addFields({
          name: "Reason",
          value: kickEntry.reason,
        });
      }
    }

    // Try to send the goodbye message to the aclevo-bot-logs channel
    try {
      const logChannel = bot.functions.getLogChannel(member.guild);

      // Send the goodbye message if we found the channel
      if (logChannel) {
        await logChannel.send({ embeds: [goodbyeEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send goodbye message: ${error.message}`,
      );
    }
  },
});
