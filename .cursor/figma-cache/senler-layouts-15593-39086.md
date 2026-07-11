# Figma cache: Senler – Layouts → node 15593:39086

> Локальный кэш для работы без повторных MCP-запросов.
> Последнее обновление: 2026-07-11

## Источник

| Поле | Значение |
|------|----------|
| URL | https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=15593-39086&m=dev |
| fileKey | `bAbFX4C4FHvWQ1whR5p3jn` |
| nodeId | `15593:39086` (из URL: `15593-39086`) |
| Файл | Senler – Layouts |
| Режим ссылки | Dev Mode (`m=dev`) |

## Статус MCP-чтения

**Результат: ЗАБЛОКИРОВАНО** — данные макета из Figma не получены.

### Аккаунт (whoami, 2026-07-11)

- Email: `m.gal@collabox.dev`
- Handle: `maxim`
- План: Starter, seat **View** (лимит ~6 read-вызовов MCP/месяц)

### Попытки чтения (все вернули одну ошибку)

```
Looks like you don't have edit access to this file.
The file owner can share it with you and make you an editor.
```

| Инструмент | Debug UUID | Данные |
|------------|------------|--------|
| `get_design_context` | `db29454d-8821-4760-bc60-e51ff02a8061` | ❌ нет |
| `get_metadata` | `b7d8f3c3-684c-4b32-af18-8af33a0e4fa8` | ❌ нет |
| `get_screenshot` | `2dc13ae8-2679-433a-adc4-38be2f6b9f8f` | ❌ нет |
| `get_variable_defs` | `857539b7-c2ba-4b88-b638-f88664b8e2a7` | ❌ нет |

### Что нужно для успешного чтения

1. Владелец файла **Senler – Layouts** даёт `m.gal@collabox.dev` доступ (минимум Can view, лучше Can edit).
2. Файл должен быть в команде, к которой принадлежит аккаунт, или расшарен напрямую.
3. После выдачи доступа — один раз обновить этот кэш (4 MCP-вызова: context, metadata, screenshot, variables).

---

## Данные макета из Figma

> Обновлено по скриншотам (desktop + mobile), 2026-07-11. MCP не использовался.

### Экран: Welcome / Empty State (нет комнат)

**Назначение:** показывается на `/` и `/rooms`, когда `rooms.length === 0`. Кнопка «Приступить» открывает `CreateCompanyForm`.

### Экран: Создание компании (`CreateCompanyForm`)

**Терминология:** в UI — «компания»; в коде — `room` (см. `.cursor/rules/room-company-terminology.mdc`).

#### Структура

1. Иконка megaphone в синем квадрате
2. Заголовок: «Создайте свою первую компанию» (или «Создайте компанию»)
3. Подзаголовок: «Укажите информацию о компании»
4. Card: аватар + название
5. Кнопки: «Назад» | «Завершить»

#### Аватар

- PNG/JPEG, min 200×200 px
- Превью в круге, кнопка «+ Добавить»
- **На бэкенд не отправляется** — заготовка: `types/companyAvatar.ts`, `useCompanyAvatarDraft`

#### Реализация

- `rooms/components/CreateCompanyForm.tsx`
- `rooms/components/CompanyAvatarPicker.tsx`
- `hooks/rooms/useCompanyAvatarDraft.ts`

#### Визуальная структура (сверху вниз)

1. **Облако тегов** — декоративный кластер pill-кнопок с мягким синим glow за ними
2. **Заголовок:** «Амбассадор» (bold, centered)
3. **Подзаголовок:** «Управляйте сотрудничеством с амбассадорами легко и прозрачно»
4. **CTA:** кнопка «Приступить» (primary blue)

#### Теги (по рядам)

| Ряд | Тег | Иконка | Стиль |
|-----|-----|--------|-------|
| 1 | Автоматизация ОРД | sync | primary blue, white text |
| 2 | Задания | users | light blue |
| 2 | Выплаты | banknote | light green |
| 3 | Аналитика | pie chart | green, white text |
| 3 | Кампании | megaphone | blue, white text |
| 4 | Амбассадоры | user | lavender |
| 4 | Спринты | calendar | grey-blue |
| 5 | Контент | image | blue, white text |
| 5 | Охваты | trending up | green, white text |
| 6 | Контроль работы | eye | light grey, centered |

#### Layout

- Фон: белый (`bg-background`)
- Всё по центру, `min-h-screen`
- Desktop и mobile — одна структура, на мобилке теги компактнее (`text-xs`, меньше padding)
- Без заголовка «Список комнат» и без кнопки «Создать комнату» в шапке

#### Реализация в коде

