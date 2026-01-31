/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";

class guildDelete {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "guildDelete",
      type: "normal",
    };
  };

  add = (fun) => {
    this.functions.push(fun);
  };

  run = (bot, params) => {
    this.default(bot, params); // Run default function
    this.functions.forEach((fun) => fun(bot, params)); // Run other functions.
  };

  default = async (bot, params) => {
    const [guild] = params;

    bot.logger.info("DISCORD", `Left guild: ${guild.name} (${guild.id})`);

    // Create a leave embed
    const leaveEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.orange) // Using the color defined in config
      .setTitle(`Removed from Server: ${guild.name}`)
      .setDescription(`I've been removed from this server.`)
      .addFields(
        { name: "Server Name", value: guild.name, inline: true },
        { name: "Server ID", value: guild.id, inline: true },
        {
          name: "Member Count",
          value: `${guild.memberCount} members`,
          inline: true,
        },
        {
          name: "Created",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
      )
      .setThumbnail(guild.iconURL({ dynamic: true }) || null)
      .setFooter({
        text: `Bot is now in ${bot.client.guilds.cache.size} servers`,
        iconURL: bot.client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    // Try to send the leave message to the aclevo-bot-logs channel
    try {
      // Look for the hardcoded "aclevo-bot-logs" channel
      const logChannel = guild.channels.cache.find(
        (ch) => ch.name === "aclevo-bot-logs" && ch.type === 0, // Text channel
      );

      if (logChannel) {
        await logChannel.send({ embeds: [leaveEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send leave notification: ${error.message}`,
      );
    }
  };
}

export default function () {
  return new guildDelete();
}
