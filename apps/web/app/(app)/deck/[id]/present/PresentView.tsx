"use client";

import { useMemo, useRef, useEffect } from "react";
import {
  generateHtml,
  parseSlides,
  type ThemeName,
  type SizeName,
  type TemplateName,
  type TransitionName,
} from "@presentation-ai/renderer";
import type { Deck } from "@/lib/types";

export function PresentView({ deck }: { deck: Deck }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const html = useMemo(() => {
    try {
      const slides = parseSlides(deck.markdown);
      return generateHtml(
        slides,
        deck.title,
        true, // autoFullscreen
        deck.theme as ThemeName,
        deck.size as SizeName,
        {
          head: deck.head_font || undefined,
          body: deck.body_font || undefined,
        },
        {
          template: deck.template as TemplateName,
          transition: deck.transition as TransitionName,
        }
      );
    } catch {
      return `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;"><h1>Error generating presentation</h1></body></html>`;
    }
  }, [deck]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title={deck.title}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
