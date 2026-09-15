# Вход через Senler.io

Репозиторий `admin-frontend` — кабинет владельцев комнат на
`admin.ambassador.sen.collabox.dev`. Кабинет амбассадоров на
`admin2.ambassador.sen.collabox.dev` в этом OAuth-потоке не участвует.

В приложении Senler.io типа «Плагин» указать основной URL встроенной страницы:
`https://admin.ambassador.sen.collabox.dev/auth`.

## Поток входа внутри кабинета

Senler.io открывает админку во фрейме с подписанным `launch_code`. Фронтенд
сохраняет код в памяти и удаляет из URL. Сохранённая сессия другого проекта и
параметры прежнего запуска Senler.ru для такого входа не используются.

Кнопка «Войти через Senler.io» открывает popup. Форма отправляет `launchCode`
на `POST /api/auth/senler-io/start` в этом popup; iframe остаётся на месте.
Бэкенд проверяет подпись, срок и однократность запуска, а затем начинает OAuth
именно для подписанного проекта. Сам launch_code не выдаёт прав администратора:
требуемые разрешения подтверждаются через OAuth.

После OAuth бэкенд возвращает HTML, который передаёт одноразовый код амбассадорки
через `postMessage` открывшему окну с разрешённым origin фронтенда. Фронтенд проверяет origin API,
ссылку на конкретный popup и формат сообщения, подтверждает получение и один раз
вызывает `/api/auth/senler-io/exchange` без старого Authorization. Popup закрывается,
а iframe показывает комнаты подключённого проекта. JWT и токены Senler в сообщении
не передаются. Общий обработчик сообщений не сохраняет и не логирует этот код.

При отказе, закрытии или блокировке popup ошибка отображается в iframe. Если
launch_code уже использован или истёк, нужно закрыть и заново открыть плагин.
Ручной вход с `/auth` без контекста запуска тоже работает через popup, с выбором
проекта в Senler.io. Старый вход Senler.ru сохраняется.

## Окружение

**Фронтенд — при сборке**, перед `npm run build`:

```dotenv
VITE_API_URL=https://api-ambassador.senler.ru/api/
```

API может находиться на другом домене. Фронтенд принимает результат только от
конкретного popup с origin API из `VITE_API_URL`. Начало OAuth и callback должны
использовать один origin API для cookie. Прокси через домен фронтенда не требуется.
Относительный `/api/` также поддерживается, если он действительно ведёт на API.

Vite подставляет переменную в JS при сборке. Значение только в runtime готового
контейнера ничего не изменит. `.gitlab-ci.yml` запускает отдельный проект
`integrations/ambassador-system/deployment/ambassador-admin-frontend`; переменная
должна попасть в job или Docker build stage, где выполняется сборка.

**Бэкенд — runtime**:

```dotenv
SENLER_IO_CLIENT_ID=<Client ID>
SENLER_IO_CLIENT_SECRET=<Client Secret>
SENLER_IO_CALLBACK_URI=https://api-ambassador.senler.ru/api/auth/senler-io/callback
SENLER_IO_FRONTEND_ORIGIN=https://admin.ambassador.sen.collabox.dev
```

Этот callback регистрируется в OAuth-настройках Senler.io. `SENLER_IO_FRONTEND_ORIGIN`
разрешает отправку результата входа только окну админки с этим origin; это адрес
без пути, он не используется для перенаправления. Если фронт и API имеют один
origin, эту переменную можно не задавать. Для отдельных доменов она обязательна.
На API должен быть разрешён CORS для запросов фронтенда без cookie. Переменная
`SENLER_IO_FRONTEND_URL` больше не используется, её можно удалить. Отдельная
страница `/auth/senler-io/callback` на фронтенде не нужна. Секреты и OAuth-токены
Senler хранятся на бэкенде; новые `VITE_SENLER_*` переменные не требуются.

Выкладывать вместе с backend popup-потоком и миграцией
`20260911160000_bind_senler_io_embedded_launch`. На прокси исключить launch_code,
OAuth code и state из access-логов. На страницах OAuth не должно быть политики
Cross-Origin-Opener-Policy, разрывающей связь с окном админки. Настройки ботов,
шаги и отслеживание групп Senler.io в этот этап не входят.

После деплоя проверить настоящий запуск плагина из Senler.io, первый вход,
создание комнаты, повторное открытие плагина и прежний вход через Senler.ru.
Протокол запуска: https://senler.io/help/ru/developer/embedded-page.
