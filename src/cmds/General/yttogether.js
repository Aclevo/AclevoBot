/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("yttogether")
    .setDescription("Generate a YouTube Together [BETA] link!");
};

const execute = async (bot, interaction) => {
  function title(emoji) {
    const response = "▶️ **YouTube Together**";
    return response;
  }

  if (!interaction.guild) {
    await interaction.reply({
      content: `${title("error")}\nYou cannot execute this in DMs!`,
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.member.voice.channel;
  if (!channel) {
    await interaction.reply({
      content: `${title("error")}\nPlease join a voice channel first!!`,
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: title("wait") + "\nGenerating link, please wait.",
  });

  try {
    const response = await fetch(
      `https://discord.com/api/v9/channels/${channel.id}/invites`,
      {
        method: "POST",
        body: JSON.stringify({
          max_age: 86400,
          max_uses: 0,
          target_application_id: "755600276941176913",
          target_type: 2,
          temporary: false,
          validate: null,
        }),
        headers: {
          Authorization: `Bot ${bot.client.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const invite = await response.json();

    if (!invite.code) {
      await interaction.editReply(
        `${title("error")}\nSorry, something went wrong and I could create the link.`,
      );
    } else if (invite.code === 10003) {
      await interaction.editReply(
        `${title("error")}\nSorry, I could not find the channel.`,
      );
    } else {
      await interaction.editReply(
        `${title("success")}\nLink generated!\nhttps://discord.com/invite/${invite.code}`,
      );
    }
  } catch (error) {
    await interaction.editReply(
      `${title("error")}\nSorry, something went wrong: ${error.message}`,
    );
  }
};

export default (app) => ({
  meta,
  execute,
});
