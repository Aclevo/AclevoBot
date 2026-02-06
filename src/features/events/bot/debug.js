import defineEvent from "../../../utils/defineEvent.js";

export default defineEvent({
  name: "debug",
  run: async (bot, params) => {
    const data = params[0];

    if (/(Sending a heartbeat|Latency of)/i.test(data)) return null;
    if (bot.logger) bot.logger.debug("DISCORD", data);
    else console.log(data);

  },
});
