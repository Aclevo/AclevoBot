import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "interactionCreate",
  run: async (bot, params) => {
    const interaction = params[0];

    interaction.userSettings = {};

    if (!interaction.isChatInputCommand()) return;

    const command = bot.commands.slash.get(interaction.commandName);
    if (!command) return interaction.reply("I couldn't find that command.");

    if (
      command.meta.ownerOnly &&
      !bot.config.discord.owners.includes(interaction.user.id)
    ) {
      return interaction.reply({
        embeds: [
          {
            title: `❌ This command can only be ran by bot owners.`,
            color: bot.config.colors.red,
          },
        ],
      });
    }

    try {
      // Run command.
      await command.execute(bot, interaction);
    } catch (Ex) {
      const errEmbed = await bot.functions.genError(interaction, Ex);

      return interaction.reply({ embeds: [errEmbed] });
    } finally {
      // Save command execution.
    }
  },
});
