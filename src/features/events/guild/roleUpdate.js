import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "roleUpdate",
  run: async (bot, params) => {
    const [oldRole, newRole] = params;

    bot.logger.info("DISCORD", `Role updated: ${newRole.name} in guild ${newRole.guild.name} (${newRole.guild.id})`);

    // Could be extended to log role updates, etc.
    // For now, just log the event

  },
});
