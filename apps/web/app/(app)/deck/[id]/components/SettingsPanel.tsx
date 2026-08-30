"use client";

import {
  THEME_OPTIONS,
  SIZE_OPTIONS,
  TEMPLATE_OPTIONS,
  TRANSITION_OPTIONS,
  FONT_OPTIONS,
} from "@/lib/deck-meta";

interface SettingsPanelProps {
  theme: string;
  template: string;
  transition: string;
  size: string;
  headFont: string;
  bodyFont: string;
  onChange: (key: string, value: string) => void;
}

function Select({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-1.5 text-sm text-foreground focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SettingsPanel({
  theme,
  template,
  transition,
  size,
  headFont,
  bodyFont,
  onChange,
}: SettingsPanelProps) {
  return (
    <div className="p-4 space-y-5">
      <h3 className="text-sm font-semibold text-foreground">Deck settings</h3>

      <Select
        id="settings-theme"
        label="Theme"
        value={theme}
        options={THEME_OPTIONS}
        onChange={(v) => onChange("theme", v)}
      />

      <Select
        id="settings-template"
        label="Template"
        value={template}
        options={TEMPLATE_OPTIONS}
        onChange={(v) => onChange("template", v)}
      />

      <Select
        id="settings-transition"
        label="Transition"
        value={transition}
        options={TRANSITION_OPTIONS}
        onChange={(v) => onChange("transition", v)}
      />

      <Select
        id="settings-size"
        label="Slide size"
        value={size}
        options={SIZE_OPTIONS}
        onChange={(v) => onChange("size", v)}
      />

      <Select
        id="settings-head-font"
        label="Heading font"
        value={headFont}
        options={[{ id: "", label: "Default" }, ...FONT_OPTIONS]}
        onChange={(v) => onChange("head_font", v)}
      />

      <Select
        id="settings-body-font"
        label="Body font"
        value={bodyFont}
        options={[{ id: "", label: "Default" }, ...FONT_OPTIONS]}
        onChange={(v) => onChange("body_font", v)}
      />
    </div>
  );
}
