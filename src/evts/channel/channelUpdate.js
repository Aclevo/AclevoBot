/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class channelUpdate {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "channelUpdate",
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
    const [oldChannel, newChannel] = params;

    bot.logger.info("DISCORD", `Channel updated: #${newChannel.name} in guild ${newChannel.guild.name} (${newChannel.guild.id})`);

    // Could be extended to log channel updates, etc.
    // For now, just log the event
  };
}

export default function () {
  return new channelUpdate();
}
