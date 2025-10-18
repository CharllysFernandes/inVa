export const TOGGLE_HIGHLIGHT = "TOGGLE_HIGHLIGHT" as const;

export type Message = {
  type: typeof TOGGLE_HIGHLIGHT;
};
