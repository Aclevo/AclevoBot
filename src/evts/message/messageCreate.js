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
            `n-nya! My prefix is \`${bot.config.system.defaultPrefix || "!"}\``,
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

    // Process commands if message starts with prefix
    const prefix = bot.config.system.defaultPrefix || "!";
    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (commandName) {
        const command = bot.commands.slash.get(commandName);
        if (command) {
          bot.logger.info(
            "COMMAND",
            `${message.author.tag} executed: ${commandName}`,
          );

          try {
            await command.execute(bot, {
              type: "message", // distinguish from slash commands
              message,
              args,
            });
          } catch (error) {
            bot.logger.error(
              "COMMAND",
              `Error executing ${commandName}: ${error.message}`,
            );

            try {
              const errorEmbed = new EmbedBuilder()
                .setColor(bot.config.colors.red)
                .setTitle("Command Error")
                .setDescription(
                  `There was an error executing the command: ${error.message}`,
                )
                .setFooter({
                  text: `Requested by ${message.author.username}`,
                  iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

              await message.reply({ embeds: [errorEmbed], ephemeral: true });
            } catch (replyErr) {
              bot.logger.error(
                "COMMAND",
                `Could not send error message: ${replyErr.message}`,
              );
            }
          }
        } else {
          // Command not found
          bot.logger.info(
            "COMMAND",
            `Unknown command: ${commandName} by ${message.author.tag}`,
          );

          try {
            const notFoundEmbed = new EmbedBuilder()
              .setColor(bot.config.colors.orange)
              .setTitle("Command Not Found")
              .setDescription(`The command \`${commandName}\` does not exist.`)
              .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp();

            await message.reply({ embeds: [notFoundEmbed], ephemeral: true });
          } catch (replyErr) {
            bot.logger.error(
              "COMMAND",
              `Could not send command not found message: ${replyErr.message}`,
            );
          }
        }
      }
    }
  };
}

export default function () {
  return new messageCreate();
}
