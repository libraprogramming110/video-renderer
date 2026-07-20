import React from "react";
import { Composition } from "remotion";
import { FORMAT } from "./style";
import timeline from "./timeline.json";
import { FirstOralPCSK9 } from "./FirstOralPCSK9";

// Duration = VO length + ~1.2s tail (the CTA holds past the last word).
const DUR = Math.round(((timeline.durationMs + 1200) / 1000) * FORMAT.fps);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="FirstOralPCSK9"
    component={FirstOralPCSK9}
    fps={FORMAT.fps}
    width={FORMAT.width}
    height={FORMAT.height}
    durationInFrames={DUR}
    defaultProps={{}}
  />
);
