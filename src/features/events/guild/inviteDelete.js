import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "inviteDelete",
  run: async (bot, params) => {
    const [invite] = params;

    bot.logger.info("DISCORD", `Invite deleted in ${invite.guild.name} - Code: ${invite.code}`);

    // Could be extended to log invite deletion, etc.
    // For now, just log the event

  },
});
