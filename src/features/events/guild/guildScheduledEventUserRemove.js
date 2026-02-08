/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildScheduledEventUserRemove",
  run: async (bot, params) => {
    const [scheduledEvent, user] = params;
    const guild = scheduledEvent.guild;
    if (!guild) return;

    bot.logger.info(
      "DISCORD",
      `${user.tag} unsubscribed from event ${scheduledEvent.name} in ${guild.name} (${guild.id})`,
    );

    const embed = new EmbedBuilder()
      .setColor(bot.config.colors.red)
      .setTitle("Event Subscription Removed")
      .setDescription(`A user unsubscribed from a scheduled event in ${guild.name}`)
      .addFields(
        { name: "Event", value: scheduledEvent.name, inline: true },
        { name: "Event ID", value: scheduledEvent.id, inline: true },
        { name: "User", value: `<@${user.id}>`, inline: true },
        { name: "User Tag", value: user.tag, inline: true },
      )
      .setFooter({
        text: `Server: ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    try {
      const logChannel = bot.functions.getLogChannel(guild);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send scheduled event user remove message: ${error.message}`,
      );
    }
  },
});
