"use client";
import { useRef, useState } from "react";
import { ChevronRight, Play } from "lucide-react";
import { channelUrl } from "../lib/video-tab.mjs";

function Thumbnail({ video }) {
  const base = "https://i.ytimg.com/vi/" + video.id + "/";
  return <img loading="lazy" width="1280" height="720" alt="" src={base + "maxresdefault.jpg"}
    onError={e => { if (!e.currentTarget.src.endsWith("/hqdefault.jpg")) e.currentTarget.src = base + "hqdefault.jpg"; }} />;
}

export default function ChannelTV({ videos }) {
  const dialog = useRef(null);
  const [playing, setPlaying] = useState(null);
  const [latest, ...more] = videos;
  function play(video) {
    setPlaying(video);
    dialog.current.showModal();
  }
  return (
    <section className="homeSection channelTV">
      <div className="sectionTitle"><h2>대한재활의학과의사회TV</h2></div>
      <button className="tvLead" onClick={() => play(latest)} aria-label={latest.title + " 재생"}>
        <span className="featuredVideo"><Thumbnail video={latest} /><span><Play fill="currentColor" /></span></span>
        <strong>{latest.title}</strong>
      </button>
      <div className="videoGrid">
        {more.map(video => <button key={video.id} onClick={() => play(video)}>
          <Thumbnail video={video} /><strong>{video.title}</strong>
        </button>)}
      </div>
      <a className="tvAll" href={channelUrl}>전체영상 보러가기 <ChevronRight size={16} /></a>
      <dialog className="tvDialog" ref={dialog} aria-labelledby="tvDialogTitle"
        onClose={() => setPlaying(null)} onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}>
        {playing && <div>
          <header><strong id="tvDialogTitle">{playing.title}</strong><button onClick={() => dialog.current.close()} autoFocus>닫기</button></header>
          <iframe title={playing.title} src={"https://www.youtube-nocookie.com/embed/" + playing.id + "?autoplay=1"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        </div>}
      </dialog>
    </section>
  );
}