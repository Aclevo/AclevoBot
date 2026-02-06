/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

export const createShutdown = ({
  logger,
  timeoutMs = 10000,
  forceExit = true,
} = {}) => {
  let shuttingDown = false;

  const dumpActiveHandles = () => {
    try {
      const handles = process._getActiveHandles?.() || [];
      const requests = process._getActiveRequests?.() || [];
      const handleTypes = handles.map((h) => h?.constructor?.name || "Unknown");
      const requestTypes = requests.map(
        (r) => r?.constructor?.name || "Unknown",
      );
      const details = [
        `Active handles: ${handles.length} (${handleTypes.join(", ") || "none"})`,
        `Active requests: ${requests.length} (${requestTypes.join(", ") || "none"})`,
      ];
      return details.join(" | ");
    } catch (err) {
      return `Failed to read active handles: ${err?.message || err}`;
    }
  };

  return async ({
    code = 1,
    reason,
    cleanup,
    timeoutMs: overrideTimeoutMs,
    forceExit: overrideForceExit,
  } = {}) => {
    if (shuttingDown) return;
    shuttingDown = true;

    const finalTimeoutMs = overrideTimeoutMs ?? timeoutMs;
    const finalForceExit = overrideForceExit ?? forceExit;
    let timeoutId = null;

    if (reason) {
      if (logger?.error) {
        logger.error("SYSTEM", `Shutdown requested: ${reason}`);
      } else {
        console.error(`Shutdown requested: ${reason}`);
      }
    }

    try {
      if (cleanup) {
        if (finalTimeoutMs != null && finalTimeoutMs > 0) {
          timeoutId = setTimeout(() => {
            const msg = `Shutdown cleanup timed out after ${finalTimeoutMs}ms. ${dumpActiveHandles()}`;
            if (logger?.error) {
              logger.error("SYSTEM", msg);
            } else {
              console.error(msg);
            }
            if (finalForceExit) process.exit(code);
          }, finalTimeoutMs);
        }
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
      if (timeoutId) clearTimeout(timeoutId);
      process.exitCode = code;
    }
  };
};
