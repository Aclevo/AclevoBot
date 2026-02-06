import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "inviteCreate",
  run: async (bot, params) => {
    const [invite] = params;

    bot.logger.info("DISCORD", `Invite created in ${invite.guild.name} by ${invite.inviter?.tag || 'unknown'} - Code: ${invite.code}`);

    // Could be extended to log invite creation, etc.
    // For now, just log the event

  },
});
