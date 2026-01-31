/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class roleUpdate {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "roleUpdate",
      type: "normal",
    };
  };

  add = (fun) => {
    this.functions.push(fun);
  };

  run = (bot, params) => {
    this.default(bot, params); // Run default function
    this.functions.forEach((fun) => fun(bot, params)); // Run other functions.
  };

  default = async (bot, params) => {
    const [oldRole, newRole] = params;

    bot.logger.info("DISCORD", `Role updated: ${newRole.name} in guild ${newRole.guild.name} (${newRole.guild.id})`);

    // Could be extended to log role updates, etc.
    // For now, just log the event
  };
}

export default function () {
  return new roleUpdate();
}
