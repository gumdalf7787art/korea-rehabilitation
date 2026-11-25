import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import initialVideos from "./channel-videos.json";
import { channelUrl, readVideoTab } from "./video-tab.mjs";

const key = "homepage/channel-videos.json";
const hour = 3600_000;

export async function getChannelVideos() {
  let videos = initialVideos;
  try {
    const { env, ctx } = await getCloudflareContext({ async: true });
    const object = await env.FILES.get(key);
    const saved = object && await object.json();
    if (saved?.videos?.length === 9) videos = saved.videos;
    if (!saved || Date.now() >= saved.retryAt) {
      ctx.waitUntil(refresh(env.FILES, videos));
    }
  } catch (error) {
    console.warn("Channel video cache unavailable", error.message);
  }
  return videos;
}

async function refresh(bucket, previous) {
  let videos = previous;
  let delay = hour;
  try {
    const response = await fetch(channelUrl + "?hl=ko", {
      headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("YouTube HTTP " + response.status);
    videos = readVideoTab(await response.text());
  } catch (error) {
    console.warn("Channel video refresh failed", error.message);
    delay = 5 * 60_000;
  }
  await bucket.put(key, JSON.stringify({ videos, retryAt: Date.now() + delay }));
}
