/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

const parseBool = (value) => value === "true";

const buildColors = () => {
  const colors = {
    red: 16711680,
    green: 65280,
    blue: 255,
    yellow: 16776960,
    orange: 16753920,
    purple: 8388736,
    pink: 16761035,
    teal: 32768,
    cyan: 65535,
    magenta: 16711935,
  };

  colors.random = (toReturn) => {
    const colorsN = Object.keys(colors).filter((c) => c !== "random");
    const name = colorsN[Math.floor(Math.random() * colorsN.length)];

    return toReturn == "name"
      ? name
      : toReturn == "value"
        ? colors[name]
        : { name, value: colors[name] };
  };

  return colors;
};

const parseOwners = (ownersRaw) => {
  if (!ownersRaw) return [];
  return ownersRaw
    .split(",")
    .map((owner) => owner.trim())
    .filter(Boolean);
};

export default function loadConfig() {
  return {
    debug: parseBool(process.env.BOT_DEBUG_ENABLED),
    apis: {
      base: process.env.API_BASE,
    },
    discord: {
      clientName: process.env.BOT_CLIENT_NAME,
      clientID: process.env.BOT_CLIENT_ID,
      clientSecret: process.env.BOT_CLIENT_SECRET,
      token: process.env.BOT_TOKEN,
      shardingEnabled: parseBool(process.env.BOT_SHARDING_ENABLED),

      enableSlashCommands: parseBool(process.env.COMMAND_SLASH_ENABLED),
      registerCommandsOnStart: parseBool(process.env.COMMAND_SLASH_REG_ON_START),

      owners: parseOwners(process.env.OWNERS),
      supportInviteBase: process.env.LINK_SUPPORT,
      botInviteBase: process.env.LINK_INVITE,
      botInvitePerms: process.env.PERMISSIONS || 8,
      cacheOnStart: parseBool(process.env.BOT_CACHE_ON_START),
    },
    colors: buildColors(),
  };
}
