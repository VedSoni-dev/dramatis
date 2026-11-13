// One file says what this build is and which of the four AI modes it offers. The kit reads it everywhere.
import type { StudioConfig } from "@/kit/ai/types";

const config: StudioConfig = {
  app: {
    name: "Dramatis",
    slug: "dramatis",
    version: "0.1.0",
    tagline: "Make AI characters and chat with them",
    repo: "https://github.com/VedSoni-dev/dramatis",
    url: "https://dramatis.vedantsoni.com",
    alternativeTo: "Character.AI",
  },
  // Pick the modes that make sense for this build (docs/auth.md). Order = order in the picker. Max 4.
  modes: ["claude","publik","chatgpt","local"],
  defaultMode: "claude",
};

export default config;
