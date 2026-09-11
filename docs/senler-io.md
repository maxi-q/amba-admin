# Вход через Senler.io

Страница `/auth` предлагает вход через Senler.io. Браузер открывает API
`/api/auth/senler-io/start` в верхнем окне (в том числе при запуске из iframe).
После выбора проекта бэкенд перенаправляет на `/auth/senler-io/callback` фронтенда
с одноразовым кодом в URL fragment. Страница удаляет fragment и однократно
обменивает код на JWT амбассадорки, без старого Authorization. Автоматических
повторов нет; повторное выполнение эффекта React StrictMode не дублирует обмен.

При успешном входе очищаются данные предыдущего проекта в React Query и контекст
Senler.ru. JWT амбассадорки сохраняется как в существующем входе; сессия Senler.io
восстанавливается при обновлении страницы. Ответ API 401 возвращает на вход.
Запуск Senler.ru с `sign`/`group_id` авторизует свой проект как прежде.
Настройки ботов и ссылки на группы Senler.ru для проектов Senler.io недоступны.

## Переменные и деплой

**Фронтенд — этап сборки**, перед `npm run build`:

```dotenv
# Общий домен фронтенда и API:
VITE_API_URL=/api/
# Либо абсолютный URL API с /api/ в конце:
# VITE_API_URL=https://api.example.com/api/
```

Vite подставляет `import.meta.env.VITE_API_URL` в JS при сборке. Переменная только
в runtime уже собранного контейнера не изменит адрес API. В Docker значение надо
передать в build stage (ARG/ENV до `RUN npm run build`); при прямой сборке в CI —
в окружение команды сборки. После изменения нужна новая сборка.

`.gitlab-ci.yml` этого репозитория запускает отдельный проект
`integrations/ambassador-system/deployment/ambassador-admin-frontend`.
Настраивать передачу `VITE_API_URL` нужно там, где фактически выполняется сборка,
а не только в окружении контейнера со статикой.

**Бэкенд — runtime**, дополнительно к Client ID, Client Secret и callback Senler:

```dotenv
SENLER_IO_FRONTEND_URL=https://admin.ambassador.sen.collabox.dev/auth/senler-io/callback
```

Это URL страницы фронтенда, без `/api`. Он отличается от зарегистрированного
в приложении Senler `SENLER_IO_CALLBACK_URI`, который указывает на бэкенд:
`https://admin.ambassador.sen.collabox.dev/api/auth/senler-io/callback`. Домен начала OAuth (из
`VITE_API_URL`) должен совпадать с доменом backend callback, чтобы вернулась cookie.
Client ID/Secret, refresh token и access token Senler фронтенду не нужны;
никаких новых `VITE_SENLER_*` переменных добавлять не требуется.

Сервер статики должен отдавать `index.html` для `/auth/senler-io/callback` (обычный
SPA fallback). Если домены фронтенда и API отличаются, API должен разрешать origin
фронтенда в CORS. При отказе непосредственно в Senler.io ошибку показывает backend
callback; повторный вход начинается со страницы `/auth`.

Выкладывать вместе с поддержкой OAuth Senler.io на бэкенде и его миграцией.
После деплоя проверить вход с реальным проектом, создание комнаты, обновление
страницы и прежний вход через Senler.ru. Шаги и синхронизация групп Senler.io
в этот этап не входят.

Этот репозиторий — `admin-frontend`, кабинет владельцев комнат на
`admin.ambassador.sen.collabox.dev`. Кабинет амбассадоров на
`admin2.ambassador.sen.collabox.dev` в данном OAuth-потоке не участвует.
