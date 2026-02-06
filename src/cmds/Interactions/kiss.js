/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";
const INTERACTION_TYPE = "Kiss";

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
    description = `${interaction.user.toString()} kisses themselves! How awkward...`;
  else if (bot.client.user.id === target.id)
    description = `${interaction.user.toString()} tries to kiss me! I'm flattered but I'm just a bot!`;
  else
    description = `${interaction.user.toString()} gives ${target.toString()} a sweet kiss! How romantic!`;

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
