/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";

const meta = () => {
  return {
    name: "Logger",
    description: "Logs things to the CONSOLE.",
  };
};

const logColors = {
  Reset: "\x1b[0m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};
const knownTypes = {
  ERROR: logColors.FgRed,
  INFO: logColors.FgBlue,
  WARN: logColors.FgYellow,
  SUCCESS: logColors.FgGreen,
  DEBUG: logColors.FgMagenta,
};
const knownLocations = {
  SYSTEM: logColors.FgGreen,
  BOOTSTRAP: logColors.FgMagenta,
  DATABASE: logColors.FgYellow,
  DISCORD: logColors.FgCyan,
};

class Logger {
  constructor(bot) {
    this.bot = bot;
    this.logLocation = new URL("../../logs", import.meta.url).pathname;
  }

  genDT = () => {
    const pZ = (i) => {
      return `${i < 10 ? "0" : ""}${i}`;
    };
    const currently = new Date();
    return (
      `${pZ(currently.getFullYear())}` +
      "/" +
      `${pZ(currently.getMonth() + 1)}` +
      "/" +
      `${pZ(currently.getDate())}` +
      " " +
      `${pZ(currently.getHours())}` +
      ":" +
      `${pZ(currently.getMinutes())}` +
      ":" +
      `${pZ(currently.getSeconds())}`
    );
  };

  logToFile = async (data) => {
    // Use Bun's file operations for better performance
    const logFilePath = `${this.logLocation}/${this.bot.uptime.startAt}-log.log`;
    await Bun.write(Bun.file(logFilePath), `${data}\r\n`, { flag: "a+" });
  };

  genMsg = (type, location, msg) => {
    const currently = this.genDT();
    const typeColor = knownTypes[type] || logColors.FgWhite;
    const locationColor = knownLocations[location] || logColors.FgWhite;

    console[type.toLowerCase()](
      `${logColors.Reset}[` +
        `${logColors.FgCyan}${currently}` +
        `${logColors.Reset} · ` +
        `${typeColor}${type}` +
        `${logColors.Reset} | ` +
        `${locationColor}${location}` +
        `${logColors.Reset}]:` +
        " " +
        msg,
    );
    // Handle the async logToFile call
    this.logToFile(
      `[` +
        `${currently}` +
        ` · ` +
        `${type}` +
        ` | ` +
        `${location}` +
        `]:` +
        " " +
        msg,
    ).catch(console.error); // Catch any errors from the async operation
  };

  log = (loc, msg) => {
    this.genMsg("LOG", loc, msg);
  };
  error = (loc, msg) => {
    this.genMsg("ERROR", loc, msg);
  };
  info = (loc, msg) => {
    this.genMsg("INFO", loc, msg);
  };
  warn = (loc, msg) => {
    this.genMsg("WARN", loc, msg);
  };
  debug = (loc, msg) => {
    if (this.bot.config.debug) this.genMsg("DEBUG", loc, msg);
  };
}

export default (bot) => {
  return {
    meta,
    execute: Logger,
  };
};
