import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "emojiUpdate",
  run: async (bot, params) => {
    const [oldEmoji, newEmoji] = params;

    bot.logger.info("DISCORD", `Emoji updated: ${newEmoji.name} in guild ${newEmoji.guild.name} (${newEmoji.guild.id})`);

    // Could be extended to log emoji updates, etc.
    // For now, just log the event

  },
});
