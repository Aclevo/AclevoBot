import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "messageReactionRemove",
  run: async (bot, params) => {
    const [reaction, user] = params;

    bot.logger.info("DISCORD", `${user.tag} removed reaction ${reaction.emoji.name} from message in #${reaction.message.channel.name}`);

    // Could be extended to handle reaction roles removal, etc.
    // For now, just log the event

  },
});
