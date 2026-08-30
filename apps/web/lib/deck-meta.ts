import {
  THEMES,
  THEME_IDS,
  SIZE_IDS,
  TEMPLATE_IDS,
  TRANSITION_IDS,
  FONT_IDS,
  fontName,
  DEFAULT_THEME,
  DEFAULT_SIZE,
  DEFAULT_TEMPLATE,
  DEFAULT_TRANSITION,
  type SizeName,
  type ThemeName,
  type TemplateName,
  type TransitionName,
} from "@presentation-ai/renderer";

export { DEFAULT_THEME, DEFAULT_SIZE, DEFAULT_TEMPLATE, DEFAULT_TRANSITION };
export type { SizeName, ThemeName, TemplateName, TransitionName };

export const THEME_OPTIONS = THEME_IDS.map((id) => ({
  id,
  label: THEMES[id]?.label ?? id,
  mood: THEMES[id]?.mood ?? "dark",
  blurb: THEMES[id]?.blurb ?? "",
}));

export const SIZE_OPTIONS = SIZE_IDS.map((id) => ({ id, label: id.toUpperCase() }));

export const TEMPLATE_OPTIONS = TEMPLATE_IDS.map((id) => ({ id, label: id }));

export const TRANSITION_OPTIONS = TRANSITION_IDS.map((id) => ({ id, label: id }));

export const FONT_OPTIONS = FONT_IDS.map((id) => ({
  id,
  label: fontName(id),
}));
