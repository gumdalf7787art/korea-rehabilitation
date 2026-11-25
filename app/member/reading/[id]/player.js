"use client";
import { useRef } from "react";
import { rememberPosition } from "../../actions";

export default function Player({ id, position, track }) {
  const last = useRef(-1),
    pending = useRef(false);
  const save = async (seconds, force = false) => {
    const value = Math.floor(seconds);
    if (
      !track ||
      pending.current ||
      !Number.isFinite(value) ||
      value < 0 ||
      value === last.current ||
      (!force && Math.abs(value - last.current) < 20)
    )
      return;
    pending.current = true;
    try {
      await rememberPosition(id, value);
      last.current = value;
    } finally {
      pending.current = false;
    }
  };
  return (
    <video
      controls
      playsInline
      preload="metadata"
      style={{ width: "100%", borderRadius: 12, background: "var(--brand-deep)" }}
      src={"/api/files/" + id}
      onLoadedMetadata={(e) => {
        if (position > 0 && e.currentTarget.duration > position + 3)
          e.currentTarget.currentTime = position;
      }}
      onTimeUpdate={(e) => {
        void save(e.currentTarget.currentTime);
      }}
      onPause={(e) => {
        if (!e.currentTarget.ended)
          void save(e.currentTarget.currentTime, true);
      }}
      onEnded={() => {
        void save(0, true);
      }}
    />
  );
}
