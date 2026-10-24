import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny file-backed collection for local demos. Serverless hosts (Vercel) have
 * a read-only filesystem, so swap this for Supabase before deploying.
 */
export function createJsonStore<T>(name: string, maxItems = 5000) {
  const file = path.join(process.cwd(), ".data", `${name}.json`);
  let queue: Promise<unknown> = Promise.resolve();

  async function readAll(): Promise<T[]> {
    try {
      const parsed: unknown = JSON.parse(await fs.readFile(file, "utf8"));
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  /** Read-modify-write, serialized so concurrent requests don't clobber each other. */
  function mutate<R>(fn: (items: T[]) => R): Promise<R> {
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

  async function list(): Promise<T[]> {
    await queue;
    return readAll();
  }

  return { list, mutate };
}
