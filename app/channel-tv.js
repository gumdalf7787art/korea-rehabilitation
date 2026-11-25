"use client";
import { useState } from "react";
import { ChevronRight, Play } from "lucide-react";
import { channelUrl } from "../lib/video-tab.mjs";

function Thumbnail({ video }) {
  const base = "https://i.ytimg.com/vi/" + video.id + "/";
  return <img loading="lazy" width="1280" height="720" alt="" src={base + "maxresdefault.jpg"}
    onError={e => { if (!e.currentTarget.src.endsWith("/hqdefault.jpg")) e.currentTarget.src = base + "hqdefault.jpg"; }} />;
}

export default function ChannelTV({ videos }) {
  const [playing, setPlaying] = useState(false);
  const [latest, ...more] = videos;
  return (
    <section className="homeSection channelTV">
      <div className="sectionTitle">
        <h2>대한재활의학과의사회TV</h2>
        <a href={channelUrl}>채널 전체 보기 <ChevronRight size={15} /></a>
      </div>
      {playing ? <iframe title={latest.title} src={"https://www.youtube-nocookie.com/embed/" + latest.id + "?autoplay=1"}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> :
        <button className="featuredVideo" aria-label={latest.title + " 재생"} onClick={() => setPlaying(true)}>
          <Thumbnail video={latest} /><span><Play fill="currentColor" /></span>
        </button>}
      <h3><a href={"https://www.youtube.com/watch?v=" + latest.id}>{latest.title}</a></h3>
      <div className="videoGrid">
        {more.map(video => <a key={video.id} href={"https://www.youtube.com/watch?v=" + video.id}>
          <Thumbnail video={video} /><strong>{video.title}</strong>
        </a>)}
      </div>
    </section>
  );
}
