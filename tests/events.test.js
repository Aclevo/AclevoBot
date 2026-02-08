import { describe, it, beforeAll, afterAll, expect } from "bun:test";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsDir = path.resolve(__dirname, "../src/features/events");

const makeCache = (items) => {
  const map = new Map(items.map((item) => [item.id, item]));
  return {
    size: map.size,
    keys: () => map.keys(),
    get: (id) => map.get(id),
    map: (fn) => Array.from(map.values()).map(fn),
    filter: (fn) => makeCache(Array.from(map.values()).filter(fn)),
    values: () => map.values(),
  };
};

const makeCollection = (items) => ({
  size: items.length,
  map: (fn) => items.map(fn),
  first: () => items[0],
});

const makeGuild = () => ({
  id: "guild-1",
  name: "Test Guild",
  memberCount: 42,
  createdTimestamp: Date.now() - 1000 * 60 * 60 * 24,
  ownerId: "owner-1",
  preferredLocale: "en-US",
  description: "Test description",
  available: true,
  iconURL: () => "https://example.com/icon.png",
  channels: {
    fetch: async () => {},
    cache: makeCache([]),
  },
  roles: {
    fetch: async () => {},
    cache: makeCache([]),
  },
  members: {
    fetch: async () => {},
    cache: makeCache([]),
  },
  fetchAuditLogs: async () => ({ entries: new Map() }),
});

const makeUser = (id = "user-1") => ({
  id,
  tag: `User#${id.slice(-4)}`,
  username: `User${id.slice(-2)}`,
  createdTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 30,
  bot: false,
  displayAvatarURL: () => "https://example.com/avatar.png",
});

const makeMember = (guild, user) => ({
  id: user.id,
  user,
  guild,
  nickname: null,
  joinedTimestamp: Date.now() - 1000 * 60 * 60,
  communicationDisabledUntilTimestamp: null,
  roles: {
    cache: makeCache([]),
  },
});

const makeChannel = (guild, id = "channel-1") => ({
  id,
  name: "general",
  guild,
  type: 0,
  createdTimestamp: Date.now() - 1000 * 60 * 60,
  topic: "Topic",
  nsfw: false,
  rateLimitPerUser: 0,
});

const makeThread = (guild, parent, id = "thread-1") => ({
  id,
  name: "thread-name",
  guild,
  parent,
  ownerId: "user-1",
  archived: false,
  locked: false,
  autoArchiveDuration: 60,
  createdTimestamp: Date.now() - 1000 * 60,
});

const makeMessage = (guild, channel, author, id = "message-1") => ({
  id,
  content: "Hello world",
  author,
  channel,
  guild,
  url: `https://discord.com/channels/${guild.id}/${channel.id}/${id}`,
  mentions: {
    has: () => false,
    everyone: false,
  },
  reply: async () => {},
});

const makeReaction = (message, emojiName = "😀") => ({
  partial: false,
  emoji: {
    name: emojiName,
    toString: () => emojiName,
  },
  message,
  fetch: async () => {},
});

const makeBot = () => ({
  logger: {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  },
  uptime: {
    startAt: Date.now(),
    readyAt: null,
  },
  config: {
    colors: {
      red: 1,
      green: 2,
      blue: 3,
      yellow: 4,
      orange: 5,
      lime: 6,
    },
    discord: {
      owners: [],
      registerCommandsOnStart: false,
      cacheOnStart: false,
      botInvitePerms: 8,
    },
  },
  baseDir: path.resolve(__dirname, "../src"),
  runtime: {
    timers: new Set(),
    shuttingDown: false,
    logChannelCache: new Map(),
    serverInfoCache: new Map(),
  },
  client: {
    user: {
      id: "bot-1",
      tag: "Bot#0001",
      displayAvatarURL: () => "https://example.com/bot.png",
    },
    guilds: {
      cache: makeCache([]),
    },
    isReady: () => false,
  },
  commands: {
    slash: new Map(),
    slash_data: [],
  },
  functions: {
    getLogChannel: () => ({
      send: async () => {},
    }),
    sleep: async () => {},
    genError: async () => ({ title: "err", color: 1, fields: [] }),
  },
  utils: {
    auditLog: {
      fetchLatest: async () => null,
    },
  },
});

