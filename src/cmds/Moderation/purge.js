/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge those spicy messages")
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Number of messages to delete")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(99),
    );
};

const execute = async (bot, interaction) => {
  const count = interaction.options.getInteger("count");

  try {
    // Fetch messages to delete
    const fetchedMessages = await interaction.channel.messages.fetch({
      limit: count + 1,
    }); // +1 to include the command message

    // Filter out pinned messages and the command message itself
    const messagesToDelete = fetchedMessages.filter(
      (msg) => !msg.pinned && msg.id !== interaction.id,
    );

    // Bulk delete the messages
    const deletedMessages = await interaction.channel.bulkDelete(
      messagesToDelete,
      true,
    ); // true for bypassing age restriction

    await interaction.reply({
      embeds: [
        {
          title: `✅ Purge Successful!`,
          color: bot.config.colors.lime,
          description: `Successfully purged ${deletedMessages.size} spicy messages!`,
          footer: {
            text: "This message will disappear in a few seconds.",
          },
        },
      ],
    });

    // Delete the success message after 5 seconds
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (error) {
        // Ignore if the message was already deleted
      }
    }, 5000);
  } catch (error) {
    await interaction.reply({
      embeds: [
        {
          title: `❌ Uh-Oh! Something went wrong!`,
          color: bot.config.colors.red,
          description: `Could not purge messages due to: **${error.message}**`,
          footer: {
            text: "An error occurred.",
          },
        },
      ],
      ephemeral: true,
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
