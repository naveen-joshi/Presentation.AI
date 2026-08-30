-- Local development seed data.
-- Sign in with: demo@presentation.ai / password123 (or ada@presentation.ai / password123)

insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token)
values
  ('00000000-0000-0000-0000-000000000000',
   'aaaaaaaa-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'demo@presentation.ai',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Demo User"}',
   now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000000',
   'aaaaaaaa-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'ada@presentation.ai',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Ada Collaborator"}',
   now(), now(), '', '');

insert into public.decks (id, owner_id, title, slug, markdown, theme, size, template, transition, visibility)
values
  ('dddddddd-0000-4000-8000-000000000001',
   'aaaaaaaa-0000-4000-8000-000000000001',
   'Welcome to Presentation.AI',
   'welcome',
$md$# Welcome to Presentation.AI

Markdown in. **Presentation** out.

<!-- notes: Introduce the product in one line. -->

---

## Write slides in Markdown

- Headings become slides, separated by `---`
- Themes, templates, and transitions are one click away {reveal}
- Math like $e^{i\pi} + 1 = 0$ and diagrams just work {reveal}

---

## Code speaks for itself

```typescript
export function parseSlides(markdown: string): Slide[] {
  return markdown.split(/\n[ \t]*---[ \t]*\n/).filter(Boolean).map(processSlide);
}
```

---

## Share and present

- Public pages, share links, and roles
- Real-time co-editing with live cursors
- Works offline — edits sync when you are back

<!-- notes: Close with the collaboration story. -->
$md$,
   'nord', 'm', 'classic', 'slide', 'public'),

  ('dddddddd-0000-4000-8000-000000000002',
   'aaaaaaaa-0000-4000-8000-000000000001',
   'Team Weekly Sync',
   null,
$md$# Team Weekly Sync

Agenda for this week.

---

## Updates

- Renderer package extracted and tested
- Web app scaffolded with Next.js 16
- Schema and RLS shipped

---

## Next steps

- Templates and sharing
- Real-time collaboration
$md$,
   'paper', 'm', 'editorial', 'fade', 'private');

-- Ada is an editor on the private deck (collaboration demo).
insert into public.deck_collaborators (deck_id, user_id, role)
values
  ('dddddddd-0000-4000-8000-000000000002',
   'aaaaaaaa-0000-4000-8000-000000000002',
   'editor');

insert into public.templates (id, owner_id, name, description, markdown, theme, template, transition, visibility, tags)
values
  ('tttttttt-0000-4000-8000-000000000001',
   'aaaaaaaa-0000-4000-8000-000000000001',
   'Pitch Outline',
   'A classic ten-slide pitch structure: problem, solution, traction, ask.',
$md$# Company Name

One line that says what you do.

---

## The Problem

Describe the pain in one sentence, then the cost of living with it.

---

## The Solution

Your product in one sentence, then the magic behind it.

---

## Traction

- Metric one {reveal}
- Metric two {reveal}
- Metric three {reveal}

---

## The Ask

What you need, and what it unlocks.
$md$,
   'midnight', 'spotlight', 'zoom', 'public',
   array['pitch', 'startup']);
