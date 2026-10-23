import React from "react";
import { Composition } from "remotion";
import { FORMAT } from "./style";
import timeline from "./timeline.json";
import { Hibsago } from "./Hibsago";

const DUR = Math.round(((timeline.durationMs + 1200) / 1000) * FORMAT.fps);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Hibsago"
      component={Hibsago}
      fps={FORMAT.fps}
      width={FORMAT.width}
      height={FORMAT.height}
      durationInFrames={DUR}
      defaultProps={{}}
    />
  </>
);