const buildEventParams = () => {
  const guild = makeGuild();
  const user = makeUser();
  const author = makeUser("user-2");
  const channel = makeChannel(guild);
  const message = makeMessage(guild, channel, author);
  const reaction = makeReaction(message);
  const thread = makeThread(guild, channel);

  const role = {
    id: "role-1",
    name: "Role",
    hexColor: "#ffffff",
    color: 16777215,
    position: 1,
    mentionable: false,
    hoist: false,
    guild,
  };
  const updatedRole = {
    ...role,
    name: "Role 2",
    hexColor: "#000000",
    color: 0,
    mentionable: true,
    hoist: true,
  };

  const emoji = {
    id: "emoji-1",
    name: "smile",
    animated: false,
    url: "https://example.com/emoji.png",
    guild,
  };
  const updatedEmoji = { ...emoji, name: "smile2" };

  const sticker = {
    id: "sticker-1",
    name: "sticker",
    format: 1,
    description: "desc",
    tags: "tag",
    url: "https://example.com/sticker.png",
    guild,
  };
  const updatedSticker = { ...sticker, name: "sticker2" };

  const scheduledEvent = {
    id: "event-1",
    name: "Event",
    description: "Event desc",
    guild,
    channelId: channel.id,
    creatorId: user.id,
    scheduledStartAt: new Date(Date.now() + 60000),
    scheduledEndAt: new Date(Date.now() + 3600000),
    status: 1,
  };
  const updatedScheduledEvent = {
    ...scheduledEvent,
    name: "Event 2",
    description: "Event desc 2",
    scheduledStartAt: new Date(Date.now() + 120000),
    scheduledEndAt: new Date(Date.now() + 7200000),
    status: 2,
  };

  const invite = {
    code: "abc",
    guild,
    channel,
    inviter: user,
    maxUses: 0,
    uses: 0,
    temporary: false,
    expiresAt: null,
  };

  const automodRule = {
    id: "rule-1",
    name: "Rule",
    enabled: true,
    creatorId: user.id,
    guild,
    exemptRoles: makeCache([]),
    exemptChannels: makeCache([]),
  };
  const automodRuleUpdated = {
    ...automodRule,
    name: "Rule 2",
    enabled: false,
  };

  const automodExecution = {
    guild,
    ruleId: "rule-1",
    ruleName: "Rule",
    action: { type: 1 },
    userId: user.id,
    channelId: channel.id,
    matchedContent: "bad word",
    matchedKeyword: "bad",
  };

  const member = makeMember(guild, user);
  const memberUpdated = {
    ...member,
    nickname: "NewNick",
    roles: {
      cache: makeCache([{ id: "role-1" }]),
    },
    communicationDisabledUntilTimestamp: Date.now() + 1000 * 60,
  };

  const voiceStateOld = {
    member,
    channel: null,
    guild,
    selfMute: false,
    selfDeaf: false,
    serverMute: false,
    serverDeaf: false,
    streaming: false,
    selfVideo: false,
  };
  const voiceStateNew = {
    ...voiceStateOld,
    channel,
    selfMute: true,
  };

  return {
    guild,
    user,
    channel,
    message,
    reaction,
    thread,
    role,
    updatedRole,
    emoji,
    updatedEmoji,
    sticker,
    updatedSticker,
    scheduledEvent,
    updatedScheduledEvent,
    invite,
    automodRule,
    automodRuleUpdated,
    automodExecution,
    member,
    memberUpdated,
    voiceStateOld,
    voiceStateNew,
  };
};

