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

    if (ban.reason) {
      unbanEmbed.addFields({ name: "Reason", value: ban.reason });
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
