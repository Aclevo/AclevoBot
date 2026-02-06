/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("unban")
    .setDescription("They did the crime, they did the time.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unban")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the unban")
        .setRequired(false),
    );
};

const execute = async (bot, interaction) => {
  const user = interaction.options.getUser("user");
  const reason =
    interaction.options.getString("reason") || "No reason provided";

  async function UnbanError(msg) {
    return await interaction.reply({
      embeds: [
        {
          title: `❌ Unban Error!`,
          color: bot.config.colors.red,
          description: msg ? msg : "Missing error data??",
        },
      ],
      ephemeral: true,
    });
  }

  if (!user) {
    return await UnbanError("The air isn't banned...?");
  }

  if (user.id === interaction.user.id) {
    return await UnbanError(
      "...you wouldn't be running this command if you were banned.",
    );
  }

  try {
    // Check if the user is actually banned
    let isBanned = false;
    try {
      const bans = await interaction.guild.bans.fetch();
      isBanned = bans.some((ban) => ban.user.id === user.id);
    } catch (error) {
      return await UnbanError(
        `I failed to check if the user is banned: ${error.message}`,
      );
    }

    if (!isBanned) {
      return await UnbanError("That user is not banned!");
    }

    // Perform the unban
    const unbanReason = `${interaction.user.username} ${reason}`;
    await interaction.guild.members.unban(user, unbanReason);

    const embed = {
      title: `✅ Unban Success!`,
      color: bot.config.colors.lime,
      description: `Unhammered the user, ${user.username}!`,
      fields: [],
    };

    if (reason) {
      embed.fields.push({ name: "Reason", value: reason });
    }

    await interaction.reply({
      embeds: [embed],
    });
  } catch (error) {
    return await UnbanError(
      `I failed to unban that user because: ${error.message}`,
    );
  }
};

export default (app) => ({
  meta,
  execute,
});
