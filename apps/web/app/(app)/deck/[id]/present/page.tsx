import { notFound } from "next/navigation";
import { getDeckById } from "@/lib/actions/deck-actions";
import { PresentView } from "./PresentView";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const deck = await getDeckById(id);
  return { title: deck?.title ?? "Present" };
}

export default async function PresentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const deck = await getDeckById(id);
  if (!deck) notFound();

  return <PresentView deck={deck} />;
}
