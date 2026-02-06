import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildUpdate",
  run: async (bot, params) => {
    const [oldGuild, newGuild] = params;

    bot.logger.info("DISCORD", `Guild updated: ${newGuild.name} (${newGuild.id})`);

    // Could be extended to log guild updates, etc.
    // For now, just log the event

  },
});
