# Company switcher — Figma node `17155:77401`

- URL: https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=17155-77401
- fileKey: `bAbFX4C4FHvWQ1whR5p3jn`
- section node: `17155:77401`
- implemented child: `17155:68491` (`Project List`)
- screenshot: `room-switcher-17155-68491.png` (280×194 export, natural size)
- fetched: 2026-10-09 via `get_design_context` + `get_screenshot`

## Layout

- Dropdown width: 248 px, white background, 8 px radius, 1 px `#e4e4e4` border.
- Shadow: `0 16px 16px rgba(0, 0, 0, 0.16)`.
- Header: 34 px, 12 px horizontal padding, title 13/16 medium and 18 px plus action.
- Search: 224×32 px, `#f0f0f0`, 6 px radius, 13/16 medium.
- Company row: 44 px, 12 px horizontal padding, 8 px gap, 32 px avatar.
- Primary label: 13/16 medium; secondary label: 12/16 medium `#797979`.
- Active company has a 16 px check.

## Implementation

- `src/pages/(list_integration)/modules/index.tsx`: the company name in the sidebar opens this dropdown; search, create-company action, switching and active check are implemented.
- `src/pages/(list_integration)/rooms/roomSelection.ts`: stores and resolves the last opened company.
- `src/pages/(list_integration)/rooms/index.tsx`: `/` and `/rooms` redirect to the remembered available company or the first available company; the former company list is no longer rendered.
- Empty state and company creation remain available. The plus action opens `/rooms?create=1`.

## Contract gap

`GET /rooms/my` does not provide a per-company member role or token balance. The Figma sample text `Владелец · 24 токена` is therefore represented by the neutral secondary label `Компания` rather than invented data.
