/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class messageReactionRemove {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "messageReactionRemove",
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

    bot.logger.info("DISCORD", `${user.tag} removed reaction ${reaction.emoji.name} from message in #${reaction.message.channel.name}`);

    // Could be extended to handle reaction roles removal, etc.
    // For now, just log the event
  };
}

export default function () {
  return new messageReactionRemove();
}
