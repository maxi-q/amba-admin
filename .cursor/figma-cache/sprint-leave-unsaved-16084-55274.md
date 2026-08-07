# Выход без сохранения (sprint wizard)

- URL: https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=16084-55274
- fileKey: `bAbFX4C4FHvWQ1whR5p3jn`
- section: `16084:55274`
- modal: `16084:54891`

## UI

- Title: «Сохранить черновик»
- Body: «Уверены, что хотите выйти без сохранения? Данные будут утеряны»
- Buttons: «Без сохранения» (outline) / «Сохранить черновик» (primary)
- Close X stays on page

## Code

- `SprintUnsavedLeaveDialog.tsx`
- asset: `dialog-close.svg`
- Wired via `useBlocker` in sprint create flow (`sprints/slug/index.tsx`)
- App uses `createBrowserRouter` so blockers work
