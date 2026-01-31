/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("about")
    .setDescription("Get info about me!");
};

const execute = async (bot, interaction) => {
  const os = require("os"); // Welcome to os(u)~!

  await interaction.reply({
    embeds: [
      {
        title: `${bot.config.system.emotes.information} All about your favorite bot, **${bot.client.user.tag}**!`,
        color: bot.config.colors.blue,
        thumbnail: {
          url: bot.client.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 }),
        },
        fields: [
          { name: "Bot Information", value: "** **" },
          { name: "User Tag", value: `${bot.client.user.tag}`, inline: true },
          { name: "User ID", value: `${bot.client.user.id}`, inline: true },
          { name: "Bot Version", value: bot.version.toFullString(), inline: true },
          { name: "Bot Uptime", value: bot.functions.TStoHR(bot.client.uptime), inline: true },
          { name: "Emote Count", value: `${Object.keys(bot.config.system.emotes).length} total`, inline: true },
          {
            name: "Embed Color Count",
            value: `${Object.keys(bot.config.system.embedColors).length} total`,
            inline: true,
          },
          {
            name: "RPS Count",
            value: `${Object.keys(bot.config.system.rotatingStatus.statuses).length} total`,
            inline: true,
          },
          {
            name: "Bot Memory Usage",
            value: `${(Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100)} MiB`,
            inline: true,
          },
          { name: "Servers I'm In", value: `${bot.client.guilds.cache.size} total`, inline: true },
          { name: "Host System Information", value: "** **" },
          { name: "NodeJS Version", value: `${process.version}`, inline: true },
          { name: "NodeJS Uptime", value: bot.functions.TStoHR(process.uptime() * 1000), inline: true },
          { name: "NodeJS Execution Path", value: `${process.execPath}`, inline: true },
          { name: "Process PID", value: `${process.pid}`, inline: true },
          { name: "System Platform", value: `${process.platform}`, inline: true },
          {
            name: process.platform == "linux" ? "Kernel Version" : "System Version",
            value: os.version(),
            inline: true,
          },
          // I'd like to have this show the current CPU usage, I'm open to ideas on how to get it to work. - IDeletedSystem64
        ],
      },
    ],
  });
};

export default (app) => ({
  meta,
  execute,
});
