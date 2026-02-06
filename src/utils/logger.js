/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { promises as fs } from "fs";
import { join } from "path";

const meta = () => {
  return {
    name: "Logger",
    description: "Logs things to the CONSOLE and files.",
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
  LOG: logColors.FgWhite,
};
const knownLocations = {
  SYSTEM: logColors.FgGreen,
  BOOTSTRAP: logColors.FgMagenta,
  DISCORD: logColors.FgCyan,
};

// Map log levels to console methods
const consoleMethods = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
  LOG: "log",
  SUCCESS: "log",
};

class Logger {
  constructor(bot) {
    this.bot = bot;
    this.logLocation = join(process.cwd(), "logs");
    this.writeQueue = Promise.resolve();
    // Fire-and-forget; awaited inside logToFile.
    this.ensureLogDir = fs.mkdir(this.logLocation, { recursive: true });
  }

  genDT = () => {
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, "0");

    return (
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    );
  };

  logToFile = async (data) => {
    const run = async () => {
      try {
        await this.ensureLogDir;

        // Check if log file exists and rotate if too large (> 10MB)
        const logFileName = `${this.bot.uptime?.startAt || "current"}-log.log`;
        const logFilePath = join(this.logLocation, logFileName);

        try {
          const stats = await fs.stat(logFilePath);
          if (stats.size > 10 * 1024 * 1024) {
            // 10MB
            const rotatedFileName = `${this.bot.uptime?.startAt || "current"}-log-${Date.now()}.log`;
            const rotatedFilePath = join(this.logLocation, rotatedFileName);
            await fs.rename(logFilePath, rotatedFilePath);
          }
        } catch (err) {
          // Ignore missing file; rethrow others
          if (err?.code !== "ENOENT") throw err;
        }

        await fs.appendFile(logFilePath, `${data}\n`);
      } catch (err) {
        console.error("Failed to write to log file:", err.message);
      }
    };

    this.writeQueue = this.writeQueue.then(run, run);
    return this.writeQueue;
  };

  genMsg = (type, location, msg) => {
    const timestamp = this.genDT();
    const typeColor = knownTypes[type] || logColors.FgWhite;
    const locationColor = knownLocations[location] || logColors.FgWhite;

    // Use appropriate console method based on log type
    const consoleMethod = consoleMethods[type] || "log";

    console[consoleMethod](
      `${logColors.Reset}[` +
        `${logColors.FgCyan}${timestamp}` +
        `${logColors.Reset} · ` +
        `${typeColor}${type}` +
        `${logColors.Reset} | ` +
        `${locationColor}${location}` +
        `${logColors.Reset}]: ` +
        msg +
        logColors.Reset,
    );

    // Log to file asynchronously
    setImmediate(() => {
      this.logToFile(`[${timestamp} · ${type} | ${location}]: ${msg}`).catch(
        (err) => {
          console.error("Error in logToFile:", err.message);
        },
      );
    });
  };

  log = (location, msg) => {
    this.genMsg("LOG", location, msg);
  };

  error = (location, msg) => {
    this.genMsg("ERROR", location, msg);
  };

  info = (location, msg) => {
    this.genMsg("INFO", location, msg);
  };

  warn = (location, msg) => {
    this.genMsg("WARN", location, msg);
  };

  success = (location, msg) => {
    this.genMsg("SUCCESS", location, msg);
  };

  debug = (location, msg) => {
    if (this.bot.config?.debug) this.genMsg("DEBUG", location, msg);
  };
}

export default (bot) => {
  return {
    meta,
    execute: Logger,
  };
};
