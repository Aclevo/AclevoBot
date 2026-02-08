/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

export const createShutdown = ({ logger, timeoutMs = 5000 } = {}) => {
  let shuttingDown = false;

  return async ({ code = 1, reason, cleanup } = {}) => {
    if (shuttingDown) return;
    shuttingDown = true;

    if (reason) {
      if (logger?.error)
        logger.error("SYSTEM", `Shutdown requested: ${reason}`);
      else console.error(`Shutdown requested: ${reason}`);
    }

    const timeoutId = setTimeout(() => {
      const msg = `Shutdown forced after ${timeoutMs}ms.`;
      if (logger?.error) logger.error("SYSTEM", msg);
      else console.error(msg);
      process.exit(code);
    }, timeoutMs);

    try {
      if (cleanup) await cleanup();
    } catch (err) {
      const msg = err?.message || err;
      if (logger?.error)
        logger.error("SYSTEM", `Error during shutdown: ${msg}`);
      else console.error(`Error during shutdown: ${msg}`);
    } finally {
      clearTimeout(timeoutId);
      process.exit(code);
    }
  };
};
