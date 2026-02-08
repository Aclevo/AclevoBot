/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { AuditLogEvent } from "discord.js";

const meta = () => {
  return {
    name: "auditLog",
    description: "Audit log helper utilities.",
  };
};

class AuditLog {
  constructor(bot) {
    this.bot = bot;
  }

  fetchLatest = async (guild, action, targetId, options = {}) => {
    if (!guild?.fetchAuditLogs) return null;

    const type =
      typeof action === "string" && AuditLogEvent[action] !== undefined
        ? AuditLogEvent[action]
        : action;

    try {
      const audit = await guild.fetchAuditLogs({
        type,
        limit: options.limit ?? 6,
      });
      let entries = [...audit.entries.values()];

      if (targetId) {
        entries = entries.filter((entry) => entry.target?.id === targetId);
      }

      return entries[0] || null;
    } catch {
      return null;
    }
  };
}

export default {
  meta,
  execute: AuditLog,
};
