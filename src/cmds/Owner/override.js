/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("override")
    .setDescription("Override permission system.")
    .setDefaultMemberPermissions(0) // Only owner can use this
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Enable or disable the bypass")
        .setRequired(true)
        .addChoices(
          { name: "Enable", value: "enable" },
          { name: "Disable", value: "disable" },
        ),
    );
};

const execute = async (bot, interaction) => {
  const action = interaction.options.getString("action");

  if (!action) {
    const status = bot.client.bypassEnabled ?
      `${bot.config.system.emotes.success} **Bypass is enabled!**` :
      `${bot.config.system.emotes.error} **Bypass is disabled!**`;

    await interaction.reply(status);
  } else if (action === "enable" || action === "disable") {
    bot.client.bypassEnabled = (action === "enable");
    await interaction.reply({
      content: `Bypass has been ${action}d!`,
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content: "Invalid action. Use 'enable' or 'disable'.",
      ephemeral: true,
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
