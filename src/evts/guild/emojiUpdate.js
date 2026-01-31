/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class emojiUpdate {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "emojiUpdate",
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
    const [oldEmoji, newEmoji] = params;

    bot.logger.info("DISCORD", `Emoji updated: ${newEmoji.name} in guild ${newEmoji.guild.name} (${newEmoji.guild.id})`);

    // Could be extended to log emoji updates, etc.
    // For now, just log the event
  };
}

export default function () {
  return new emojiUpdate();
}
