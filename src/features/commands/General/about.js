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
  var calculateTime = (time) => {
    let seconds = Math.floor(time / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${seconds % 60} seconds`;
  };

  // Measure memory for the main Bun process.
  const memory = process.memoryUsage();
  const mib = (bytes) => (bytes / 1024 / 1024).toFixed(2);

  // Measure CPU over a real elapsed-time interval.
  const cpuBefore = process.cpuUsage();
  const startTime = performance.now();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const cpuDelta = process.cpuUsage(cpuBefore);
  const elapsedMs = performance.now() - startTime;

  const cpuPercent =
    ((cpuDelta.user + cpuDelta.system) / (elapsedMs * 1000)) * 100;

  await interaction.reply({
    embeds: [
      {
        title: `ℹ️ All about your favorite bot, **${bot.client.user.tag}**!`,
        color: bot.config.colors.blue,
        thumbnail: {
          url: bot.client.user.displayAvatarURL({
            extension: "png",
            dynamic: true,
            size: 1024,
          }),
        },
        fields: [
          { name: "Bot Information", value: "** **" },
          { name: "User Tag", value: `${bot.client.user.tag}`, inline: true },
          { name: "User ID", value: `${bot.client.user.id}`, inline: true },
          {
            name: "Bot Version",
            value: `v1.0 STABLE`,
            inline: true,
          },
          {
            name: "Bot Uptime",
            value: `${calculateTime(bot.client.uptime)}`,
            inline: true,
          },
          {
            name: "Emoji Count",
            value: "N/A",
            inline: true,
          },
          {
            name: "Embed Color Count",
            value: "10 total",
            inline: true,
          },
          {
            name: "RPS Count",
            value: "N/A",
            inline: true,
          },
          {
                      name: "Bot Memory Usage",
                      value:
                        `RSS: ${mib(memory.rss)} MiB\n` +
                        `JS Heap: ${mib(memory.heapUsed)} MiB`,
                      inline: true,
          },
          {
            name: "Servers I'm In",
            value: `${bot.client.guilds.cache.size} total`,
            inline: true,
          },
          { name: "Host System Information", value: "** **" },
          { name: "Bun Version", value: Bun.version, inline: true },
          {
            name: "Nodejs Compatibility Version",
            value: `${process.version}`,
            inline: true,
          },
          {
            name: "Bunjs Uptime",
            value: `${calculateTime(process.uptime())}`,
            inline: true,
          },
          {
            name: "Bunjs Execution Path",
            value: `${process.execPath}`,
            inline: true,
          },
          { name: "Process PID", value: `${process.pid}`, inline: true },
          {
            name: "System Platform",
            value: `${process.platform} ${process.arch}`,
            inline: true,
          },
          {
            name: "CPU Usage",
            value: `${cpuPercent.toFixed(2)}% of one core`,
            inline: true,
          },
        ],
      },
    ],
  });
};

export default {
  meta,
  execute,
};
