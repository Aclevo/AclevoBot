import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "inviteCreate",
  run: async (bot, params) => {
    const [invite] = params;

    bot.logger.info(
      "DISCORD",
      `Invite created in ${invite.guild.name} by ${invite.inviter?.tag || "unknown"} - Code: ${invite.code}`,
    );

    const formatDate = (date) =>
      date ? `<t:${Math.floor(date.getTime() / 1000)}:R>` : "Never";

    let createEntry = null;
    if (bot.utils.auditLog) {
      createEntry = await bot.utils.auditLog.fetchLatest(
        invite.guild,
        "InviteCreate",
      );
      if (createEntry && Date.now() - createEntry.createdTimestamp > 10000) {
        createEntry = null;
      }
    }

    const inviteEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.green)
      .setTitle("Invite Created")
      .setDescription(`An invite was created in ${invite.guild.name}`)
      .addFields(
        { name: "Code", value: invite.code, inline: true },
        {
          name: "Channel",
          value: invite.channel ? `<#${invite.channel.id}>` : "Unknown",
          inline: true,
        },
        {
          name: "Inviter",
          value: invite.inviter ? `<@${invite.inviter.id}>` : "Unknown",
          inline: true,
        },
        { name: "Max Uses", value: `${invite.maxUses || 0}`, inline: true },
        { name: "Uses", value: `${invite.uses || 0}`, inline: true },
        {
          name: "Temporary",
          value: invite.temporary ? "Yes" : "No",
          inline: true,
        },
        { name: "Expires", value: formatDate(invite.expiresAt), inline: true },
      )
      .setFooter({
        text: `Server: ${invite.guild.name}`,
        iconURL: invite.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (createEntry?.executor) {
      inviteEmbed.addFields({
        name: "Created By",
        value: `<@${createEntry.executor.id}>`,
        inline: true,
      });
    }

    if (createEntry?.reason) {
      inviteEmbed.addFields({
        name: "Reason",
        value: createEntry.reason,
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(invite.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [inviteEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send invite create message: ${error.message}`,
      );
    }
  },
});
