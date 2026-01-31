/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Embed Templates Utility
 */

import { EmbedBuilder } from "discord.js";

class EmbedTemplates {
  constructor(bot, options) {
    this.bot = bot;
    this.options = options;
  }

  meta = () => {
    return {
      name: "embedTemplates",
      description: "Standardized embed templates for bot events",
      version: "1.0.0",
    };
  };

  execute = () => {
    return {
      /**
       * Creates a standardized embed for logging events
       * @param {Object} bot - The bot instance
       * @param {string} title - The title of the embed
       * @param {string} description - The description of the embed
       * @param {Array} fields - Array of field objects [{name, value, inline}]
       * @param {string} color - Color for the embed (defaults to blue)
       * @returns {EmbedBuilder} A standardized embed
       */
      createLogEmbed: (
        bot,
        title,
        description,
        fields = [],
        color = "blue",
      ) => {
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(bot.config.colors[color] || bot.config.colors.blue)
          .setTimestamp();

        if (fields.length > 0) {
          embed.addFields(fields);
        }

        return embed;
      },

      /**
       * Creates a standardized embed for member events (join/leave)
       * @param {Object} bot - The bot instance
       * @param {string} eventType - Type of event ('join' or 'leave')
       * @param {Object} member - The guild member object
       * @returns {EmbedBuilder} A standardized member event embed
       */
      createMemberEmbed: (bot, eventType, member) => {
        const isJoin = eventType === "join";
        const title = isJoin
          ? `Welcome to ${member.guild.name}!`
          : `Goodbye from ${member.guild.name}`;
        const description = isJoin
          ? `<@${member.user.id}> just joined the server!`
          : `<@${member.user.id}> has left the server`;
        const color = isJoin ? "green" : "red";

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(bot.config.colors[color])
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `ID: ${member.user.id}`,
            iconURL: member.guild.iconURL({ dynamic: true }) || undefined,
          })
          .setTimestamp()
          .addFields(
            { name: "User Tag", value: member.user.tag, inline: true },
            {
              name: "Account Created",
              value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
              inline: true,
            },
            {
              name: "Member Count",
              value: `${member.guild.memberCount} members`,
              inline: true,
            },
          );

        if (!isJoin && member.joinedTimestamp) {
          embed.data.fields.splice(2, 0, {
            name: "Member Since",
            value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
            inline: true,
          });
        }

        return embed;
      },

