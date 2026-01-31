/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const meta = () => {
  return (
    new SlashCommandBuilder()
      .setName("kick")
      .setDescription("Kick someone from the server")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Member to kick")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Reason for kicking")
          .setRequired(false),
      )
      // Only users with Kick Members permission can use this command
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  );
};

const execute = async (bot, interaction) => {
  // Ensure we can work with a GuildMember
  const member = interaction.options.getMember("user");
  const reason = interaction.options.getString("reason");
  if (!member) {
    return interaction.reply({
      embeds: [
        {
          title: `${bot.config.emojis.error} Cannot find the user in this server`,
          color: bot.config.colors.red,
          description: "Make sure the user is in the same server as the bot.",
        },
      ],
      flags: 64, // EPHEMERAL
    });
  }

  // Check if bot has permission to kick
  const botMember = interaction.guild.members.cache.get(bot.client.user.id);
  if (!botMember?.permissions.has(PermissionFlagsBits.KickMembers)) {
    return interaction.reply({
      embeds: [
        {
          title: `${bot.config.emojis.error} I don't have permission to kick members`,
          color: bot.config.colors.red,
        },
      ],
      flags: 64,
    });
  }

  // Check if the target is kickable (role hierarchy & bot permission)
  if (!member.kickable) {
    return interaction.reply({
      embeds: [
        {
          title: `${bot.config.emojis.warning} I cannot kick this user`,
          color: bot.config.colors.yellow,
          description:
            "The user may have a higher role or be the server owner.",
        },
      ],
      flags: 64,
    });
  }

  try {
    await member.kick({
      reason: reason || `Kicked by ${interaction.user.tag}`,
    });
    return interaction.reply({
      embeds: [
        {
          title: `${bot.config.emojis.success} Kicked`,
          color: bot.config.colors.green,
          description: `${member} was successfully kicked by ${interaction.user.tag}.`,
          fields: [
            {
              name: "Reason",
              value: reason || "No reason provided",
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error(err);
    return interaction.reply({
      embeds: [
        {
          title: `${bot.config.emojis.error} Kick failed`,
          color: bot.config.colors.red,
          description: err.message,
        },
      ],
      flags: 64,
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
