import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny file-backed collection for local demos. Serverless hosts (Vercel) have
 * a read-only filesystem, so swap this for Supabase before deploying.
 */
export function createJsonStore(name, maxItems = 5000) {
  const file = path.join(process.cwd(), ".data", `${name}.json`);
  let queue = Promise.resolve();

  async function readAll() {
    try {
      const parsed = JSON.parse(await fs.readFile(file, "utf8"));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /** Read-modify-write, serialized so concurrent requests don't clobber each other. */
  function mutate(fn) {
    const run = queue.then(async () => {
      const items = await readAll();
      const result = fn(items);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(items.slice(-maxItems)));
      return result;
    });
    queue = run.catch(() => undefined);
    return run;
  }

  async function list() {
    await queue;
    return readAll();
  }

  return { list, mutate };
}
