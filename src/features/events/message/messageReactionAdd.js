import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageReactionAdd",
  run: async (bot, params) => {
    const [reaction, user] = params;

    bot.logger.info("DISCORD", `${user.tag} reacted with ${reaction.emoji.name} to message in #${reaction.message.channel.name}`);

    // Could be extended to handle reaction roles, etc.
    // For now, just log the event

  },
});
