/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("source")
    .setDescription("Learn more about the source code.");
};

const execute = async (bot, interaction) => {
  await interaction.reply({
    embeds: [
      {
        title: "Contribute to AclevoBot",
        color: bot.config.colors.blue,
        description:
          "Find more information about the bot and contribute at https://github.com/Aclevo/AclevoBot",
      },
    ],
  });
};

export default {
  meta,
  execute,
};
