import { siteUrl } from "../lib/site";
import { publicPages } from "../lib/content";
import { portalEnv } from "../lib/portal";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  const { DB } = await portalEnv();
  const { results } = await DB.prepare(
    "SELECT id,section,updated_at FROM articles WHERE published=1",
  ).all();
  const events = await DB.prepare(
    "SELECT id,updated_at FROM events WHERE published=1",
  ).all();
  return [
    ...events.results.map((e) => ({
      url: siteUrl + "/education/event/" + e.id,
      lastModified: e.updated_at,
    })),
    { url: siteUrl + "/" },
    ...publicPages.map((p) => ({
      url: siteUrl + p.path,
      ...(p.date ? { lastModified: p.date } : {}),
    })),
    ...results.map((p) => ({
      url: siteUrl + "/" + p.section + "/post/" + p.id,
      lastModified: p.updated_at,
    })),
  ];
}
