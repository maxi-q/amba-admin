# Sprint creation step 3 — Задания

- URL: https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=15943-30801
- fileKey: `bAbFX4C4FHvWQ1whR5p3jn`
- nodeId: `15943:30801` (section)
- Frames:
  - empty: `15943:30802`
  - list: `16012:30957`
  - modal: `15944:42253` (overlay «Добавить задание»)

## Layout

- Stepper step 3 active: «Задания»
- Header geometry matches step 2: full 940 px working area after the sidebar with 16 px horizontal padding. The 700 px centered constraint applies only to the page cards, not to the header.
- Card 700px: title + subtitle + «+ Добавить»
- List rows: title | pink star + «от N XP» | edit / delete
- Footer: «Назад» + «Продолжить» (disabled empty) / «Запустить спринт» (with tasks)
- Modal fields: ККТУ, название, описание, ссылки, формат chips, платформа, медиа, запрещено, критерии, модерация switches, очки

## Code

- `SprintCreationHeader.tsx`: steps 2 and 3 now share the same full-width header geometry so the stepper and draft button do not jump during navigation.
- `SprintCreationStepThree.tsx`
- `SprintCreationTaskDialog.tsx`: single source of truth for both create and edit dialogs; edit mode can show the current sprint as a disabled field and accepts mutation loading/error state.
- `creativetasks/components/EditCreativeTaskDialog.tsx`: adapts a persisted task to the shared sprint task dialog and sends the full update payload.
- `creativetasks/CreativeTaskEditorPage.tsx`: the list edit route now opens the same shared dialog instead of the former two-step page.
- `draftSprintTask.ts`
- asset: `sprints/slug/assets/xp-star.svg`

Implementation rechecked: 2026-10-08.

## Gaps / product notes

- «Что запрещено» maps to the API `restrictions` field.
- Шаблон ОРД обязателен API, в макете не показан — добавлен в форму
- Persisted tasks have `sprintId`; changing it is conditionally rejected when the task already has submissions, so edit keeps the current sprint visible and disabled.
