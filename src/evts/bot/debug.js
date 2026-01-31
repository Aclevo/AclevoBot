/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

class debug {
  constructor() {
    this.functions = [];
  }

  meta = () => {
    return {
      name: "debug",
      type: "normal",
    };
  };

  add = (fun) => {
    this.functions.push(fun);
  };

  run = (app, params) => {
    this.default(app, params); // Run default function
    this.functions.forEach((fun) => fun(app, params)); // Run other functions.
  };

  default = async (bot, params) => {
    const data = params[0];

    if (/(Sending a heartbeat|Latency of)/i.test(data)) return null;
    if (bot.logger) bot.logger.debug("DISCORD", data);
    else console.log(data);
  };
}

export default function () {
  return new debug();
}
