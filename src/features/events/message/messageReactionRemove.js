import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageReactionRemove",
  run: async (bot, params) => {
    const [reaction, user] = params;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        bot.logger.warn(
          "DISCORD",
          `Could not fetch partial reaction: ${error.message}`,
        );
        return;
      }
    }

    bot.logger.info(
      "DISCORD",
      `${user.tag} removed reaction ${reaction.emoji.name} from message in #${reaction.message.channel.name}`,
    );

    const message = reaction.message;
    const guild = message.guild;
    if (!guild) return;

    const reactionEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("Reaction Removed")
      .setDescription(`A reaction was removed in #${message.channel.name}`)
      .addFields(
        { name: "User", value: `<@${user.id}>`, inline: true },
        { name: "User Tag", value: user.tag, inline: true },
        { name: "Emoji", value: reaction.emoji.toString(), inline: true },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Message ID", value: message.id, inline: true },
        {
          name: "Jump to Message",
          value: `[Click here](${message.url})`,
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (message.author) {
      reactionEmbed.addFields({
        name: "Message Author",
        value: `<@${message.author.id}>`,
        inline: true,
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);

      if (logChannel) {
        await logChannel.send({ embeds: [reactionEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send reaction remove message: ${error.message}`,
      );
    }
  },
});
