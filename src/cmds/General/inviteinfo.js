/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("inviteinfo")
    .setDescription("What the invite doin'?")
    .addStringOption((option) =>
      option
        .setName("invite")
        .setDescription("The invite URL or code")
        .setRequired(true),
    );
};

const execute = async (bot, interaction) => {
  const oInvite = interaction.options.getString("invite");

  if (!oInvite) {
    await interaction.reply({ content: "You need to enter an invite!" });
    return;
  }

  const invite = oInvite
    .replace(/[\/]/g, "")
    .replace("https:", "")
    .replace("http:", "")
    .replace("discord.gg", "");

  const url = `https://discord.com/api/v9/invites/${invite}?with_counts=true`;

  try {
    const res = await fetch(url);

    if (res.status !== 200 && res.status !== 404) {
      throw new Error(res.status.toString());
    } else {
      const inviteData = await res.json();
      let embed = {};
      let splashData = null;

      if (inviteData.message) {
        embed = {
          description: `❌ **${inviteData.message}**`,
          color: bot.config.colors.red,
        };
      } else {
        embed = {
          title: `ℹ️ **${inviteData.guild.name} (${inviteData.guild.id})**`,
          color: bot.config.colors.blue,
          fields: [
            {
              name: "Channel",
              value: `#${inviteData.channel.name} (${inviteData.channel.id}) | <#${inviteData.channel.id}>`,
            },
            {
              name: "Members",
              value: "About " + inviteData.approximate_member_count,
            },
            {
              name: "Features",
              value:
                inviteData.guild.features.length > 0
                  ? "`" + inviteData.guild.features.join("`, `") + "`"
                  : "No special features :(",
            },
            {
              name: "Boosts",
              value: inviteData.guild.premium_subscription_count.toString(),
              inline: true,
            },
          ],
        };

        if (inviteData.guild.description != null)
          embed.description = inviteData.guild.description;
        if (inviteData.guild.vanity_url_code)
          embed.fields.push({
            name: "Vanity URL",
            value: "https://discord.gg/" + inviteData.guild.vanity_url_code,
            inline: true,
          });
        if (inviteData.expires_at)
          embed.fields.push({
            name: "Expires in",
            value: bot.functions.TStoHR(
              new Date(inviteData.expires_at).getTime() - new Date().getTime(),
            ),
            inline: true,
          }); // expires_at Time minus the current Time

        if (inviteData.inviter) {
          const user = await bot.client.users
            .fetch(inviteData.inviter.id)
            .catch(() => null);
          if (user) {
            embed.author = {
              name: `Invite Created by ${user.username} (${user.id})`,
              icon_url: user.displayAvatarURL({
                extension: "png",
                dynamic: true,
                size: 1024,
              }),
            };
          }
        }

        if (inviteData.guild.icon != null) {
          embed.thumbnail = {
            url: `https://cdn.discordapp.com/icons/${inviteData.guild.id}/${inviteData.guild.icon}.${bot.functions.isAnimated(inviteData.guild.icon) ? "gif" : "png"}?size=1024`,
          };
        }

        if (inviteData.guild.splash != null) {
          splashData = `https://cdn.discordapp.com/splashes/${inviteData.guild.id}/${inviteData.guild.splash}.${bot.functions.isAnimated(inviteData.guild.splash) ? "gif" : "png"}?size=600`;
        }

        if (inviteData.guild.banner != null) {
          embed.image = {
            url: `https://cdn.discordapp.com/banners/${inviteData.guild.id}/${inviteData.guild.banner}.${bot.functions.isAnimated(inviteData.guild.banner) ? "gif" : "png"}?size=512`,
          };
        }
      }

      const replyOptions = { embeds: [embed] };

      if (splashData != null) {
        // Note: Discord.js v14 doesn't use MessageAttachment, instead uses AttachmentBuilder
        const { AttachmentBuilder } = require("discord.js");
        replyOptions.files = [new AttachmentBuilder(splashData)];
      }

      await interaction.reply(replyOptions);
    }
  } catch (error) {
    bot.logger.error(
      "SYS",
      `Failed fetch of invite: ${oInvite} | ${error.message}`,
    );
    let messageData = error.message || "Unknown Message";

    const messages = {
      403: "The resource is blocked.",
      500: "Server is experiencing downtime. Please check later.",
      502: "Server is experiencing downtime. Please check later.",
      503: "Server is experiencing downtime. Please check later.",
      520: "Server is experiencing downtime. Please check later.",
    };

    messageData = messages[messageData] ? messages[messageData] : messageData;

    await interaction.reply({
      embeds: [
        {
          description: `❌ **${messageData}**`,
          color: bot.config.colors.red,
        },
      ],
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
