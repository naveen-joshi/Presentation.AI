export type Visibility = "private" | "unlisted" | "public";
export type CollaboratorRole = "editor" | "commenter" | "viewer";
export type DeckRole = "owner" | CollaboratorRole;

export interface Deck {
  id: string;
  owner_id: string;
  title: string;
  slug: string | null;
  markdown: string;
  theme: string;
  size: string;
  head_font: string | null;
  body_font: string | null;
  template: string;
  transition: string;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  markdown: string;
  theme: string;
  size: string;
  head_font: string | null;
  body_font: string | null;
  template: string;
  transition: string;
  visibility: "private" | "public";
  tags: string[];
  preview_image: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface ShareLink {
  id: string;
  deck_id: string;
  token: string;
  role: CollaboratorRole;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
}

export interface Collaborator {
  deck_id: string;
  user_id: string;
  role: CollaboratorRole;
  created_at: string;
  profile?: Profile;
}
