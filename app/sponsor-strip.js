"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

const sponsors = [
  { name: "LG화학", file: "lg-chem.gif", href: "https://www.lgchem.com" },
  { name: "건강보험심사평가원", file: "hira.png", href: "https://www.hira.or.kr/main.do" },
  { name: "대한의사협회 의료배상공제조합", file: "kmama.png", href: "https://www.kmama.org/main/sub02_02_01.asp?adbanner=xmusFpc0wFW7" },
  { name: "대한재활의학회", file: "karm.png", href: "https://www.karm.or.kr/" },
];

function SponsorGroup({ duplicate = false }) {
  return (
    <div className="sponsorGroup" aria-hidden={duplicate || undefined}>
      {sponsors.map(({ name, file, href }) => (
        <a key={file} href={href} target="_blank" rel="noopener noreferrer"
          tabIndex={duplicate ? -1 : undefined}>
          <img src={"/media/sponsors/" + file} alt={name} width={364} height={100} loading="lazy" />
        </a>
      ))}
    </div>
  );
}

export default function SponsorStrip() {
  const [paused, setPaused] = useState(false);
  return (
    <section className="sponsorStrip" aria-labelledby="sponsorTitle">
      <div className="sectionTitle sponsorTitle">
        <h2 id="sponsorTitle">Sponsor</h2>
        <button className="sponsorToggle" type="button" onClick={() => setPaused(!paused)}
          aria-label={paused ? "스폰서 배너 이동 시작" : "스폰서 배너 이동 일시정지"}>
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>
      <div className="sponsorViewport" data-paused={paused}>
        <div className="sponsorTrack">
          <SponsorGroup />
          <SponsorGroup duplicate />
        </div>
      </div>
    </section>
  );
}
