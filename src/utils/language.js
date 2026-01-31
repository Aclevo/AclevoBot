/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

class Lang {
  constructor(bot) {
    this.bot = bot;
    this.langList = {};
  }

  async init() {
    // Initialization

    this.bot.logger.debug("BOOTSTRAP", `Loading language handler...`);

    // Use Bun.Glob for faster, native file scanning
    const glob = new Bun.Glob("*.json");
    const langDir = `${this.bot.baseDir}/lang`;

    for (const langFile of glob.scanSync({ cwd: langDir })) {
      const startImport = new Date().getTime();
      const fileName = langFile.replace(/\.json$/, "");

      try {
        const langModule = await import(`../lang/${langFile}`);
        const lang = langModule.default;
        const meta = lang.meta;

        this.langList[fileName] = lang;

        this.bot.logger.debug(
          "BOOTSTRAP",
          `Load language ${fileName}: OK in ${new Date().getTime() - startImport}ms.`,
        );
      } catch (Ex) {
        this.bot.logger.error(
          "BOOTSTRAP",
          `Load language ${fileName}: NOT OK - ${Ex.message}.`,
        );
        console.log(Ex.stack);
      }
    }

    // this.bot.logger.debug("BOOTSTRAP", `Languages loaded, creating handler...`);
    this.bot.logger.info("BOOTSTRAP", `Languages handler ready.`);

    return true;
  }

  get(key, lang, placeholders = {}) {
    let theLang = this.langList[lang];
    if (!theLang) theLang = this.langList["en_US"];
    if (!theLang) return key;

    let transString = theLang.translation;

    // Find nested string (ex. 'hello_world.title' -> 'hello_world: { title: "Hello world!" }')
    const keys = key.split(".");
    for (const nKeys of keys) {
      if (!transString[nKeys]) return key;
      transString = transString[nKeys];
    }

    // Handle placeholders
    for (const placeholder in placeholders) {
      const plValue = placeholders[placeholder];
      const plPattern = new RegExp(`%${placeholder.toUpperCase()}%`, "g");
      transString = transString.replace(plPattern, plValue);
    }

    return transString;
  }
}

const meta = () => {
  return {
    name: "Language",
    description: "Language handler.",
  };
};

export default (bot) => {
  return {
    meta,
    execute: Lang,
  };
};
