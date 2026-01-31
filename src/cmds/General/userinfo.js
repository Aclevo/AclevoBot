/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("User data, need info on da user...")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get information about")
        .setRequired(false),
    );
};

const execute = async (bot, interaction) => {
  const targetUser = interaction.options.getUser("user") || interaction.user;

  async function userInfo(userID) {
    const states = {
      "offline": bot.config.system.emotes.discord.offline + " **Offline**",
      "idle": bot.config.system.emotes.discord.idle + " **Idle**",
      "dnd": bot.config.system.emotes.discord.dnd + " **Do Not Disturb**",
      "online": bot.config.system.emotes.discord.online + " **Online**"
    };

    function getJoinPosition(ID) {
      const memberJoins = interaction.guild.members.cache.map(member => member).sort((a, b) => a.joinedAt - b.joinedAt);
      for (let i = 0; i < memberJoins.length; i++) {
        if (memberJoins[i].id === ID) return i;
      }
    }

    try {
      const user = await bot.client.users.fetch(userID);
      if (!user) {
        throw new Error("That user does not exist.");
      }

      let embed = {
        title: `${bot.config.system.emotes.information} **${user.username} ${(user.bot ? "*[BOT]*" : "")}**`,
        color: user.accentColor || bot.config.colors.blue,
        fields: [
          { name: "Username", value: user.username, inline: true },
        ]
      };

      // PATCH 2023-10-13 - Handle new Discord username system
      if (user.discriminator !== "0") {
        embed.fields.push(
          { name: "Discriminator", value: user.discriminator, inline: true },
          { name: "Full Tag", value: `${user.username}#${user.discriminator}`, inline: true },
        );
      }
      embed.fields.push({ name: "User ID", value: user.id, inline: false });
      // END PATCH 2023-10-13

      if (user.avatar != null) {
        embed.thumbnail = {
          url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${bot.functions.isAnimated(user.avatar) ? "gif" : "png"}?size=1024`
        };
      } else {
        embed.thumbnail = {
          url: `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png?size=1024`
        };
      }

      if (user.banner != null) {
        embed.image = {
          url: `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${bot.functions.isAnimated(user.banner) ? "gif" : "png"}?size=600`
        };
      }

      if (interaction.guild) {
        const serverUser = await interaction.guild.members.fetch(userID);
        if (serverUser.roles) {
          const roles = serverUser.roles.cache
            .map(role => role)
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position) // Sort by position (highest first)
            .map(role => `<@&${role.id}>`);
          embed.fields.push({
            name: `Roles (**${roles.length}**)`,
            value: roles.length > 0 ? roles.join(" ") : "No roles :(",
            inline: true
          });
        }

        if (serverUser.presence) {
          embed.description = states[serverUser.presence.status];
        }

        if (serverUser.nickname) {
          embed.fields.push({ name: `Nickname`, value: serverUser.nickname, inline: true });
        }

        embed.fields.push(
          { name: "Join Position", value: (getJoinPosition(userID) + 1).toString(), inline: true },
          { name: "Joined", value: (`${bot.functions.TStoHR(new Date().getTime() - new Date(serverUser.joinedTimestamp).getTime())} ago`), inline: true }
        );
      }

      await interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      await interaction.reply({
        embeds: [
          {
            description: `${bot.config.system.emotes.error} **${error.message}**`,
            color: bot.config.colors.red,
          },
        ],
      });
    }
  }

  await userInfo(targetUser.id);
};

export default (app) => ({
  meta,
  execute,
});
