import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "channelUpdate",
  run: async (bot, params) => {
    const [oldChannel, newChannel] = params;

    bot.logger.info("DISCORD", `Channel updated: #${newChannel.name} in guild ${newChannel.guild.name} (${newChannel.guild.id})`);

    // Could be extended to log channel updates, etc.
    // For now, just log the event

  },
});
