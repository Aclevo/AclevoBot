/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";
const INTERACTION_TYPE = "Slap";

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
    description = `${interaction.user.toString()} slaps themselves!`;
  else if (bot.client.user.id === target.id)
    description = `${interaction.user.toString()} tries to slap me, but I dodge!`;
  else
    description = `${interaction.user.toString()} slaps ${target.toString()}!`;

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
