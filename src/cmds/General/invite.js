/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Add me to a server!~");
};

const execute = async (bot, interaction) => {
  await interaction.reply({
    embeds: [
      {
        title: "Invite Me!",
        color: bot.config.colors.green,
        description: `Want to add me to your server? Great!\n\n[Click here to invite me!](${bot.config.discord.botInviteBase})\n\nNeed help? Join our [support server](${bot.config.discord.supportInviteBase})!`,
      },
    ],
  });
};

export default (app) => ({
  meta,
  execute,
});
