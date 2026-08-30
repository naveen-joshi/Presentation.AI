import type { Metadata } from "next";
import { getPublicTemplates, getUserTemplates } from "@/lib/actions/template-actions";
import { TemplateGallery } from "./components";

export const metadata: Metadata = {
  title: "Templates Gallery",
};

export default async function TemplatesPage() {
  const [publicTemplates, userTemplates] = await Promise.all([
    getPublicTemplates(),
    getUserTemplates(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Presentation Templates</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Explore professionally styled presentation structures, or reuse your own saved templates.
        </p>
      </div>

      <TemplateGallery
        publicTemplates={publicTemplates}
        userTemplates={userTemplates}
      />
    </div>
  );
}
