/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class guildUpdate {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "guildUpdate",
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
    const [oldGuild, newGuild] = params;

    bot.logger.info("DISCORD", `Guild updated: ${newGuild.name} (${newGuild.id})`);

    // Could be extended to log guild updates, etc.
    // For now, just log the event
  };
}

export default function () {
  return new guildUpdate();
}
