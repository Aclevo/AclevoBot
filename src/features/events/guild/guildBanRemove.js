import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildBanRemove",
  run: async (bot, params) => {
    const [ban] = params;

    bot.logger.info(
      "DISCORD",
      `${ban.user.tag} was unbanned from ${ban.guild.name} (${ban.guild.id})`,
    );

    let unbanEntry = null;
    if (bot.utils.auditLog) {
      unbanEntry = await bot.utils.auditLog.fetchLatest(
        ban.guild,
        "MemberBanRemove",
        ban.user.id,
      );
      if (unbanEntry && Date.now() - unbanEntry.createdTimestamp > 10000) {
        unbanEntry = null;
      }
    }

    const unbanEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.green)
      .setTitle("User Unbanned")
      .setDescription(`A user was unbanned from ${ban.guild.name}`)
      .addFields(
        { name: "User", value: `<@${ban.user.id}>`, inline: true },
        { name: "User Tag", value: ban.user.tag, inline: true },
        { name: "User ID", value: ban.user.id, inline: true },
      )
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Server: ${ban.guild.name}`,
        iconURL: ban.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (unbanEntry?.executor) {
      unbanEmbed.addFields({
        name: "Unbanned By",
        value: `<@${unbanEntry.executor.id}>`,
        inline: true,
      });
    }

    const reason = unbanEntry?.reason || ban.reason;
    if (reason) {
      unbanEmbed.addFields({ name: "Reason", value: reason });
    }

    try {
      const logChannel = bot.functions.getLogChannel(ban.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [unbanEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send unban message: ${error.message}`,
      );
    }
  },
});