      /**
       * Creates a standardized embed for server events (join/leave)
       * @param {Object} bot - The bot instance
       * @param {string} eventType - Type of event ('join' or 'leave')
       * @param {Object} guild - The guild object
       * @returns {EmbedBuilder} A standardized server event embed
       */
      createServerEmbed: (bot, eventType, guild) => {
        const isJoin = eventType === "join";
        const title = isJoin
          ? `Added to Server: ${guild.name}`
          : `Removed from Server: ${guild.name}`;
        const description = isJoin
          ? `Thanks for inviting me to your server!`
          : `I've been removed from this server.`;
        const color = isJoin ? "green" : "orange";

        return new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(bot.config.colors[color])
          .setThumbnail(guild.iconURL({ dynamic: true }) || null)
          .setFooter({
            text: `Bot is now in ${bot.client.guilds.cache.size} servers`,
            iconURL: bot.client.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp()
          .addFields(
            { name: "Server Name", value: guild.name, inline: true },
            { name: "Server ID", value: guild.id, inline: true },
            {
              name: "Member Count",
              value: `${guild.memberCount} members`,
              inline: true,
            },
            {
              name: "Created",
              value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
              inline: true,
            },
            { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
            {
              name: "Region",
              value: guild.preferredLocale || "Not set",
              inline: true,
            },
          );
      },

      /**
       * Creates a standardized embed for channel events
       * @param {Object} bot - The bot instance
       * @param {string} eventType - Type of event ('create' or 'delete')
       * @param {Object} channel - The channel object
       * @returns {EmbedBuilder} A standardized channel event embed
       */
      createChannelEmbed: (bot, eventType, channel) => {
        const isCreate = eventType === "create";
        const title = isCreate ? "Channel Created" : "Channel Deleted";
        const description = `A channel has been ${eventType}d in ${channel.guild.name}`;
        const color = isCreate ? "blue" : "red";

        // Channel type mapping
        const channelTypeMap = {
          0: "Text Channel",
          2: "Voice Channel",
          4: "Category",
          5: "Announcement Channel",
          13: "Stage Channel",
          14: "Directory",
          15: "Forum Channel",
        };

        const channelTypeName =
          channelTypeMap[channel.type] || "Unknown Channel Type";

        return new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(bot.config.colors[color])
          .setFooter({
            text: `Server: ${channel.guild.name}`,
            iconURL: channel.guild.iconURL({ dynamic: true }) || undefined,
          })
          .setTimestamp()
          .addFields(
            { name: "Channel Name", value: `#${channel.name}`, inline: true },
            { name: "Channel Type", value: channelTypeName, inline: true },
            { name: "Channel ID", value: channel.id, inline: true },
            {
              name: "Created",
              value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`,
              inline: true,
            },
          );
      },

      /**
       * Creates a standardized embed for role events
       * @param {Object} bot - The bot instance
       * @param {string} eventType - Type of event ('create' or 'delete')
       * @param {Object} role - The role object
       * @returns {EmbedBuilder} A standardized role event embed
       */
      createRoleEmbed: (bot, eventType, role) => {
        const isCreate = eventType === "create";
        const title = isCreate ? "Role Created" : "Role Deleted";
        const description = `A role has been ${eventType}d in ${role.guild.name}`;
        const color = isCreate
          ? role.color || bot.config.colors.blue
          : bot.config.colors.red;

        return new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(color)
          .setFooter({
            text: `Server: ${role.guild.name}`,
            iconURL: role.guild.iconURL({ dynamic: true }) || undefined,
          })
          .setTimestamp()
          .addFields(
            { name: "Role Name", value: role.name, inline: true },
            { name: "Role ID", value: role.id, inline: true },
            { name: "Color", value: role.hexColor, inline: true },
            { name: "Position", value: role.position.toString(), inline: true },
            {
              name: "Mentionable",
              value: role.mentionable ? "Yes" : "No",
              inline: true,
            },
            { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
          );
      },

      /**
       * Creates a standardized embed for emoji events
       * @param {Object} bot - The bot instance
       * @param {string} eventType - Type of event ('create' or 'delete')
       * @param {Object} emoji - The emoji object
       * @returns {EmbedBuilder} A standardized emoji event embed
       */
      createEmojiEmbed: (bot, eventType, emoji) => {
        const isCreate = eventType === "create";
        const title = isCreate ? "Emoji Created" : "Emoji Deleted";
        const description = `An emoji has been ${eventType}d in ${emoji.guild.name}`;
        const color = isCreate
          ? bot.config.colors.green
          : bot.config.colors.red;

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(bot.config.colors[color])
          .setFooter({
            text: `Server: ${emoji.guild.name}`,
            iconURL: emoji.guild.iconURL({ dynamic: true }) || undefined,
          })
          .setTimestamp()
          .addFields(
            { name: "Emoji Name", value: emoji.name, inline: true },
            { name: "Emoji ID", value: emoji.id, inline: true },
            {
              name: "Animated",
              value: emoji.animated ? "Yes" : "No",
              inline: true,
            },
          );

        if (isCreate) {
          embed
            .setThumbnail(emoji.url) // Show the emoji as thumbnail
            .addFields({
              name: "URL",
              value: `[Link](${emoji.url})`,
              inline: true,
            });
        }

        return embed;
      },

      /**
       * Creates a standardized embed for message events
       * @param {Object} bot - The bot instance
       * @param {string} eventType - Type of event ('delete' or 'update')
       * @param {Object} message - The message object
       * @param {Object} oldMessage - The old message object (for updates)
       * @returns {EmbedBuilder} A standardized message event embed
       */
      createMessageEmbed: (bot, eventType, message, oldMessage = null) => {
        const isDelete = eventType === "delete";
        const isUpdate = eventType === "update";
        const title = isDelete ? "Message Deleted" : "Message Updated";
        const description = isDelete
          ? `A message was deleted in #${message.channel.name}`
          : `A message was edited in #${message.channel.name}`;
        const color = isDelete
          ? bot.config.colors.red
          : bot.config.colors.yellow;

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(bot.config.colors[color])
          .setFooter({
            text: `Server: ${message.guild?.name || "DM"}`,
            iconURL: message.guild?.iconURL({ dynamic: true }) || undefined,
          })
          .setTimestamp()
          .addFields(
            {
              name: "Author",
              value: message.author ? `<@${message.author.id}>` : "Unknown",
              inline: true,
            },
            {
              name: "Author Tag",
              value: message.author?.tag || "Unknown",
              inline: true,
            },
            {
              name: "Channel",
              value: `<#${message.channel.id}>`,
              inline: true,
            },
            { name: "Message ID", value: message.id, inline: true },
          );

        if (isUpdate) {
          embed.addFields({
            name: "Jump to Message",
            value: `[Click here](${message.url})`,
            inline: true,
          });
        }

        // Add message content if available (truncate if too long)
        if (oldMessage && oldMessage.content && isUpdate) {
          const oldContent =
            oldMessage.content.length > 1024
              ? oldMessage.content.substring(0, 1020) + "..."
              : oldMessage.content;
          embed.addFields({ name: "Old Content", value: oldContent });
        }

        if (message.content) {
          const content =
            message.content.length > 1024
              ? message.content.substring(0, 1020) + "..."
              : message.content;
          const fieldName =
            isUpdate && oldMessage?.content !== message.content
              ? "New Content"
              : "Deleted Content";
          embed.addFields({ name: fieldName, value: content });
        }

        return embed;
      },
    };
  };
}

export default function (bot, options) {
  return new EmbedTemplates(bot, options);
}
