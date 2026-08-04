# Sprints empty state — node `15857:5091` (фрагмент)

> Обновлено: 2026-08-02  
> Источник: `.cursor/figma-cache/15857-5091.png` + `ready-for-dev-plan.md`  
> MCP Figma сейчас недоступен — верстка по локальному кэшу.

## Scope (этот этап)

Только **empty state**: спринтов ещё нет.

## Макет A — Empty

| Элемент | Спека |
|---------|--------|
| Desktop title | «Спринт» |
| Mobile title | «Спринты» |
| Header CTA desktop | primary blue `#2563eb` «+ Добавить» |
| Header CTA mobile | квадратная icon-кнопка `+` |
| Title | «Спринт еще не добавлен» |
| Subtitle | «Создавайте задания, которые будут выполнять все участники» (`#797979`) |
| Center CTA | ghost/muted «+ Добавить» |
| Layout | контент по центру рабочей области, фон `#FFFFFF` |
| Tabs | на empty **нет** (Список / Лидерборд / Настройки) |

## Код

- `modules/index.tsx` — AppShell header скрыт (`headerClassName="hidden"`)
- `sprints/components/SprintsPageToolbar.tsx` — «Спринт» + «+ Добавить» в контенте страницы
- `sprints/components/SprintsEmptyState.tsx` — центр empty
- `sprints/index.tsx` — ветка empty + toolbar
- `sprints/SprintsLayout.tsx` — табы только на вложенных роутах

## Дальше (не в этом шаге)

- Список с карточками по макету
- Создание: степпер шаг 1 «Настройки спринта»
