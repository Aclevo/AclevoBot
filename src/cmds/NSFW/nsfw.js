/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("nsfw")
    .setDescription("mmm the nice command ;)");
};

const execute = async (bot, interaction) => {
  if (!interaction.channel.nsfw) {
    // Send bonk message if not in an NSFW channel
    await interaction.reply({
      embeds: [
        {
          title: `${bot.config.system.emotes.information} BONK!`,
          color: bot.config.colors.blue,
          description: "This command can only be used in NSFW channels!",
        },
      ],
    });
  } else {
    await interaction.reply({
      embeds: [
        {
          title: `${bot.config.system.emotes.error} NSFW`,
          color: bot.config.colors.red,
          description:
            "We're sorry, but NSFW is still being worked on.\n***TIP:** Try running outside a NSFW channel.*",
        },
      ],
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
