"use client";

import { useRef, useEffect, useCallback } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

/**
 * Minimal light theme matching the app's design tokens.
 */
const appTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    fontFamily: "var(--font-geist-mono, 'JetBrains Mono', monospace)",
    height: "100%",
  },
  ".cm-content": {
    padding: "16px 20px",
    caretColor: "var(--brand-500)",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-gutters": {
    background: "var(--surface)",
    border: "none",
    color: "var(--text-tertiary)",
    paddingLeft: "8px",
  },
  ".cm-activeLineGutter": {
    background: "transparent",
    color: "var(--text-secondary)",
  },
  ".cm-activeLine": {
    background: "var(--brand-50)",
  },
  ".cm-selectionMatch": {
    background: "var(--brand-100)",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--brand-500)",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
});

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function MarkdownEditor({
  initialValue,
  onChange,
  readOnly = false,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Debounce
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedOnChange = useCallback((val: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChangeRef.current(val);
    }, 600);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      keymap.of([indentWithTab]),
      markdown({ codeLanguages: languages }),
      appTheme,
      EditorView.lineWrapping,
    ];

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
      extensions.push(EditorView.editable.of(false));
    } else {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            debouncedOnChange(update.state.doc.toString());
          }
        })
      );
    }

    const state = EditorState.create({
      doc: initialValue,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  return (
    <div className="relative h-full">
      {readOnly && (
        <div className="absolute top-2 right-4 z-10 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-1 text-[11px] font-semibold tracking-wide border border-amber-300 dark:border-amber-700/50 shadow-xs">
          👁️ Read Only Mode
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full [&_.cm-editor]:h-full"
      />
    </div>
  );
}
