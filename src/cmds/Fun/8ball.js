/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("The magic 8ball will answer *the* question.")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question to ask the 8ball")
        .setRequired(true),
    );
};

const execute = async (bot, interaction) => {
  const question = interaction.options.getString("question");

  const responses = bot.lang.get("8ballResponse", "en_US");
  const responseKeys = Object.keys(responses);
  const randomResponse = responseKeys[Math.floor(Math.random() * responseKeys.length)];
  const responseColor = responses[randomResponse];

  const colorMap = {
    red: bot.config.colors.red,
    green: bot.config.colors.green,
    yellow: bot.config.colors.yellow,
    blue: bot.config.colors.blue,
  };

  await interaction.reply({
    embeds: [
      {
        title: ":8ball: 8Ball",
        color: colorMap[responseColor] || bot.config.colors.blue,
        description: bot.lang.get("Some magic, please!", "en_US"),
        fields: [
          {
            name: bot.lang.get("Question", "en_US"),
            value: question,
          },
          {
            name: bot.lang.get("Answer", "en_US"),
            value: randomResponse,
          },
        ],
      },
    ],
  });
};

export default (app) => ({
  meta,
  execute,
});
