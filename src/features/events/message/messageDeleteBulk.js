import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageDeleteBulk",
  run: async (bot, params) => {
    const [messages] = params;

    bot.logger.info("DISCORD", `Bulk message deletion: ${messages.size} messages deleted in a channel`);

    // Could be extended to log bulk deletions, etc.
    // For now, just log the event

  },
});
