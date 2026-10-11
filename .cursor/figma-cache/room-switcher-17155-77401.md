# Company switcher — Figma node `17155:77401`

- URL: https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=17155-77401
- fileKey: `bAbFX4C4FHvWQ1whR5p3jn`
- section node: `17155:77401`
- implemented children:
  - `17155:68491` (`Project List`)
  - `17333:68537` (`Modal`, edit company)
- screenshots:
  - `room-switcher-17155-68491.png` (280×194 export, natural size)
  - `edit-room-17333-68537.png` (358×268 export, natural size)
- refreshed: 2026-10-11 via `get_design_context` + `get_screenshot`

## Layout

- Dropdown width: 248 px, white background, 8 px radius, 1 px `#e4e4e4` border.
- Shadow: `0 16px 16px rgba(0, 0, 0, 0.16)`.
- Header: 34 px, 12 px horizontal padding, title 13/16 medium and 18 px plus action.
- Search: 224×32 px, `#f0f0f0`, 6 px radius, 13/16 medium.
- Company row: 44 px, 12 px horizontal padding, 8 px gap, 32 px avatar.
- Primary label: 13/16 medium; secondary label: 12/16 medium `#797979`.
- Every company row has a 16 px settings action.
- Edit modal: 358×268 px, 8 px radius, 44 px header, 176 px content, 48 px footer.
- Avatar preview: 64×64 px round; helper text 12/16; secondary upload button 28 px.
- Name input: 326×40 px, required label, maximum 50 characters from the backend DTO.

## Implementation

- `src/pages/(list_integration)/modules/index.tsx`: the company name in the sidebar opens this dropdown; search, create-company action, switching and per-row settings actions are implemented.
- `src/pages/(list_integration)/rooms/components/EditCompanyDialog.tsx`: matches the new edit modal and persists the company name through `useUpdateRoom`.
- `src/pages/(list_integration)/rooms/roomSelection.ts`: stores and resolves the last opened company.
- `src/pages/(list_integration)/rooms/index.tsx`: `/` and `/rooms` redirect to the remembered available company or the first available company; the former company list is no longer rendered.
- Empty state and company creation remain available. The plus action opens `/rooms?create=1`.

## Contract gap

- `GET /rooms/my` does not provide a per-company member role or token balance. The Figma sample text `Владелец · 24 токена` is therefore represented by the neutral secondary label `Компания` rather than invented data.
- Room DTOs have no avatar field and the room controller has no upload/confirm/delete avatar endpoints. The avatar control is therefore present but disabled; persisting it requires a backend contract and Orval regeneration.
