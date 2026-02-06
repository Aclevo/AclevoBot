/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "I need somebody (Help!) Not just anybody (Help!) From a command to all commands (Help!)",
    )
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command or category to get help for")
        .setRequired(false),
    );
};

const execute = async (bot, interaction) => {
  const temp = interaction.options.getString("command");

  // Define command categories and their commands
  const allCommands = [
    {
      name: "ping",
      category: "General",
      description: "Bot Status",
      permissions: "DEFAULT",
    },
    {
      name: "hello",
      category: "General",
      description: "Say hello to the bot",
      permissions: "DEFAULT",
    },
    {
      name: "source",
      category: "General",
      description: "Get the bot's source code",
      permissions: "DEFAULT",
    },
    {
      name: "invite",
      category: "General",
      description: "Get an invite link for the bot",
      permissions: "DEFAULT",
    },
    {
      name: "8ball",
      category: "Fun",
      description: "The magic 8ball will answer *the* question.",
      permissions: "DEFAULT",
    },
    {
      name: "answer",
      category: "Fun",
      description: "The true meaning of life.",
      permissions: "DEFAULT",
    },
    {
      name: "explode",
      category: "Fun",
      description: "MAKE THAT THING GO KABOOM!",
      permissions: "DEFAULT",
    },
    {
      name: "uwu",
      category: "Fun",
      description: "UwUify some messages... for some reason..?",
      permissions: "DEFAULT",
    },
    {
      name: "about",
      category: "General",
      description: "Get info about me!",
      permissions: "DEFAULT",
    },
    {
      name: "afk",
      category: "General",
      description: "See ya next time!",
      permissions: "DEFAULT",
    },
    {
      name: "help",
      category: "General",
      description:
        "I need somebody (Help!) Not just anybody (Help!) From a command to all commands (Help!)",
      permissions: "DEFAULT",
    },
    {
      name: "inviteinfo",
      category: "General",
      description: "What the invite doin'?",
      permissions: "DEFAULT",
    },
    {
      name: "profile",
      category: "General",
      description:
        "It's all about you - update, opt-out, delete, and more on your profile!",
      permissions: "DEFAULT",
    },
    {
      name: "serverinfo",
      category: "General",
      description: "Extra! Extra! Info on the server!",
      permissions: "DEFAULT",
    },
    {
      name: "userinfo",
      category: "General",
      description: "User data, need info on da user...",
      permissions: "DEFAULT",
    },
    {
      name: "verify",
      category: "General",
      description: "Verify yo self!",
      permissions: "DEFAULT",
    },
    {
      name: "yttogether",
      category: "General",
      description: "Generate a YouTube Together [BETA] link!",
      permissions: "STREAM",
    },
    {
      name: "cuddle",
      category: "Interactions",
      description: "Cuddle someone!~",
      permissions: "DEFAULT",
    },
    {
      name: "hug",
      category: "Interactions",
      description: "Hug someone!~",
      permissions: "DEFAULT",
    },
    {
      name: "kiss",
      category: "Interactions",
      description: "Kiss someone!~",
      permissions: "DEFAULT",
    },
    {
      name: "nom",
      category: "Interactions",
      description: "Nom nom someone!~",
      permissions: "DEFAULT",
    },
    {
      name: "pat",
      category: "Interactions",
      description: "Pat someone!~",
      permissions: "DEFAULT",
    },
    {
      name: "slap",
      category: "Interactions",
      description: "Slap someone!~",
      permissions: "DEFAULT",
    },
    {
      name: "ban",
      category: "Moderation",
      description: "Bans a user from the server.",
      permissions: "BAN_MEMBERS",
    },
    {
      name: "kick",
      category: "Moderation",
      description: "Kicks a user from the server.",
      permissions: "KICK_MEMBERS",
    },
    {
      name: "config",
      category: "Moderation",
      description: "Configure your server the way you want!",
      permissions: "MANAGE_GUILD",
    },
    {
      name: "purge",
      category: "Moderation",
      description: "Purge those spicy messages",
      permissions: "MANAGE_MESSAGES",
    },
    {
      name: "reactionroles",
      category: "Moderation",
      description: "Setup reaction roles for your server!",
      permissions: "MANAGE_MESSAGES",
    },
    {
      name: "softclear",
      category: "Moderation",
      description:
        "Soft clears a chat - by sending several lines of emptiness.",
      permissions: "MANAGE_MESSAGES",
    },
    {
      name: "unban",
      category: "Moderation",
      description: "They did the crime, they did the time.",
      permissions: "BAN_MEMBERS",
    },
    {
      name: "eval",
      category: "Owner",
      description: "Evaluate JavaScript code",
      permissions: "BOT_OWNER",
    },
    {
      name: "botcontrols",
      category: "Owner",
      description: "Bot Control.",
      permissions: "BOT_OWNER",
    },
    {
      name: "override",
      category: "Owner",
      description: "Override permission system.",
      permissions: "BOT_OWNER",
    },
  ];

  if (temp) {
    // Look for a specific command
    const command = allCommands.find((cmd) => cmd.name === temp);

    if (command) {
      // Show specific command help
      const fields = [
        { name: "Category", value: command.category, inline: true },
        { name: "Server Only?", value: "No", inline: true },
        {
          name: "Permissions",
          value: `\`${command.permissions}\``,
          inline: true,
        },
        { name: "Aliases", value: "NONE", inline: true },
      ];

      await interaction.reply({
        embeds: [
          {
            title: `Help for ${command.name}`,
            color: bot.config.colors.lime,
            description: command.description,
            fields: fields,
          },
        ],
      });
    } else {
      // Command not found, show all commands with error message
      const cmds = {};
      allCommands.forEach((cmd) => {
        const category = cmd.category;
        if (!cmds[category]) cmds[category] = [];
        cmds[category].push("`" + cmd.name + "`");
      });

      const fields = [];
      for (const category of Object.keys(cmds)) {
        fields.push({ name: category, value: cmds[category].join(", ") });
      }

      await interaction.reply({
        embeds: [
          {
            title: `ℹ️ ${bot.name} Help`,
            color: bot.config.colors.blue,
            description: `The command or category '${temp}' is invalid.\nYeaaah we got it! (Help! Help!)`,
            fields: fields,
          },
        ],
      });
    }
  } else {
    // Show all commands
    const cmds = {};
    allCommands.forEach((cmd) => {
      const category = cmd.category;
      if (!cmds[category]) cmds[category] = [];
      cmds[category].push("`" + cmd.name + "`");
    });

    const fields = [];
    for (const category of Object.keys(cmds)) {
      fields.push({ name: category, value: cmds[category].join(", ") });
    }

    await interaction.reply({
      embeds: [
        {
          title: `ℹ️ Help`,
          color: bot.config.colors.blue,
          description: `Yeaaah we got it! (Help! Help!)`,
          fields: fields,
        },
      ],
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
