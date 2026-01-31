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
    `${bot.lang.get("hello_world.description", "en_US", { FULLVER: bot.version.getFull() })}`,
  );
};

export default (app) => ({
  meta,
  execute,
});