const buildParamsByName = (fixtures) => ({
  debug: ["payload"],
  clientReady: [],
  interactionCreate: [
    {
      user: fixtures.user,
      isChatInputCommand: () => false,
      reply: async () => {},
    },
  ],
  messageCreate: [fixtures.message],
  messageUpdate: [
    fixtures.message,
    { ...fixtures.message, content: "Updated" },
  ],
  messageDelete: [fixtures.message],
  messageDeleteBulk: [
    makeCollection([fixtures.message, { ...fixtures.message, id: "m2" }]),
  ],
  messageReactionAdd: [fixtures.reaction, fixtures.user],
  messageReactionRemove: [fixtures.reaction, fixtures.user],
  messageReactionRemoveAll: [fixtures.message],
  messageReactionRemoveEmoji: [fixtures.reaction],
  channelCreate: [fixtures.channel],
  channelUpdate: [fixtures.channel, { ...fixtures.channel, name: "general-2" }],
  channelDelete: [fixtures.channel],
  webhookUpdate: [fixtures.channel],
  guildCreate: [fixtures.guild],
  guildDelete: [fixtures.guild],
  guildUpdate: [fixtures.guild, { ...fixtures.guild, name: "Test Guild 2" }],
  guildMemberAdd: [fixtures.member],
  guildMemberRemove: [fixtures.member],
  guildMemberUpdate: [fixtures.member, fixtures.memberUpdated],
  guildBanAdd: [{ user: fixtures.user, guild: fixtures.guild, reason: null }],
  guildBanRemove: [
    { user: fixtures.user, guild: fixtures.guild, reason: null },
  ],
  roleCreate: [fixtures.role],
  roleUpdate: [fixtures.role, fixtures.updatedRole],
  roleDelete: [fixtures.role],
  emojiCreate: [fixtures.emoji],
  emojiUpdate: [fixtures.emoji, fixtures.updatedEmoji],
  emojiDelete: [fixtures.emoji],
  inviteCreate: [fixtures.invite],
  inviteDelete: [fixtures.invite],
  autoModerationRuleCreate: [fixtures.automodRule],
  autoModerationRuleUpdate: [fixtures.automodRule, fixtures.automodRuleUpdated],
  autoModerationRuleDelete: [fixtures.automodRule],
  autoModerationActionExecution: [fixtures.automodExecution],
  voiceStateUpdate: [fixtures.voiceStateOld, fixtures.voiceStateNew],
  threadCreate: [fixtures.thread],
  threadUpdate: [fixtures.thread, { ...fixtures.thread, name: "thread-2" }],
  threadDelete: [fixtures.thread],
  threadMembersUpdate: [
    makeCollection([fixtures.member]),
    makeCollection([]),
    fixtures.thread,
  ],
  guildScheduledEventCreate: [fixtures.scheduledEvent],
  guildScheduledEventUpdate: [
    fixtures.scheduledEvent,
    fixtures.updatedScheduledEvent,
  ],
  guildScheduledEventDelete: [fixtures.scheduledEvent],
  guildScheduledEventUserAdd: [fixtures.scheduledEvent, fixtures.user],
  guildScheduledEventUserRemove: [fixtures.scheduledEvent, fixtures.user],
  guildStickerCreate: [fixtures.sticker],
  guildStickerUpdate: [fixtures.sticker, fixtures.updatedSticker],
  guildStickerDelete: [fixtures.sticker],
});

const collectEventFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectEventFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(full);
    }
  }
  return files;
};

describe("events", () => {
  let originalSetTimeout;

  beforeAll(() => {
    originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = () => 0;
  });

  afterAll(() => {
    globalThis.setTimeout = originalSetTimeout;
  });

  it("loads and runs event handlers with mocks", async () => {
    const files = await collectEventFiles(eventsDir);
    const fixtures = buildEventParams();
    const paramsByName = buildParamsByName(fixtures);
    const bot = makeBot();

    for (const file of files) {
      const mod = await import(pathToFileURL(file).href);
      const event = mod.default ?? mod;
      const meta = event.meta?.() ?? event.meta;
      expect(meta?.name).toBeTruthy();
      expect(typeof event.run).toBe("function");

      const params = paramsByName[meta.name];
      expect(params).toBeTruthy();
      await event.run(bot, params);
    }
  });
});
