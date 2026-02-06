/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Hello world - testing.");
};

const execute = async (bot, interaction) => {
  await interaction.reply(
    `Hello World! This is AclevoBot v${bot.version.getFull()}. I'm a multipurpose Discord bot made to serve all your needs!`,
  );
};

export default {
  meta,
  execute,
};
