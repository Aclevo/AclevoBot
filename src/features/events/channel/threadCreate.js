/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "threadCreate",
  run: async (bot, params) => {
    const [thread] = params;
    const guild = thread.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Thread created: ${thread.name} in guild ${guild.name} (${guild.id})`,
    );

    const archiveDuration = thread.autoArchiveDuration
      ? `${thread.autoArchiveDuration} minutes`
      : "Unknown";

    const threadEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.green)
      .setTitle("Thread Created")
      .setDescription(`A new thread was created in ${guild.name}`)
      .addFields(
        { name: "Thread Name", value: thread.name, inline: true },
        { name: "Thread ID", value: thread.id, inline: true },
        {
          name: "Parent Channel",
          value: thread.parent ? `<#${thread.parent.id}>` : "Unknown",
          inline: true,
        },
        {
          name: "Owner",
          value: thread.ownerId ? `<@${thread.ownerId}>` : "Unknown",
          inline: true,
        },
        { name: "Archived", value: thread.archived ? "Yes" : "No", inline: true },
        { name: "Locked", value: thread.locked ? "Yes" : "No", inline: true },
        { name: "Auto-Archive", value: archiveDuration, inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (thread.createdTimestamp) {
      threadEmbed.addFields({
        name: "Created",
        value: `<t:${Math.floor(thread.createdTimestamp / 1000)}:R>`,
        inline: true,
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [threadEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send thread create message: ${error.message}`,
      );
    }
  },
});
