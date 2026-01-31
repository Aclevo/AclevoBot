/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class guildMemberUpdate {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "guildMemberUpdate",
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
    const [oldMember, newMember] = params;

    bot.logger.info("DISCORD", `Member updated: ${newMember.user.tag} in guild ${newMember.guild.name} (${newMember.guild.id})`);

    // Could be extended to log member updates, etc.
    // For now, just log the event
  };
}

export default function () {
  return new guildMemberUpdate();
}
