/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
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

    const Errors = this.bot.db.models.Errors;

    let exists = 0;
    const genRefID = () => {
      const buffer = Buffer.alloc(10); // 8+6+8 = 22 hex chars = 11 bytes total
      randomFillSync(buffer);
      const hex = buffer.toString("hex");
      return [hex.substr(0, 8), hex.substr(8, 4), hex.substr(12, 8)].join("-");
    };

    let thereWasError = false;

    (async () => {
      while (true) {
        refID = genRefID();
        if (this.bot.db) {
          let dataExist = null;
          try {
            dataExist = await Errors.findOne({ where: { refID } });
          } catch (Ex) {
            this.bot.logger.error(
              "SYSTEM",
              `Failed loading database: ${Ex.message}`,
            );
            thereWasError = true;
            break;
          }
          if (!dataExist) {
            exists = false;
            try {
              await Errors.create({
                refID,
                error: JSON.stringify({
                  message: errData.message,
                  stack: errData.stack,
                }),
                affectedUserID: rawData.interactionUser.id,
                rawData: JSON.stringify(rawData),
              });
            } catch (Ex) {
              this.bot.logger.error(
                "SYSTEM",
                `Failed saving to database: ${Ex.message}`,
              );
              thereWasError = true;
            }
            break;
          }
        } else {
          thereWasError = true;
          break;
        }
      }
      if (thereWasError) {
        // Use Bun's file operations for better performance
        // Since this is in an async IIFE, we can use await
        const errorFilePath = `${this.logLocation}/${refID || errData.generated}-error.log`;
        Bun.write(
          Bun.file(errorFilePath),
          JSON.stringify(errData, null, "\t"),
        ).catch(console.error); // Handle any errors from Bun.write
      }
    })();
    return refID;
  };
}

export default (bot) => {
  return {
    meta,
    execute: ErrorLog,
  };
};
