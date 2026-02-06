/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("answer")
    .setDescription("The true meaning of life.");
};

const execute = async (bot, interaction) => {
  // SHAME ON YOU FOR LOOKING INTO THIS CODE!!! REVEALS SPOILERS AAAAAAAA!

  const rnd = Math.random(); // Math.random() isn't exactly true random but it works ig.
  let answer = "42"; // Normal response.

  if (rnd < 0.01) // 0.1%  chance of sending this >:)
    answer = "Nekos"; // I swear I'm going to get hate for this. Just accept it.
  else if (rnd < 0.05) // 0.5% chance of sending this >:)
    answer = "Niko"; // OneShot joke ig, because why not.

  await interaction.reply(answer); // Return response
};

export default {
  meta,
  execute,
};
