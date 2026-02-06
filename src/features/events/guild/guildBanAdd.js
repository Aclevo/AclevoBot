import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildBanAdd",
  run: async (bot, params) => {
    const [ban] = params;

    bot.logger.info("DISCORD", `${ban.user.tag} was banned from ${ban.guild.name} (${ban.guild.id})`);

    // Could be extended to log bans, etc.
    // For now, just log the event

  },
});
