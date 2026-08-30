"use client";

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorState, EditorSelection } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

/**
 * App theme matching the app's design tokens and light/dark modes.
 */
const appTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    fontFamily: "var(--font-geist-mono, 'JetBrains Mono', monospace)",
    height: "100%",
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
  },
  ".cm-content": {
    padding: "16px 20px",
    caretColor: "var(--brand-500)",
    color: "var(--foreground)",
  },
  ".cm-line": {
    color: "var(--foreground)",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-gutters": {
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    color: "var(--text-tertiary)",
    paddingLeft: "8px",
    paddingRight: "8px",
  },
  ".cm-activeLineGutter": {
    background: "var(--surface-2)",
    color: "var(--text-primary)",
    fontWeight: "600",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(99, 102, 241, 0.08) !important",
    color: "inherit !important",
  },
  ".cm-selectionMatch": {
    backgroundColor: "rgba(99, 102, 241, 0.18)",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--brand-500)",
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(99, 102, 241, 0.25) !important",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
});

export interface MarkdownEditorHandle {
  insertSnippet: (snippet: string) => void;
  wrapSelection: (before: string, after: string, defaultText?: string) => void;
  getValue: () => string;
  setValue: (val: string) => void;
}

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor(
    { initialValue, onChange, readOnly = false }: MarkdownEditorProps,
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Expose editor actions
    useImperativeHandle(
      ref,
      () => ({
        insertSnippet: (snippet: string) => {
          const view = viewRef.current;
          if (!view || readOnly) return;
          const tr = view.state.changeByRange((range) => ({
            changes: [{ from: range.from, to: range.to, insert: snippet }],
            range: EditorSelection.cursor(range.from + snippet.length),
          }));
          view.dispatch(tr);
          view.focus();
        },
        wrapSelection: (before: string, after: string, defaultText = "text") => {
          const view = viewRef.current;
          if (!view || readOnly) return;
          const tr = view.state.changeByRange((range) => {
            const selected = view.state.sliceDoc(range.from, range.to);
            const content = selected || defaultText;
            const insert = before + content + after;
            return {
              changes: [{ from: range.from, to: range.to, insert }],
              range: EditorSelection.range(
                range.from + before.length,
                range.from + before.length + content.length
              ),
            };
          });
          view.dispatch(tr);
          view.focus();
        },
        getValue: () => {
          return viewRef.current ? viewRef.current.state.doc.toString() : "";
        },
        setValue: (val: string) => {
          const view = viewRef.current;
          if (!view) return;
          const current = view.state.doc.toString();
          if (current !== val) {
            view.dispatch({
              changes: { from: 0, to: current.length, insert: val },
            });
          }
        },
      }),
      [readOnly]
    );

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
);
