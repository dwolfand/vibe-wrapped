export const STUDIO_MAP: Record<string, string> = {
  vibe: "vibe",
};

export function getStudioShortName(studioId: string): string | undefined {
  return STUDIO_MAP[studioId];
}
