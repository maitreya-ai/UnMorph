# UnMorph Design System — Neubrutalism

Reference: **[neubrutalism.com](https://neubrutalism.com)**. Tokens, type stack and interaction states
are copied from that site's `:root`, `.btn`, `.card`, `.badge`, `.section-label`, `.nav`, `.marquee`
and `.code-block` rules. Source of truth: [`src/app/globals.css`](src/app/globals.css).

## Non-negotiables

1. `border-radius: 0` on everything (enforced globally).
2. Solid black borders: **2px** thin (chips, badges, inputs inside cards), **3px** default (cards,
   buttons, fields), **4px** thick (section dividers, nav rule, modals).
3. Hard offset shadows, zero blur: `shadow-nb-sm` 3px · `shadow-nb` 5px · `shadow-nb-hover` 7px ·
   `shadow-nb-lg` 8px · `shadow-nb-xl` 12px. Black cards take a pink offset (`shadow-nb-pink`).
4. Flat fills only — no gradients, blur, glass or glows. Patterns (`bg-grid`, `bg-dots`, hatching)
   are allowed because they are hard-edged.
5. Status is never colour alone: icon + label + fill.

## Palette

| Token         | Hex       | Use                                |
| ------------- | --------- | ---------------------------------- |
| `nb-bg`       | `#FFFDF5` | page canvas                        |
| `nb-surface`  | `#FFFFFF` | cards, fields                      |
| `nb-bg-warm`  | `#F5F0E8` | card header strips, muted wells    |
| `nb-black`    | `#000000` | ink, borders, shadows              |
| `nb-yellow`   | `#FFD23F` | primary accent, active states, CTA |
| `nb-pink`     | `#FF6B6B` | danger / tampered, progress strip  |
| `nb-blue`     | `#74B9FF` | info, focus outline                |
| `nb-green`    | `#88D498` | success / authentic                |
| `nb-orange`   | `#FFA552` | warning / unregistered             |
| `nb-lavender` | `#B8A9FA` | secondary accent                   |
| `nb-cyan`     | `#7FDBDA` | code properties, illustration      |
| `nb-code`     | `#1A1A2E` | code blocks (`nb-code`)            |
| `nb-*-light`  | tints     | full-bleed section bands, callouts |
| `nb-muted`    | `#5C5C54` | secondary text on canvas (7.2:1)   |

## Typography

| Role    | Face          | Weight | Notes                                           |
| ------- | ------------- | ------ | ----------------------------------------------- |
| Display | Syne          | 800    | hero `h1`, wordmark, stat numbers, marquee, CTA |
| Heading | Space Grotesk | 700    | every `h2`–`h6`, buttons, nav — sentence case   |
| Body    | Inter         | 400    | paragraphs, line-height 1.6                     |
| Mono    | Space Mono    | 400    | labels, badges, table heads, hashes, IDs, code  |

Reserve the loudest type for the hero and calls to action; everything else stays readable.

## Interaction

- **Press** (`nb-press`, `nb-press-sm`): rest on the shadow → hover `translate(-2px,-2px)` with a
  bigger shadow → active `translate(3px,3px)` with no shadow. 100ms.
- **Card lift**: hover `translate(-2px,-2px)` into `shadow-nb-lg`.
- **Fields**: focus lifts the field into `shadow-nb` (no glow rings).
- **Focus**: 3px solid blue outline, 3px offset.
- **Nav**: active link = yellow block + 2px border + `shadow-nb-sm`.

## Building blocks

- `nb-label` — mono `.section-label` chip (`02 — How it works`).
- Card header strip — `border-b-[3px] bg-nb-bg-warm` with a mono or Space Grotesk title.
- `nb-code` — midnight block; syntax: keywords pink, properties cyan, strings green, numbers yellow.
- `nb-tamper` — pink box, black ring, hazard hatching for altered regions.
- Section bands — full-bleed `nb-*-light` backgrounds separated by `border-b-4`.
- Primitives in [`src/components/ui`](src/components/ui): `Button`, `Badge`, `Card`, `Input`,
  `Label`, `Alert`, `Table`.
