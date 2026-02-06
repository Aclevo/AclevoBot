/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { existsSync, mkdirSync } from "fs";
import { randomFillSync } from "crypto";

const meta = () => {
  return {
    name: "Error Handler",
    description: "Handles error things.",
  };
};

class ErrorLog {
  constructor(bot) {
    this.bot = bot;
    this.logLocation = new URL("../../errors", import.meta.url).pathname;

    // Ensure the errors directory exists
    if (!existsSync(this.logLocation)) {
      mkdirSync(this.logLocation, { recursive: true });
    }
  }

  log = (error) => {
    // This is where we want to create a reference number so that support can find
    //  the error once provided and someone can fix it :)
    let refID;

    const { message, stack, rawData } = error;

    const errData = {
      message,
      stack,
      rawData,
      generated: new Date().getTime(),
    };

    const genRefID = () => {
      const buffer = Buffer.alloc(10); // 8+6+8 = 22 hex chars = 11 bytes total
      randomFillSync(buffer);
      const hex = buffer.toString("hex");
      return [hex.substr(0, 8), hex.substr(8, 4), hex.substr(12, 8)].join("-");
    };

    // Generate a unique reference ID
    refID = genRefID();

    // Use Bun's file operations for better performance
    const errorFilePath = `${this.logLocation}/${refID}-error.log`;
    Bun.write(
      Bun.file(errorFilePath),
      JSON.stringify(errData, null, "\t"),
    ).catch(console.error); // Handle any errors from Bun.write

    return refID;
  };
}

export default {
  meta,
  execute: ErrorLog,
};
