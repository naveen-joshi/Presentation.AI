import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeckById } from "@/lib/actions/deck-actions";
import { getDeckAccess } from "@/lib/actions/share-actions";
import { EditorShell } from "./components/EditorShell";

export const metadata: Metadata = {
  title: "Editor",
};

export default async function DeckEditorPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [deck, access] = await Promise.all([
    getDeckById(id),
    getDeckAccess(id),
  ]);

  if (!deck) notFound();

  return <EditorShell deck={deck} access={access} />;
}
