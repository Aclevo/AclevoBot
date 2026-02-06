/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

export default function defineEvent({ name, type = "normal", run }) {
  const hooks = [];

  return {
    meta: () => ({ name, type }),
    add: (fn) => hooks.push(fn),
    run: (bot, params) => {
      if (run) {
        run(bot, params);
      }
      for (const fn of hooks) {
        fn(bot, params);
      }
    },
  };
}
