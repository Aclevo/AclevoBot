/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Extra! Extra! Info on the server!");
};

const execute = async (bot, interaction) => {
  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    guild.acronym = guild.name.match(/\b(\w)/g).join(""); // Cool thing

    const members = {
      total: guild.memberCount,
    };
    // Count users and bots separately - only fetch if needed to avoid performance issues on large servers
    // For most guilds, we can use the cached member count which is already split between users and bots
    try {
      // Attempt to fetch a limited number of members to get an accurate count
      // Only fetch if the guild is relatively small to avoid rate limits
      if (guild.memberCount <= 500) {
        const allMembers = await guild.members.fetch();
        members.users = allMembers.filter((member) => !member.user.bot).size;
        members.bots = members.total - members.users;
      } else {
        // For larger guilds, estimate counts from the partial cache
        // This is less accurate but much more performant
        const cachedMembers = guild.members.cache;
        const cachedUsers = cachedMembers.filter(
          (member) => !member.user.bot,
        ).size;
        const cachedBots = cachedMembers.filter(
          (member) => member.user.bot,
        ).size;

        // Estimate the full counts proportionally
        if (cachedMembers.size > 0) {
          const userRatio = cachedUsers / cachedMembers.size;
          const botRatio = cachedBots / cachedMembers.size;
          members.users = Math.round(guild.memberCount * userRatio);
          members.bots = guild.memberCount - members.users;
        } else {
          // Fallback if no members are cached
          members.users = guild.memberCount; // Assume mostly users if no data
          members.bots = 0;
        }
      }
    } catch (error) {
      // If fetching fails, use the guild's approximate member count
      bot.logger.warn(
        "SERVERINFO",
        `Could not fetch members for guild ${guild.id}: ${error.message}`,
      );
      members.users = guild.approximateMemberCount || guild.memberCount;
      members.bots = 0; // Default assumption
    }

    let embed = {
      title: `ℹ️ **${guild.name}**`,
      color: bot.config.colors.blue,
      fields: [
        { name: "ID", value: guild.id, inline: true },
        { name: "Acronym", value: guild.acronym, inline: true },
        {
          name: "Boosts",
          value: guild.premiumSubscriptionCount?.toString() || "N/A",
          inline: true,
        },
        {
          name: "Preferred Locale",
          value: guild.preferredLocale,
          inline: true,
        },
        {
          name: "Owner",
          value: `<@${guild.ownerId}> (${guild.ownerId})`,
          inline: true,
        },
        {
          name: "Features",
          value:
            guild.features.length > 0
              ? "`" + guild.features.join("`, `") + "`"
              : "No special features :(",
        },

        {
          name: "Channels",
          value: guild.channels.cache.size.toString() || "N/A",
          inline: true,
        },
        {
          name: "Roles",
          value: guild.roles.cache.size.toString() || "N/A",
          inline: true,
        },
        // Note: Bans cache might not be available unless explicitly fetched
        { name: "Bans", value: "N/A", inline: true },

        {
          name: "Invites",
          value: guild.invites?.cache.size.toString() || "N/A",
          inline: true,
        },
        {
          name: "Emojis",
          value: guild.emojis.cache.size.toString() || "N/A",
          inline: true,
        },
        {
          name: "Stickers",
          value: guild.stickers?.cache.size.toString() || "N/A",
          inline: true,
        },

        {
          name: "Total Members",
          value: members.total.toString() || "N/A",
          inline: true,
        },
        {
          name: "Users",
          value: members.users.toString() || "N/A",
          inline: true,
        },
        { name: "Bots", value: members.bots.toString() || "N/A", inline: true },
      ],
    };

    if (guild.description != null) embed.description = guild.description;
    if (guild.vanityURLCode) {
      embed.fields.push(
        {
          name: "Vanity URL",
          value: "https://discord.gg/" + guild.vanityURLCode,
          inline: true,
        },
        {
          name: "Vanity Uses",
          value:
            guild.vanityURLUses != null
              ? guild.vanityURLUses.toString()
              : "None",
          inline: true,
        },
      );
    }

    embed.fields.push(
      {
        name: "Server Created",
        value: new Date(guild.createdTimestamp).toString() || "N/A",
      },
      {
        name: `${bot.name} Joined`,
        value: new Date(guild.joinedTimestamp).toString() || "N/A",
      },
    );

    if (guild.icon != null) {
      embed.thumbnail = {
        url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${bot.functions.isAnimated(guild.icon) ? "gif" : "png"}?size=1024`,
      };
    }

    if (guild.splash != null) {
      const splashData = `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.${bot.functions.isAnimated(guild.splash) ? "gif" : "png"}?size=600`;
      embed.image = { url: splashData }; // Using image instead of file attachment for simplicity
    }

    if (guild.banner != null) {
      embed.image = {
        url: `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${bot.functions.isAnimated(guild.banner) ? "gif" : "png"}?size=512`,
      };
    }

    await interaction.reply({
      embeds: [embed],
    });
  } catch (error) {
    await interaction.reply({
      embeds: [
        {
          description: `❌ **${error.message}**`,
          color: bot.config.colors.red,
        },
      ],
    });
  }
};

export default {
  meta,
  execute,
};
