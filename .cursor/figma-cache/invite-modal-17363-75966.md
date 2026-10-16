# Figma cache: приглашение амбассадора

- URL: https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=17363-75966
- fileKey: `bAbFX4C4FHvWQ1whR5p3jn`
- source node: `17363:75966`
- modal without channel: `17363:76046`, 358 × 340
- modal with Senler.io channel: `17384:79079`, 358 × 412
- cached screenshots: `invite-moderated-17363-76046.png`, `invite-channel-17384-79079.png`

## Layout and tokens

- Modal width 358 px, radius 8 px, white background.
- Header: 44 px high, horizontal padding 16 px, vertical padding 10 px.
- Content: horizontal padding 16 px, top 8 px, bottom 16 px, 12 px vertical gap.
- Tabs: background `#f0f0f0`, padding 2 px, gap 2 px, radius 6 px; active tab is white with 4 px radius.
- Primary copy: Inter 13/500, line height 16 px, letter spacing -0.0325 px.
- Title: Inter 15/500, line height 20 px, letter spacing -0.135 px.
- Secondary text: `#797979`; border: `#e4e4e4`; icon: `#707070`; primary blue: `#2563eb`.
- Questions card: background `#f0f0f0`, radius 10 px, padding 8 px, gap 4 px.
- Select and link field: 40 px high, radius 6 px, padding 12 px.
- Channel avatar: 22 × 22 px, radius 8 px.
- Copy icon: 16 × 16 px.

## Assets

- Exact close icon reused from `src/assets/ord-profile/close.svg`.
- Exact copy icon saved to `src/assets/participants/content-copy.svg`.
- Exact channel fallback graphic saved to `src/assets/participants/channel-fallback.svg`.
- Channel avatars remain API-driven; fallback is used only when `avatarUrl` is absent.

## Implementation

- `src/pages/(list_integration)/applications/ParticipantDialogs.tsx`
- Senler.io mode always includes channel selection.
- Moderated invitation shows questions and the ordinary channel URL.
- Direct invitation shows the preapproved subscription URL first, followed by the ordinary channel URL.
- User-facing terminology uses «компания» according to repository rules, even though the Figma helper copy says «комната».
