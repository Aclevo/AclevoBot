/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";

class guildMemberAdd {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "guildMemberAdd",
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
    const [member] = params;

    bot.logger.info(
      "DISCORD",
      `${member.user.tag} joined guild ${member.guild.name} (${member.guild.id})`,
    );

    // Create a welcome embed
    const welcomeEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.blue) // Using the color defined in config
      .setTitle(`Welcome to ${member.guild.name}!`)
      .setDescription(`<@${member.user.id}> just joined the server!`)
      .addFields(
        { name: "User Tag", value: member.user.tag, inline: true },
        {
          name: "Account Created",
          value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Member Count",
          value: `${member.guild.memberCount} members`,
          inline: true,
        },
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `ID: ${member.user.id}`,
        iconURL: member.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    // Try to send the welcome message to the aclevo-bot-logs channel
    try {
      // Look for the hardcoded "aclevo-bot-logs" channel
      const logChannel = member.guild.channels.cache.find(
        (ch) => ch.name === "aclevo-bot-logs" && ch.type === 0, // Text channel
      );

      // Send the welcome message if we found the channel
      if (logChannel) {
        await logChannel.send({ embeds: [welcomeEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send welcome message: ${error.message}`,
      );
    }
  };
}

export default function () {
  return new guildMemberAdd();
}
