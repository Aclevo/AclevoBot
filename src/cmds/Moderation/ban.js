/*
 * AclevoBot
 * (c) 2026 Aclevo
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const meta = () => {
  return (
    new SlashCommandBuilder()
      .setName("ban")
      .setDescription("Ban someone from the server")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Member to ban")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Reason for the ban")
          .setRequired(false),
      )
      // Only users with Kick Members permission can use this command
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  );
};

const execute = async (bot, interaction) => {
  // Ensure we can work with a GuildMember
  const member = interaction.options.getMember("user");
  const reason =
    interaction.options.getString("reason") || "A reason was not provided";
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
  if (!botMember?.permissions.has(PermissionFlagsBits.BanMembers)) {
    return interaction.reply({
      embeds: [
        {
          title: `${bot.config.emojis.error} I don't have permission to ban members`,
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
          title: `${bot.config.emojis.warning} I cannot ban this user`,
          color: bot.config.colors.yellow,
          description:
            "The user may have a higher role or be the server owner.",
        },
      ],
      flags: 64,
    });
  }

  try {
    await member.ban({
      reason: `${reason ? reason + " | " : ""}Banned by ${interaction.user.tag}`,
    });
    return interaction.reply({
      embeds: [
        {
          title: `${bot.config.emojis.success} Banned`,
          color: bot.config.colors.green,
          description: `${member} was successfully banned by ${interaction.user.tag}.`,
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
          title: `${bot.config.emojis.error} Ban failed`,
          color: bot.config.colors.red,
          description: err.message,
        },
      ],
      flags: 64,
    });
  }
};

module.exports = (app) => {
  return {
    meta,
    execute,
  };
};
