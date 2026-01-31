/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";

class messageUpdate {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "messageUpdate",
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
    const [oldMessage, newMessage] = params;

    // Skip if message is from a bot
    if (newMessage.author.bot) return;

    bot.logger.info(
      "DISCORD",
      `${newMessage.author.tag} updated a message in #${newMessage.channel.name}`,
    );

    // Create a message update embed
    const updateEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow) // Yellow for update/edit
      .setTitle("Message Updated")
      .setDescription(`A message was edited in #${newMessage.channel.name}`)
      .addFields(
        { name: "Author", value: `<@${newMessage.author.id}>`, inline: true },
        { name: "Author Tag", value: newMessage.author.tag, inline: true },
        { name: "Channel", value: `<#${newMessage.channel.id}>`, inline: true },
        { name: "Message ID", value: newMessage.id, inline: true },
        {
          name: "Jump to Message",
          value: `[Click here](${newMessage.url})`,
          inline: true,
        },
      )
      .setFooter({
        text: `Server: ${newMessage.guild?.name || "DM"}`,
        iconURL: newMessage.guild?.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    // Add old and new content if available (truncate if too long)
    if (oldMessage.content) {
      const oldContent =
        oldMessage.content.length > 1024
          ? oldMessage.content.substring(0, 1020) + "..."
          : oldMessage.content;
      updateEmbed.addFields({ name: "Old Content", value: oldContent });
    }

    if (newMessage.content && newMessage.content !== oldMessage.content) {
      const newContent =
        newMessage.content.length > 1024
          ? newMessage.content.substring(0, 1020) + "..."
          : newMessage.content;
      updateEmbed.addFields({ name: "New Content", value: newContent });
    }

    // Try to send the message update message to the aclevo-bot-logs channel
    try {
      // Look for the hardcoded "aclevo-bot-logs" channel
      const logChannel = newMessage.guild?.channels.cache.find(
        (ch) => ch.name === "aclevo-bot-logs" && ch.type === 0, // Text channel
      );

      if (logChannel) {
        await logChannel.send({ embeds: [updateEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send message update message: ${error.message}`,
      );
    }
  };
}

export default function () {
  return new messageUpdate();
}
