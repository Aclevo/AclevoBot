/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "threadMembersUpdate",
  run: async (bot, params) => {
    const [addedMembers, removedMembers, thread] = params;
    const guild = thread.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `Thread members updated: ${thread.name} in guild ${guild.name} (${guild.id})`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Thread Members Updated")
      .setDescription(`Thread members changed in ${guild.name}`)
      .addFields(
        { name: "Thread", value: `<#${thread.id}>`, inline: true },
        { name: "Thread ID", value: thread.id, inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    if (addedMembers?.size) {
      const added = addedMembers
        .map((member) => `<@${member.id}>`)
        .join(", ");
      embed.addFields({
        name: "Members Added",
        value: added.length > 1024 ? `${added.slice(0, 1021)}...` : added,
      });
    }

    if (removedMembers?.size) {
      const removed = removedMembers
        .map((member) => `<@${member.id}>`)
        .join(", ");
      embed.addFields({
        name: "Members Removed",
        value: removed.length > 1024 ? `${removed.slice(0, 1021)}...` : removed,
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
        `Could not send thread member update message: ${error.message}`,
      );
    }
  },
});
