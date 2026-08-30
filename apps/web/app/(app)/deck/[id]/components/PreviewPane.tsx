"use client";

import { useMemo, useRef, useEffect, useCallback } from "react";
import {
  generatePreviewHtml,
  parseSlides,
  renderSlide,
  type ThemeName,
  type SizeName,
  type TemplateName,
  type TransitionName,
} from "@presentation-ai/renderer";

interface PreviewPaneProps {
  markdown: string;
  theme: string;
  template: string;
  transition: string;
  size: string;
  headFont: string;
  bodyFont: string;
}

export function PreviewPane({
  markdown,
  theme,
  template,
  transition,
  size,
  headFont,
  bodyFont,
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);

  // Generate the preview shell HTML once (or when settings change)
  const shellHtml = useMemo(() => {
    try {
      return generatePreviewHtml(
        theme as ThemeName,
        size as SizeName,
        { head: headFont || null, body: bodyFont || null },
        template as TemplateName,
        transition as TransitionName,
        "cdn"
      );
    } catch {
      return `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#888;"><p>Preview error</p></body></html>`;
    }
  }, [theme, template, transition, size, headFont, bodyFont]);

  // Parse markdown into rendered slide HTML strings
  const slideHtmls = useMemo(() => {
    try {
      const slides = parseSlides(markdown);
      return slides.map((s, i) => renderSlide(s, i));
    } catch {
      return [];
    }
  }, [markdown]);

  // Send slides to the preview iframe via postMessage
  const sendSlides = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || !readyRef.current) return;
    iframe.contentWindow.postMessage(
      { type: "render", slides: slideHtmls, mode: "single", index: 0 },
      "*"
    );
  }, [slideHtmls]);

  // Listen for the 'ready' message from the preview iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "ready") {
        readyRef.current = true;
        sendSlides();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendSlides]);

  // Load the shell HTML into the iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    readyRef.current = false;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(shellHtml);
    doc.close();
  }, [shellHtml]);

  // Send slides whenever they change (after the iframe is ready)
  useEffect(() => {
    sendSlides();
  }, [sendSlides]);

  // Also send theme changes via the theme message
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || !readyRef.current) return;
    iframe.contentWindow.postMessage(
      {
        type: "theme",
        theme,
        size,
        head: headFont || "",
        body: bodyFont || "",
        template,
        transition,
      },
      "*"
    );
  }, [theme, size, headFont, bodyFont, template, transition]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center h-8 px-4 text-xs text-[var(--text-tertiary)] border-b border-[var(--border)] bg-surface shrink-0">
        <span>Preview</span>
        <span className="ml-auto text-[var(--text-tertiary)]">
          {slideHtmls.length} slide{slideHtmls.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex-1 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Slide preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
