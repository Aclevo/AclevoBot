import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "guildMemberUpdate",
  run: async (bot, params) => {
    const [oldMember, newMember] = params;

    bot.logger.info("DISCORD", `Member updated: ${newMember.user.tag} in guild ${newMember.guild.name} (${newMember.guild.id})`);

    // Could be extended to log member updates, etc.
    // For now, just log the event

  },
});
