/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("softclear")
    .setDescription("Soft clears a chat - by sending several lines of emptiness.")
    .addIntegerOption((option) =>
      option
        .setName("times")
        .setDescription("Number of times to send empty lines")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    );
};

const execute = async (bot, interaction) => {
  const times = interaction.options.getInteger("times") || 1;

  for (let t = 0; t < times; t++) {
    let emptyThing = "** **\n";
    for (let i = 0; i < 332; i++) {
      emptyThing = emptyThing + "** **\n";
    }

    await interaction.channel.send(emptyThing);
  }

  await interaction.reply({
    content: "Chat cleared!",
    ephemeral: true,
  });
};

export default {
  meta,
  execute,
};
