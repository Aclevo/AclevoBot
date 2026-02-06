/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

import { EmbedBuilder } from "discord.js";

class messageCreate {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "messageCreate",
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
    if (message.author.bot) return;

    // Handle bot mentions
    if (
      message.mentions.has(bot.client.user.id) &&
      !message.mentions.everyone &&
      !message.reference
    ) {
      // Respond to bot mentions with prefix info using an embed
      try {
        const mentionEmbed = new EmbedBuilder()
          .setColor(bot.config.colors.blue)
          .setTitle("Hello there!")
          .setDescription(
            `Please use the slash commands. Do /help for more information.`,
          )
          .setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await message.reply({ embeds: [mentionEmbed] });
      } catch (err) {
        bot.logger.warn(
          "DISCORD",
          `Could not reply to mention: ${err.message}`,
        );
      }
      return;
    }
  };
}

export default function () {
  return new messageCreate();
}
