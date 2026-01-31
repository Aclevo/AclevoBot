/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";

class messageDelete {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "messageDelete",
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
    const [message] = params;

    // Skip if message is from a bot
    if (message.author?.bot) return;

    bot.logger.info(
      "DISCORD",
      `Message by ${message.author?.tag || "unknown"} deleted in #${message.channel.name}`,
    );

    // Create a message deletion embed
    const deleteEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.red) // Red for deletion
      .setTitle("Message Deleted")
      .setDescription(`A message was deleted in #${message.channel.name}`)
      .addFields(
        {
          name: "Author",
          value: message.author ? `<@${message.author.id}>` : "Unknown",
          inline: true,
        },
        {
          name: "Author Tag",
          value: message.author?.tag || "Unknown",
          inline: true,
        },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Message ID", value: message.id, inline: true },
      )
      .setFooter({
        text: `Server: ${message.guild?.name || "DM"}`,
        iconURL: message.guild?.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    // Add message content if available (truncate if too long)
    if (message.content) {
      const content =
        message.content.length > 1024
          ? message.content.substring(0, 1020) + "..."
          : message.content;
      deleteEmbed.addFields({ name: "Deleted Content", value: content });
    }

    // Try to send the message deletion message to the aclevo-bot-logs channel
    try {
      // Look for the hardcoded "aclevo-bot-logs" channel
      const logChannel = message.guild?.channels.cache.find(
        (ch) => ch.name === "aclevo-bot-logs" && ch.type === 0, // Text channel
      );

      if (logChannel) {
        await logChannel.send({ embeds: [deleteEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send message deletion message: ${error.message}`,
      );
    }
  };
}

export default function () {
  return new messageDelete();
}
