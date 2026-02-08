/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

const getUser = (oldState, newState) =>
  newState.member?.user || oldState.member?.user || oldState.client?.user;

export default defineEvent({
  name: "voiceStateUpdate",
  run: async (bot, params) => {
    const [oldState, newState] = params;
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const user = getUser(oldState, newState);
    if (!user) return;

    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    let action = "Voice State Updated";
    let color = bot.config.colors.yellow;

    if (!oldChannel && newChannel) {
      action = "Voice Channel Joined";
      color = bot.config.colors.green;
    } else if (oldChannel && !newChannel) {
      action = "Voice Channel Left";
      color = bot.config.colors.red;
    } else if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
      action = "Voice Channel Moved";
      color = bot.config.colors.yellow;
    }

    bot.logger.info(
      "DISCORD",
      `${user.tag} ${action.toLowerCase()} in ${guild.name} (${guild.id})`,
    );

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(action)
      .setDescription(`Voice state updated in ${guild.name}`)
      .addFields(
        { name: "User", value: `<@${user.id}>`, inline: true },
        { name: "User Tag", value: user.tag, inline: true },
        { name: "User ID", value: user.id, inline: true },
        {
          name: "Old Channel",
          value: oldChannel ? `<#${oldChannel.id}>` : "None",
          inline: true,
        },
        {
          name: "New Channel",
          value: newChannel ? `<#${newChannel.id}>` : "None",
          inline: true,
        },
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    const statusChanges = [];
    if (oldState.selfMute !== newState.selfMute)
      statusChanges.push(
        `Self Mute: ${oldState.selfMute ? "Yes" : "No"} → ${newState.selfMute ? "Yes" : "No"}`,
      );
    if (oldState.selfDeaf !== newState.selfDeaf)
      statusChanges.push(
        `Self Deaf: ${oldState.selfDeaf ? "Yes" : "No"} → ${newState.selfDeaf ? "Yes" : "No"}`,
      );
    if (oldState.serverMute !== newState.serverMute)
      statusChanges.push(
        `Server Mute: ${oldState.serverMute ? "Yes" : "No"} → ${newState.serverMute ? "Yes" : "No"}`,
      );
    if (oldState.serverDeaf !== newState.serverDeaf)
      statusChanges.push(
        `Server Deaf: ${oldState.serverDeaf ? "Yes" : "No"} → ${newState.serverDeaf ? "Yes" : "No"}`,
      );
    if (oldState.streaming !== newState.streaming)
      statusChanges.push(
        `Streaming: ${oldState.streaming ? "Yes" : "No"} → ${newState.streaming ? "Yes" : "No"}`,
      );
    if (oldState.selfVideo !== newState.selfVideo)
      statusChanges.push(
        `Video: ${oldState.selfVideo ? "Yes" : "No"} → ${newState.selfVideo ? "Yes" : "No"}`,
      );

    if (statusChanges.length > 0) {
      embed.addFields({
        name: "State Changes",
        value: statusChanges.join("\n"),
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
        `Could not send voice state message: ${error.message}`,
      );
    }
  },
});
