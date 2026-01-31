/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("explode")
    .setDescription("MAKE THAT THING GO KABOOM!")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The target to explode")
        .setRequired(true),
    );
};

const execute = async (bot, interaction) => {
  const target = interaction.options.getUser("target");
  const sender = interaction.user;

  if (target.id === sender.id) {
    await interaction.reply({
      content: "Why would you want to send a bomb to yourself???",
    });
    return;
  }

  let embed = {
    author: {
      name: `Bomb sent by ${sender.username}`,
      icon_url: sender.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 }),
    },
    color: bot.config.colors.blue,
    fields: [
      { name: "BOOM!", value: `${target} has been kaboom'd!` },
      { name: "But, uh...", value: "That explosion made a huge mess..." },
    ],
  };

  const url = `${bot.config.system.imgAPI}explosion`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    } else {
      const body = await res.json();
      if (body.url != null) {
        embed.image = { url: body.url };
      }
    }
  } catch (error) {
    bot.logger.error("SYS", `Failed fetch of image: ${url} | ${error.message}`);
  }

  await interaction.reply({
    embeds: [embed],
  });
};

export default (app) => ({
  meta,
  execute,
});
