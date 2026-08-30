import type { Metadata } from "next";
import { PlaygroundShell } from "./components/PlaygroundShell";

export const metadata: Metadata = {
  title: "Live Playground & Demo — Presentation.AI",
  description:
    "Experience the full Markdown presentation engine with AI generation, live preview, 30+ themes, and dual-screen presenter mode. No sign-up or credit card required.",
};

export default function PlaygroundPage() {
  return <PlaygroundShell />;
}
