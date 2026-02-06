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

  const responses = [
    "Yes",
    "No",
    "Maybe",
    "Definitely",
    "Not a chance",
    "Ask again later",
    "Absolutely",
    "Never",
    "For sure",
    "I wouldn't count on it",
    "The stars say yes",
    "Very doubtful",
    "Most likely",
    "Outlook good",
    "Reply hazy, try again",
  ];

  const randomResponse =
    responses[Math.floor(Math.random() * responses.length)];

  await interaction.reply({
    embeds: [
      {
        title: ":8ball: 8Ball",
        color: bot.config.colors.blue,
        description: "Consulting the magic 8-ball...",
        fields: [
          {
            name: "Question",
            value: question,
          },
          {
            name: "Answer",
            value: randomResponse,
          },
        ],
      },
    ],
  });
};

export default {
  meta,
  execute,
};
