/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("afk")
    .setDescription("See ya next time!")
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for going AFK")
        .setRequired(false),
    );
};

const execute = async (bot, interaction) => {
  const reason = interaction.options.getString("reason") || "";

  if (!interaction.member) {
    await interaction.reply({
      embeds: [
        {
          color: bot.config.colors.red,
          description: `${bot.config.system.emotes.error} **Could not set to AFK due to missing User Settings.**`,
        },
      ],
    });
    return;
  }

  const AFKSettings = {
    timestamp: new Date().getTime(),
    reason: reason ? reason.replace(/[<@&>]/g, "") : null, // hotfix because apparently user & role pings are possible.
    mentions: 0,
  };

  try {
    const affectedRows = await bot.DBs.userSettings.update(
      { AFKSettings: JSON.stringify(AFKSettings, null, "\t") },
      { where: { userID: interaction.user.id } },
    );

    if (affectedRows.length > 0) {
      await interaction.reply({
        embeds: [
          {
            title: `${bot.config.system.emotes.success} You're now AFK${reason ? ": " + reason : "!"}`,
            color: bot.config.colors.lime,
          },
        ],
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        embeds: [
          {
            color: bot.config.colors.red,
            description: `${bot.config.system.emotes.error} **Could not set to AFK due to Database Error!**`,
          },
        ],
        ephemeral: true,
      });
    }
  } catch (error) {
    await interaction.reply({
      embeds: [
        {
          color: bot.config.colors.red,
          description: `${bot.config.system.emotes.error} **Could not set to AFK due to Database Error!**`,
        },
      ],
      ephemeral: true,
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
