/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class messageReactionAdd {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "messageReactionAdd",
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
    const [reaction, user] = params;

    bot.logger.info("DISCORD", `${user.tag} reacted with ${reaction.emoji.name} to message in #${reaction.message.channel.name}`);

    // Could be extended to handle reaction roles, etc.
    // For now, just log the event
  };
}

export default function () {
  return new messageReactionAdd();
}
