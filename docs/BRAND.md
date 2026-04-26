# Brand & Design Tokens

> Lifted from the live landing (`orggraphteam6landing.vercel.app`) and the `orggraph_team6_landing` repo. The product app must feel like the same product as the landing.

## Identity
- **Product name:** OrgGraph
- **Tagline:** *Make Invisible Work Visible.*
- **Hero variant:** *What's Your Team's Hidden Expertise?*
- **Sub-tag micro-copy:** *"niche, amplified"* / *"fully managed"* (handwritten, italic, faint gray — used as accent)
- **Eyebrow label:** small uppercase tracked label ("ENGINEERING INTELLIGENCE", "WHO IT'S FOR")

## Voice
- Anti-self-promotion. Pro-evidence.
- Short, declarative, no buzzwords. Stat-anchored where possible ("70%", "3x faster", "30–40% premium").
- Sympathetic to engineers — copy is from their POV, not HR's.

## Color tokens (from `app/globals.css` of landing)
```
--color-background        #ffffff
--color-foreground        #0a0a0a
--color-muted             #f5f5f5
--color-muted-foreground  #6b6b6b
--color-border            #e5e5e5
--color-primary           #0a0a0a
--color-primary-foreground #ffffff
--radius                  0.75rem
```

### Post-it accent palette (used per-feature)
| Feature | Badge bg | Badge text | Card bg |
| --- | --- | --- | --- |
| Profiles | `#f5c4b8` | `#9e4433` | `#fce8e1` (peach) |
| Live Stats / Evidence | `#b8cdb0` | `#3d6132` | `#e2edd9` (sage) |
| Discovery / Search | `#e5d5a0` | `#7a6520` | `#f5edd0` (sand) |
| Mobility / Teams | `#b5c5d6` | `#3a566e` | `#dce4ef` (slate-blue) |

Use the **same color** for the same feature across the product app — e.g. anything related to "Profiles" stays peach.

## Typography
- **Sans (UI / body):** `Geist`, fallback `ui-sans-serif`. CSS var: `--font-sans`.
- **Mono:** `Geist Mono`. CSS var: `--font-mono`.
- **Display / handwriting:** `Caveat` via `@fontsource/caveat`. CSS var: `--font-caveat`. Use ONLY for big section headlines and post-it card titles — never for body or buttons.
- Heading scale: `text-[clamp(2.2rem,6vw,4.5rem)]` for hero, `clamp(1.6rem,3.5vw,2.8rem)` for section headers.

## Component patterns
- **Eyebrow → Caveat heading → grid** is the section formula. Keep it.
- **Post-it cards**: rounded-2xl, pastel bg, slight rotate (`-3deg` to `3deg`), small uppercase tracked badge in top-left, Caveat title, micro body copy.
- **Hover states**: subtle shadow lift (`hover:shadow-md`), ~3% scale on cards.
- **Animation**: `framer-motion` `initial/animate/whileInView` with 0.4–0.6s easeOut.
- **Buttons**: black filled circle for primary CTAs (e.g. play button); link buttons with arrow chevron for "Learn more".

## In-app applications
- **Dashboard hub** (`/app`): four post-it cards mirroring the landing hero — *My Profile*, *Talent Search*, *Team Portal*, plus a *Switch Role* card.
- **Profile page**: peach accent, Caveat for engineer name + section titles ("Skills", "Project Themes", "Evidence").
- **Search page**: sand accent, Caveat for "Internal Talent Search" header.
- **Team portal**: slate-blue accent, Caveat for team name on detail page.
- **Empty / loading states**: Caveat micro-text in faint gray (e.g. *"sketching your profile…"*).

## Don't
- Don't introduce another font.
- Don't use Caveat for buttons, body copy, table cells, or anything < 14px.
- Don't add bright marketing colors (no purple, no neon). Stick to pastels + monochrome.
- Don't use box-shadowed gradient cards. Flat pastel only.
