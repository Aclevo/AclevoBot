import { EmbedBuilder } from "discord.js";
import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildMemberUpdate",
  run: async (bot, params) => {
    const [oldMember, newMember] = params;

    bot.logger.info(
      "DISCORD",
      `Member updated: ${newMember.user.tag} in guild ${newMember.guild.name} (${newMember.guild.id})`,
    );

    const updateEmbed = new EmbedBuilder()
      .setColor(bot.config.colors.yellow)
      .setTitle("Member Updated")
      .setDescription(`A member was updated in ${newMember.guild.name}`)
      .addFields(
        { name: "Member", value: `<@${newMember.id}>`, inline: true },
        { name: "User Tag", value: newMember.user.tag, inline: true },
        { name: "User ID", value: newMember.id, inline: true },
      )
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Server: ${newMember.guild.name}`,
        iconURL: newMember.guild.iconURL({ dynamic: true }) || undefined,
      })
      .setTimestamp();

    const oldNick = oldMember.nickname || "None";
    const newNick = newMember.nickname || "None";
    if (oldNick !== newNick) {
      updateEmbed.addFields({
        name: "Nickname Change",
        value: `${oldNick} → ${newNick}`,
      });
    }

    const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
    const newTimeout = newMember.communicationDisabledUntilTimestamp;
    if (oldTimeout !== newTimeout) {
      const formatTimeout = (ts) =>
        ts ? `<t:${Math.floor(ts / 1000)}:R>` : "None";
      updateEmbed.addFields({
        name: "Timeout",
        value: `${formatTimeout(oldTimeout)} → ${formatTimeout(newTimeout)}`,
      });
    }

    const oldRoleIds = new Set(oldMember.roles.cache.keys());
    const newRoleIds = new Set(newMember.roles.cache.keys());

    const addedRoles = newMember.roles.cache.filter(
      (role) => !oldRoleIds.has(role.id),
    );
    const removedRoles = oldMember.roles.cache.filter(
      (role) => !newRoleIds.has(role.id),
    );

    const formatRoles = (roles) => {
      const names = roles.map((role) => `<@&${role.id}>`).join(", ");
      return names.length > 1024 ? `${names.slice(0, 1021)}...` : names;
    };

    if (addedRoles.size > 0) {
      updateEmbed.addFields({
        name: "Roles Added",
        value: formatRoles(addedRoles),
      });
    }

    if (removedRoles.size > 0) {
      updateEmbed.addFields({
        name: "Roles Removed",
        value: formatRoles(removedRoles),
      });
    }

    try {
      const logChannel = bot.functions.getLogChannel(newMember.guild);

      if (logChannel) {
        await logChannel.send({ embeds: [updateEmbed] });
      }
    } catch (error) {
      bot.logger.warn(
        "DISCORD",
        `Could not send member update message: ${error.message}`,
      );
    }
  },
});
