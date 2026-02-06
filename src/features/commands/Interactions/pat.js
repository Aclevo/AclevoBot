/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";
const INTERACTION_TYPE = "Pat";

const meta = () => {
  return new SlashCommandBuilder()
    .setName(INTERACTION_TYPE.toLowerCase())
    .setDescription(`${INTERACTION_TYPE} someone!~`)
    .addUserOption((option) =>
      option.setName("target").setDescription("The target").setRequired(true),
    );
};

const execute = async (bot, interaction) => {
  const target = interaction.options.getUser("target");
  const imgResponse = await bot.functions.fetchFromAPI(
    `/imgs/${INTERACTION_TYPE.toLowerCase()}`,
  );

  let description;
  if (interaction.user.id === target.id)
    description = `${interaction.user.toString()} pats themselves! How lonely...`;
  else if (bot.client.user.id === target.id)
    description = `${interaction.user.toString()} pats me! Thank you for the head scritches!`;
  else
    description = `${interaction.user.toString()} gently pats ${target.toString()}! Aww!`;

  await interaction.reply({
    embeds: [
      {
        title: `${INTERACTION_TYPE}!`,
        color: bot.config.colors.green,
        description,
        image: {
          url: imgResponse && imgResponse.data ? imgResponse.data.url : null,
        },
      },
    ],
  });
};

export default {
  meta,
  execute,
};
