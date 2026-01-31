/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class messageDeleteBulk {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "messageDeleteBulk",
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
    const [messages] = params;

    bot.logger.info("DISCORD", `Bulk message deletion: ${messages.size} messages deleted in a channel`);

    // Could be extended to log bulk deletions, etc.
    // For now, just log the event
  };
}

export default function () {
  return new messageDeleteBulk();
}
