import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "inviteDelete",
  run: async (bot, params) => {
    const [invite] = params;

    bot.logger.info(
      "DISCORD",
      `Invite deleted in ${invite.guild.name} - Code: ${invite.code}`,
    );

    const formatDate = (date) =>
      date ? `<t:${Math.floor(date.getTime() / 1000)}:R>` : "Never";

    const inviteEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("Invite Deleted")
      .setDescription(`An invite was deleted in ${invite.guild.name}`)
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
        { name: "Uses", value: `${invite.uses || 0}`, inline: true },
        { name: "Expires", value: formatDate(invite.expiresAt), inline: true },
      )
      .setFooter({
        text: `Server: ${invite.guild.name}`,
        iconURL: invite.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    try {
      const logChannel = bot.functions.getLogChannel(invite.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [inviteEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send invite delete message: ${error.message}`,
      );
    }
  },
});
