/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("botcontrols")
    .setDescription("Bot Control.")
    .setDefaultMemberPermissions(0) // Only owner can use this
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("The action to perform (restart or shutdown)")
        .setRequired(true)
        .addChoices(
          { name: "Restart", value: "restart" },
          { name: "Shutdown", value: "shutdown" },
        ),
    );
};

const execute = async (bot, interaction) => {
  async function srHandle(type) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("agree")
        .setLabel(`Yes, ${type.toLowerCase()} now`)
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("disagree")
        .setLabel("Nevermind")
        .setStyle("Danger"),
    );

    await interaction.reply({
      embeds: [
        {
          title: `⚠️ **${type}**`,
          color: bot.config.colors.yellow,
          fields: [
            {
              name: `Are you sure you wish for me to ${type}?`,
              value: `To confirm, use the buttons.`,
            },
          ],
        },
      ],
      components: [row],
    });

    const filter = (i) =>
      ["agree", "disagree"].includes(i.customId) &&
      i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 90000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "agree") {
        bot.commandState = type;
        const actionDoing =
          type === "Shutdown" ? "Shutting down" : "Restarting";

        await i.update({
          embeds: [
            {
              title: `⏳ **${actionDoing}**`,
              color: bot.config.colors.blue,
              description: `I'm ${type === "Shutdown" ? "shutting down and will be gone in a moment." : "restarting! Be back soon!"}`,
            },
          ],
          components: [],
        });

        bot.logger.debug(
          "SYS",
          `${bot.name} ${actionDoing.toLowerCase()} as of ${new Date()}.`,
        );

        if (type === "Restart") {
          // Restart logic would go here
          console.log("Restarting bot...");
          // Note: Actual restart/shutdown logic would need to be implemented carefully
        } else {
          // Shutdown logic would go here
          console.log("Shutting down bot...");
          // Note: Actual shutdown logic would need to be implemented carefully
        }
      } else if (i.customId === "disagree") {
        await i.update({
          embeds: [
            {
              title: `❌ **${type}**`,
              color: bot.config.colors.red,
              description: "Operation cancelled.",
            },
          ],
          components: [],
        });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size < 1) {
        await interaction.editReply({
          embeds: [
            {
              title: `❌ **${type}**`,
              color: bot.config.colors.red,
              description: "Operation timed out.",
            },
          ],
          components: [],
        });
      }
    });
  }

  const action = interaction.options.getString("action");

  switch (action) {
    case "shutdown":
      await srHandle("Shutdown");
      break;
    case "restart":
      await srHandle("Restart");
      break;
    default:
      await interaction.reply({
        content: "I do not know what you want me to do!",
        ephemeral: true,
      });
      break;
  }
};

export default {
  meta,
  execute,
};
