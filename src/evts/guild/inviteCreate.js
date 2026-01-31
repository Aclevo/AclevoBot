/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 * Ported from TheCodingBot v5
 */

class inviteCreate {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "inviteCreate",
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
    const [invite] = params;

    bot.logger.info("DISCORD", `Invite created in ${invite.guild.name} by ${invite.inviter?.tag || 'unknown'} - Code: ${invite.code}`);

    // Could be extended to log invite creation, etc.
    // For now, just log the event
  };
}

export default function () {
  return new inviteCreate();
}
