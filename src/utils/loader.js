/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

export const scanGlob = (pattern, cwd) => {
  const glob = new Bun.Glob(pattern);
  return glob.scanSync({ cwd });
};

export async function loadModules({
  pattern,
  cwd,
  logger,
  kind,
  onLoad,
  onError,
}) {
  const files = scanGlob(pattern, cwd);

  await Promise.all(
    files.map(async (filePath) => {
      const start = Date.now();
      const absolutePath = `${cwd}/${filePath}`;
      const fileName = filePath.replace(/\.js$/, "").split("/").pop();

      try {
        const module = await import(absolutePath);
        const displayName = await onLoad({
          module,
          filePath,
          absolutePath,
          fileName,
        });

        logger?.debug?.(
          "BOOTSTRAP",
          `Load ${kind} ${displayName || fileName}: OK in ${Date.now() - start}ms`,
        );
      } catch (err) {
        logger?.error?.(
          "BOOTSTRAP",
          `Load ${kind} ${fileName}: NOT OK - ${err.message}`,
        );
        console.error(err.stack);

        if (onError) {
          await onError({ err, filePath, absolutePath, fileName });
        }
      }
    }),
  );

  return true;
}
