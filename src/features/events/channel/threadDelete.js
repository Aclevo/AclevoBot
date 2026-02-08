/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "threadDelete",
  run: async (bot, params) => {
    const [thread] = params;
    const guild = thread.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Thread deleted: ${thread.name} in guild ${guild.name} (${guild.id})`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("Thread Deleted")
      .setDescription(`A thread was deleted in ${guild.name}`)
      .addFields(
        { name: "Thread Name", value: thread.name, inline: true },
        { name: "Thread ID", value: thread.id, inline: true },
        {
          name: "Parent Channel",
          value: thread.parent ? `<#${thread.parent.id}>` : "Unknown",
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (thread.ownerId) {
      embed.addFields({
        name: "Owner",
        value: `<@${thread.ownerId}>`,
        inline: true,
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send thread delete message: ${error.message}`,
      );
    }
  },
});
