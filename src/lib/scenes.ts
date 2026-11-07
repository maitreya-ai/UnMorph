/**
 * Procedural "photograph" palettes. Every image on the site is a vector scene
 * drawn from one of these: flat fills from the neubrutalism.com palette with
 * black outlines — no gradients, no glow.
 */
export type SceneVariant = "glacier" | "dawn" | "dusk" | "harbor" | "aurora" | "mist";

export type ScenePalette = {
  sky: string;
  sun: string;
  far: string;
  mid: string;
  near: string;
  snow: string;
  water: string;
};

export const scenePalettes: Record<SceneVariant, ScenePalette> = {
  glacier: {
    sky: "#E3F2FD",
    sun: "#FFD23F",
    far: "#B8A9FA",
    mid: "#74B9FF",
    near: "#88D498",
    snow: "#FFFFFF",
    water: "#7FDBDA",
  },
  dawn: {
    sky: "#FFE0E0",
    sun: "#FFA552",
    far: "#FFD23F",
    mid: "#FF6B6B",
    near: "#88D498",
    snow: "#FFFFFF",
    water: "#74B9FF",
  },
  dusk: {
    sky: "#F0ECFF",
    sun: "#FF6B6B",
    far: "#FFA552",
    mid: "#B8A9FA",
    near: "#74B9FF",
    snow: "#FFFFFF",
    water: "#7FDBDA",
  },
  harbor: {
    sky: "#E8F5E9",
    sun: "#FFD23F",
    far: "#7FDBDA",
    mid: "#88D498",
    near: "#FFA552",
    snow: "#FFFFFF",
    water: "#74B9FF",
  },
  aurora: {
    sky: "#1A1A2E",
    sun: "#FFF3C4",
    far: "#3D3D6B",
    mid: "#B8A9FA",
    near: "#88D498",
    snow: "#FFFFFF",
    water: "#74B9FF",
  },
  mist: {
    sky: "#F5F0E8",
    sun: "#FFFFFF",
    far: "#E0DBD0",
    mid: "#C9C3B6",
    near: "#8F8A7E",
    snow: "#FFFFFF",
    water: "#E0DBD0",
  },
};