- `src/pages/(list_integration)/rooms/components/RoomsWelcome.tsx` — UI welcome
- `src/pages/(list_integration)/rooms/index.tsx` — ветка `!rooms.length` → `RoomsWelcome` + `CreateRoomDialog`

### get_metadata / get_design_context / get_screenshot

```
(не получено через MCP — доступ к файлу заблокирован)
```

---

## Текущая реализация в коде (snapshot на 2026-07-11)

Предполагаемая цель макета: страница **настроек комнаты** в admin-frontend.

### Маршрут

- `/rooms/:slug/setting` → `src/pages/(list_integration)/settings/index.tsx`

### Структура страницы (сверху вниз)

1. **Alert** — общая ошибка (`generalError`)
2. **Card «Основное»**
   - `RoomNameSection` — поле «Название»
   - `RoomActionButtons` — «Удалить» (destructive) + «Сохранить»
3. **DeleteRoomDialog** — модалка подтверждения удаления
4. **OrdIssuanceRuleSummaryCard** — «Автовыпуск ORD-договоров»
   - disabled если `!room.ordPerson`
   - ссылка: `/rooms/:slug/ord/auto-issuance`
5. **OrdRoomFilesSummaryCard** — ORD-файлы
   - disabled если `!room.ordPerson`
   - ссылка: `/rooms/:slug/ord/files`
6. **SettingsBotsSection** (`#bots`)
   - «Бот при одобрении креативной задачи»
   - «Бот при отклонении креативной задачи»
   - отдельная кнопка «Сохранить»
7. **SettingsWebhookSection** (`#webhook`)
   - URL вебхука + «Сохранить»
   - Секретный ключ (password, copy, rotate)
   - Ссылка: `/rooms/:slug/setting/info` — «описание формата вебхука»

### Layout-контейнер

```tsx
<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-1 py-2 sm:px-0">
```

### Связанные экраны (не на главной settings, но рядом)

| Экран | Путь | Файл |
|-------|------|------|
| Формат вебхука | `/rooms/:slug/setting/info` | `settings/info/index.tsx` |
| Код для сайта | `/rooms/:slug/code` | `code/index.tsx` + `FormForSiteSection` |

### Компоненты

| Компонент | Файл |
|-----------|------|
| RoomNameSection | `settings/components/RoomNameSection.tsx` |
| RoomActionButtons | `settings/components/RoomActionButtons.tsx` |
| SettingsBotsSection | `settings/components/SettingsBotsSection.tsx` |
| SettingsWebhookSection | `settings/components/SettingsWebhookSection.tsx` |
| WebhookSection | `settings/components/WebhookSection.tsx` |
| DeleteRoomDialog | `settings/components/DeleteRoomDialog.tsx` |
| OrdIssuanceRuleSummaryCard | `ord/components/OrdIssuanceRuleSummaryCard.tsx` |
| OrdRoomFilesSummaryCard | `ord/components/OrdRoomFilesSummaryCard.tsx` |

### Поведение (не менять без явного запроса)

- `useGetRoomById`, `useUpdateRoom`, `useDeleteRoom`, `useRotateSecretKey`
- Deep-link: `location.hash === "#bots"` / `"#webhook"` → scrollIntoView
- Toast при успешном сохранении
- ORD-карточки disabled без `room.ordPerson`

---

## Чеклист задач (заполнить после получения макета)

- [ ] Сверить заголовок страницы / breadcrumbs с макетом
- [ ] Сверить ширину контейнера (`max-w-3xl` vs макет)
- [ ] Секция «Основное»: поля, кнопки, порядок действий
- [ ] ORD-карточки: тексты, кнопки, disabled-состояния
- [ ] Боты: лейблы, поиск, селекты, отступы
- [ ] Вебхук: раскладка URL/секрета, helper-тексты, иконки
- [ ] Есть ли в макете «Форма для сайта» (сейчас на `/code`, не в settings)
- [ ] Новые секции в макете, которых нет в коде
- [ ] Секции в коде, которых нет в макете (удалить/скрыть?)
- [ ] Мобильная вёрстка
- [ ] Состояния: loading, error, empty, validation

---

## Как обновить этот кэш (когда доступ появится)

Агенту: выполнить 4 вызова MCP **один раз**, записать ответы в секции выше, затем составить diff с кодом.

```
fileKey: bAbFX4C4FHvWQ1whR5p3jn
nodeId: 15593:39086
```

Инструменты: `get_design_context`, `get_metadata`, `get_screenshot`, `get_variable_defs`.

Альтернатива без MCP: пользователь прикрепляет скриншот макета в чат — diff по изображению.
