/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

export const createShutdown = ({ logger } = {}) => {
  let shuttingDown = false;

  return async ({ code = 1, reason, cleanup } = {}) => {
    if (shuttingDown) return;
    shuttingDown = true;

    if (reason) {
      if (logger?.error) {
        logger.error("SYSTEM", `Shutdown requested: ${reason}`);
      } else {
        console.error(`Shutdown requested: ${reason}`);
      }
    }

    try {
      if (cleanup) {
        await cleanup();
      }
    } catch (err) {
      const msg = err?.message || err;
      if (logger?.error) {
        logger.error("SYSTEM", `Error during shutdown: ${msg}`);
      } else {
        console.error(`Error during shutdown: ${msg}`);
      }
    } finally {
      process.exitCode = code;
    }
  };
};
