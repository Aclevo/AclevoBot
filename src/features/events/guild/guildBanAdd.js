import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildBanAdd",
  run: async (bot, params) => {
    const [ban] = params;

    bot.logger.info(
      "DISCORD",
      `${ban.user.tag} was banned from ${ban.guild.name} (${ban.guild.id})`,
    );

    let banEntry = null;
    if (bot.utils.auditLog) {
      banEntry = await bot.utils.auditLog.fetchLatest(
        ban.guild,
        "MemberBanAdd",
        ban.user.id,
      );
      if (banEntry && Date.now() - banEntry.createdTimestamp > 10000) {
        banEntry = null;
      }
    }

    const banEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("User Banned")
      .setDescription(`A user was banned from ${ban.guild.name}`)
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

    if (banEntry?.executor) {
      banEmbed.addFields({
        name: "Banned By",
        value: `<@${banEntry.executor.id}>`,
        inline: true,
      });
    }

    const reason = banEntry?.reason || ban.reason;
    if (reason) {
      banEmbed.addFields({ name: "Reason", value: reason });
    }

    try {
      const logChannel = bot.functions.getLogChannel(ban.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [banEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send ban message: ${error.message}`,
      );
    }
  },
});
