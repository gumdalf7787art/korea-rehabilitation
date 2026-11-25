export const channelId = "UCdXw-_i5MesRrzKbd4pTs_A";
export const channelUrl = "https://www.youtube.com/channel/" + channelId + "/videos";

export function readVideoTab(html) {
  const raw = html.match(/var ytInitialData\s*=\s*(.*?);\s*<\/script>/s)?.[1];
  if (!raw) throw new Error("YouTube video tab missing");
  // The mobile site embeds its JSON in a JavaScript string literal.
  const json = raw.startsWith("'")
    ? raw.slice(1, -1).replace(/\\(?:x([\da-f]{2})|([\\/'"]))/gi,
        (_, hex, escaped) => hex ? String.fromCharCode(parseInt(hex, 16)) : escaped)
    : raw;
  const data = JSON.parse(json);
  if (data.metadata?.channelMetadataRenderer?.externalId !== channelId) throw new Error("Unexpected channel");
  const browse = data.contents.singleColumnBrowseResultsRenderer ?? data.contents.twoColumnBrowseResultsRenderer;
  const tab = browse.tabs.find(({ tabRenderer }) => tabRenderer?.selected)?.tabRenderer;
  const videos = [];
  for (const item of tab?.content?.richGridRenderer?.contents ?? []) {
    const content = item.richItemRenderer?.content;
    const video = content?.compactVideoRenderer ?? content?.videoRenderer;
    const title = video?.title?.runs?.map(run => run.text).join("") ?? video?.title?.simpleText;
    if (title && /^[\w-]{11}$/.test(video.videoId) && video.lengthText &&
        !videos.some(entry => entry.id === video.videoId)) {
      videos.push({ id: video.videoId, title });
    }
    if (videos.length === 9) return videos;
  }
  throw new Error("Incomplete YouTube video list");
}
