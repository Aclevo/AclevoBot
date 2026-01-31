/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

const meta = () => {
  return {
    name: "Fetch",
    description: "Fetches things.",
  };
};

// Bun has a built-in fetch API, so we can use it directly
const fetch = globalThis.fetch;

export default (app) => {
  return {
    meta,
    execute: fetch,
  };
};
