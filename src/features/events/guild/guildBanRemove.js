import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildBanRemove",
  run: async (bot, params) => {
    const [ban] = params;

    bot.logger.info("DISCORD", `${ban.user.tag} was unbanned from ${ban.guild.name} (${ban.guild.id})`);

    // Could be extended to log unbans, etc.
    // For now, just log the event

  },
});
