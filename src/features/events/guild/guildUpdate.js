import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildUpdate",
  run: async (bot, params) => {
    const [oldGuild, newGuild] = params;

    bot.logger.info(
      "DISCORD",
      `Guild updated: ${newGuild.name} (${newGuild.id})`,
    );

    const updateEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Guild Updated")
      .setDescription(`A guild was updated: ${newGuild.name}`)
      .addFields({ name: "Guild ID", value: newGuild.id, inline: true })
      .setFooter({
        text: `Server: ${newGuild.name}`,
        iconURL: newGuild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (oldGuild.name !== newGuild.name) {
      updateEmbed.addFields(
        { name: "Old Name", value: oldGuild.name, inline: true },
        { name: "New Name", value: newGuild.name, inline: true },
      );
    }

    if (oldGuild.description !== newGuild.description) {
      updateEmbed.addFields(
        { name: "Old Description", value: oldGuild.description || "None" },
        { name: "New Description", value: newGuild.description || "None" },
      );
    }

    if (oldGuild.icon !== newGuild.icon) {
      const oldIcon = oldGuild.iconURL({ dynamic: true });
      const newIcon = newGuild.iconURL({ dynamic: true });

      updateEmbed.addFields({
        name: "Icon Updated",
        value:
          oldIcon && newIcon
            ? `[Old Icon](${oldIcon}) → [New Icon](${newIcon})`
            : "Yes",
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(newGuild);

      if (logChannel) {
        await logChannel.send({ embeds: [updateEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send guild update message: ${error.message}`,
      );
    }
  },
});
