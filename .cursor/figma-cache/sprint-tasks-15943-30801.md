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
- Card 700px: title + subtitle + «+ Добавить»
- List rows: title | pink star + «от N XP» | edit / delete
- Footer: «Назад» + «Продолжить» (disabled empty) / «Запустить спринт» (with tasks)
- Modal fields: ККТУ, название, описание, ссылки, формат chips, платформа, медиа, запрещено, критерии, модерация switches, очки

## Code

- `SprintCreationStepThree.tsx`
- `SprintCreationTaskDialog.tsx`
- `draftSprintTask.ts`
- asset: `sprints/slug/assets/xp-star.svg`

## Gaps / product notes

- «Что запрещено» нет отдельного поля в API → пишется в `description`
- Шаблон ОРД обязателен API, в макете не показан — добавлен в форму
- Задания комнатные (без `sprintId` на backend)
- Черновик sprint всё ещё без endpoint
