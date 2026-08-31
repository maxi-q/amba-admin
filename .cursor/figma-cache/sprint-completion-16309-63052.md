# Подведение итогов спринта — `16309:63052`

- URL: https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=16309-63052
- fileKey: `bAbFX4C4FHvWQ1whR5p3jn`
- nodeId: `16309:63052`
- Размер frame: `1200 × 756`
- Проверено: 2026-08-31

## Источник

После переподключения Figma-аккаунта frame повторно проверен через `get_design_context`, metadata и PNG `16309-63052.png` размером `1200 × 756`.

## Состояния и layout

- Это тот же route спринта, а не отдельная страница: итоговый режим определяется `sprint.status`.
- `awarding`: по умолчанию открыт «Рейтинг»; под заголовком находится bordered-row с checkbox «Я отправил все награды» и CTA «Завершить спринт».
- `completed`: тот же итоговый экран становится read-only, confirmation-row скрывается.
- Над списком: segmented tabs «Задания» / «Рейтинг» и поиск на общем сером фоне.
- Строка рейтинга: 48 px; rank, rounded avatar 24 px, имя, до двух reward chips, `+N`, XP, outlined profile icon 28 px.
- После последнего награждаемого участника: separator 24 px «Конец зоны вознаграждений».
- Правая колонка 260 px переиспользует `OpenSprintSidebar`: описание, статус/даты, награды рейтинга и ручного отбора.

## Реализация

- `OpenSprintPage` использует существующие `CheckBox`, `Button`, `Input`, `usePatchSprint` и status-driven режимы.
- `OpenSprintLeaderboardTab` переиспользован; добавлены поиск, backend avatar URL и визуальный caret для делимой награды.
- Filter bar приведён к frame: отдельные серые tabs/search внутри bordered-row высотой 48 px.
- Состояние checkbox → активная кнопка и переход `awarding → completed` проверены на mock-стенде.
- Preview-варианты доступны через `?sprint=sprint-awarding` и `?sprint=sprint-completed`; обычный production entry мок не импортирует.

## Backend gap

- OpenAPI поддерживает `PATCH sprint` для `awarding → completed` — он подключён.
- Текущий leaderboard endpoint документирован только для активного спринта и не принимает `sprintId`.
- Нет endpoint для ручного назначения наград участникам, фиксации выдачи наград или исторического immutable результата.
- Поэтому mock показывает все design-варианты, а production не имитирует несуществующее сохранение ручных наград. Для полной боевой страницы нужен backend results/award-assignment contract.
