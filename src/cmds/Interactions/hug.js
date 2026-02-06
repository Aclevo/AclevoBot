/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";
const INTERACTION_TYPE = "Hug";

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
    description = `${interaction.user.toString()} hugs themselves! Lonely?`;
  else if (bot.client.user.id === target.id)
    description = `${interaction.user.toString()} hugs me! Aww, thank you!`;
  else
    description = `${interaction.user.toString()} gives ${target.toString()} a warm hug! So cute!`;

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

export default (app) => {
  return {
    meta,
    execute,
  };
};
