import { currentMember, portalEnv, qualified } from "../../../../lib/portal";
export const dynamic = "force-dynamic";
async function serve(request, { params }, headOnly) {
  const { id } = await params,
    { DB, FILES } = await portalEnv();
  const file = await DB.prepare(
    "SELECT object_key,access,name,mime FROM files WHERE id=?",
  )
    .bind(id)
    .first();
  const error = (code, extra = {}) =>
    new Response(null, {
      status: code,
      headers: { "Cache-Control": "private, no-store", ...extra },
    });
  if (!file || (file.access !== "public" && !qualified(await currentMember())))
    return error(404);
  const meta = await FILES.head(file.object_key);
  if (!meta) return error(404);
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Content-Type": file.mime,
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
    ETag: meta.httpEtag,
    "Content-Security-Policy": "sandbox",
    Vary: "Cookie",
  });
  const ext = file.object_key
    .split(".")
    .pop()
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 9);
  const name = file.name.toLowerCase().endsWith("." + ext)
    ? file.name
    : file.name + "." + ext;
  const display = /^(video\/|image\/|application\/pdf$)/.test(file.mime)
    ? "inline"
    : "attachment";
  headers.set(
    "Content-Disposition",
    display +
      "; filename*=UTF-8''" +
      encodeURIComponent(name).replace(
        /['()*]/g,
        (c) => "%" + c.charCodeAt(0).toString(16),
      ),
  );
  let offset = 0,
    length = meta.size,
    partial = false;
  const range = request.headers.get("range");
  if (range && !headOnly) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2]))
      return error(416, { "Content-Range": "bytes */" + meta.size });
    offset = match[1]
      ? Number(match[1])
      : Math.max(meta.size - Number(match[2]), 0);
    const end =
      match[1] && match[2]
        ? Math.min(Number(match[2]), meta.size - 1)
        : meta.size - 1;
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      offset >= meta.size ||
      end < offset
    )
      return error(416, { "Content-Range": "bytes */" + meta.size });
    length = end - offset + 1;
    headers.set(
      "Content-Range",
      "bytes " + offset + "-" + end + "/" + meta.size,
    );
    partial = true;
  }
  headers.set("Content-Length", String(length));
  if (headOnly) return new Response(null, { headers });
  const obj = await FILES.get(
    file.object_key,
    partial ? { range: { offset, length } } : undefined,
  );
  if (!obj) return error(404);
  return new Response(obj.body, { status: partial ? 206 : 200, headers });
}
export const GET = (req, ctx) => serve(req, ctx, false);
export const HEAD = (req, ctx) => serve(req, ctx, true);
