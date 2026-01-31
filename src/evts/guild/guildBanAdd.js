/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class guildBanAdd {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "guildBanAdd",
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
    const [ban] = params;

    bot.logger.info("DISCORD", `${ban.user.tag} was banned from ${ban.guild.name} (${ban.guild.id})`);

    // Could be extended to log bans, etc.
    // For now, just log the event
  };
}

export default function () {
  return new guildBanAdd();
}
