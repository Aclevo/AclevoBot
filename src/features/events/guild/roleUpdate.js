import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "roleUpdate",
  run: async (bot, params) => {
    const [oldRole, newRole] = params;

    bot.logger.info(
      "DISCORD",
      `Role updated: ${newRole.name} in guild ${newRole.guild.name} (${newRole.guild.id})`,
    );

    let updateEntry = null;
    if (bot.utils.auditLog) {
      updateEntry = await bot.utils.auditLog.fetchLatest(
        newRole.guild,
        "RoleUpdate",
        newRole.id,
      );
      if (updateEntry && Date.now() - updateEntry.createdTimestamp > 10000) {
        updateEntry = null;
      }
    }

    const updateEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Role Updated")
      .setDescription(`A role was updated in ${newRole.guild.name}`)
      .addFields(
        { name: "Role", value: `<@&${newRole.id}>`, inline: true },
        { name: "Role ID", value: newRole.id, inline: true },
      )
      .setFooter({
        text: `Server: ${newRole.guild.name}`,
        iconURL: newRole.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (updateEntry?.executor) {
      updateEmbed.addFields({
        name: "Updated By",
        value: `<@${updateEntry.executor.id}>`,
        inline: true,
      });
    }

    if (updateEntry?.reason) {
      updateEmbed.addFields({
        name: "Reason",
        value: updateEntry.reason,
      });
    }

    if (oldRole.name !== newRole.name) {
      updateEmbed.addFields(
        { name: "Old Name", value: oldRole.name, inline: true },
        { name: "New Name", value: newRole.name, inline: true },
      );
    }

    if (oldRole.color !== newRole.color) {
      updateEmbed.addFields(
        { name: "Old Color", value: oldRole.hexColor, inline: true },
        { name: "New Color", value: newRole.hexColor, inline: true },
      );
    }

    if (oldRole.hoist !== newRole.hoist) {
      updateEmbed.addFields(
        {
          name: "Old Hoist",
          value: oldRole.hoist ? "Yes" : "No",
          inline: true,
        },
        {
          name: "New Hoist",
          value: newRole.hoist ? "Yes" : "No",
          inline: true,
        },
      );
    }

    if (oldRole.mentionable !== newRole.mentionable) {
      updateEmbed.addFields(
        {
          name: "Old Mentionable",
          value: oldRole.mentionable ? "Yes" : "No",
          inline: true,
        },
        {
          name: "New Mentionable",
          value: newRole.mentionable ? "Yes" : "No",
          inline: true,
        },
      );
    }

    try {
      const logChannel = bot.functions.getLogChannel(newRole.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [updateEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send role update message: ${error.message}`,
      );
    }
  },
});
