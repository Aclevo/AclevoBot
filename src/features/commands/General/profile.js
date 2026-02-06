/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("profile")
    .setDescription(
      "It's all about you - view your Discord profile information!",
    );
};

const execute = async (bot, interaction) => {
  await interaction.reply({
    embeds: [
      {
        title: "⏳ **Loading**",
        color: bot.config.colors.blue,
      },
    ],
  });

  try {
    // Create a simplified profile view using Discord user information
    const user = interaction.user;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("viewprofile")
        .setLabel("View Profile")
        .setStyle("Secondary"),
      new ButtonBuilder()
        .setCustomId("infodiscord")
        .setLabel("Discord Info")
        .setStyle("Secondary"),
    );

    await interaction.editReply({
      embeds: [
        {
          author: {
            name: `Welcome, ${user.username}#${user.discriminator}!`,
            icon_url: user.displayAvatarURL({
              extension: "png",
              dynamic: true,
              size: 1024,
            }),
          },
          title: `ℹ️ It's all about you!`,
          color: bot.config.colors.lime,
          thumbnail: {
            url: user.displayAvatarURL({
              extension: "png",
              dynamic: true,
              size: 1024,
            }),
          },
          fields: [
            { name: "Your Discord Information", value: "** **" },
            {
              name: "Username",
              value: `${user.username}#${user.discriminator}`,
              inline: true,
            },
            { name: "User ID", value: user.id, inline: true },
            {
              name: "Account Created",
              value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
              inline: true,
            },
            { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
            { name: "System", value: user.system ? "Yes" : "No", inline: true },
          ],
          footer: {
            text: `Requested by ${interaction.user.tag}`,
            icon_url: interaction.user.displayAvatarURL({
              extension: "png",
              dynamic: true,
            }),
          },
          timestamp: new Date(),
        },
      ],
      components: [row],
    });

    // Collect button interactions
    const filter = (i) =>
      ["viewprofile", "infodiscord"].includes(i.customId) &&
      i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 10000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "viewprofile") {
        // Open the user's profile in Discord
        await i.reply({
          content: `Here's how to view your profile in Discord:\n\n1. Right-click or tap on your username in any text box\n2. Select "Copy ID" to copy your user ID\n3. Or click on your avatar in the bottom left to view your profile`,
          ephemeral: true,
        });
      } else if (i.customId === "infodiscord") {
        // Show more Discord-specific information
        await i.update({
          embeds: [
            {
              author: {
                name: `Discord Information for ${user.username}#${user.discriminator}`,
                icon_url: user.displayAvatarURL({
                  extension: "png",
                  dynamic: true,
                  size: 1024,
                }),
              },
              color: bot.config.colors.purple,
              fields: [
                { name: "User Tag", value: user.tag, inline: true },
                { name: "User ID", value: user.id, inline: true },
                {
                  name: "Created At",
                  value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                  inline: false,
                },
                {
                  name: "Avatar URL",
                  value: `[Link](${user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })})`,
                  inline: false,
                },
                { name: "Bot?", value: user.bot ? "Yes" : "No", inline: true },
                {
                  name: "System?",
                  value: user.system ? "Yes" : "No",
                  inline: true,
                },
              ],
              footer: {
                text: `Discord User Information`,
                icon_url: interaction.user.displayAvatarURL({
                  extension: "png",
                  dynamic: true,
                }),
              },
              timestamp: new Date(),
            },
          ],
          components: [],
        });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size < 1) {
        await interaction.editReply({
          components: [],
        });
      }
    });
  } catch (error) {
    await interaction.editReply({
      embeds: [
        {
          author: {
            name: `Something happened, ${interaction.user.username}!`,
            icon_url: interaction.user.displayAvatarURL({
              extension: "png",
              dynamic: true,
              size: 1024,
            }),
          },
          title: `ℹ️ It's all about you!`,
          color: bot.config.colors.red,
          description: `Sadly, we ran into an error while handling your profile. Here's what we know: ${error.message}`,
        },
      ],
      components: [],
    });
  }
};

export default {
  meta,
  execute,
};
