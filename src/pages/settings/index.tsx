import { useState } from "react";
import RoomBox from "../modules";
import { useParams } from "react-router-dom";

/**
 * Простая реализация страницы настроек комнаты *без* внешних библиотек.
 * Используются только нативные теги HTML, React‑состояния и обычный CSS,
 * встроенный в тег <style>. При желании стили можно вынести в отдельный файл.
 */
export default function SettingPage() {
  const [roomName, setRoomName] = useState("Конференция суровый маркетинг 2025");

  const { slug } = useParams();
  console.log(slug);

  const groups = [
    {
      id: 1,
      title: "Группа подписчиков в Senler для подачи заявки в амбассадорку",
      name: "Заявки амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: "https://vk.com/app5898182_-103213116#s=2580611",
      instructions: [
        "Отправить прямую ссылку на группу подписчиков:",
        "Сделать рассылку через бота с предложением об участии и кнопкой \"Принять\" (при нажатии на которую вызвать действие добавления в группу)",
        "Самостоятельно добавить участников в группу подписчиков в кабинете Senler",
        "И так далее. Варианты ограничиваются только вашей фантазией…",
      ],
    },
    {
      id: 2,
      title: "Группа подписчиков в Senler для одобренных амбассадоров",
      name: "Одобренные амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: "https://vk.com/app5898182_-103213116#s=2580611",
      instructions: [
        "Добавляйте в данную группу одобренных амбассадоров, чтобы они смогли принять участие.",
        "Если вы хотите принимать без амбассадоров без процесса одобрения, организуйте подписку на данную группу минуя группу с заявками.",
        "Прямая ссылка на вступление в данную группу минуя процесс одобрения:",
      ],
    },
    {
      id: 3,
      title: "Группа подписчиков в Senler для исключенных амбассадоров",
      name: "Исключенные амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: "https://vk.com/app5898182_-103213116#s=2580611",
      instructions: [
        "В данной группе можно сохранять исключенных амбассадоров, чтобы автоматически отключать их участие в комнате.",
        "Вступление будет отключаться из группы с заявками и одобренными амбассадорами.",
      ],
    },
  ];

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      alert("Ссылка скопирована в буфер обмена!");
    });
  };

  return (
    <RoomBox roomName={roomName} >
    {/* Название */}
      <div className="field">
        <label>Название:</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
      </div>

      {/* Группы */}
      <div className="groups">
        {groups.map((group) => (
          <div className="card" key={group.id}>
            <h3 className="card-title">{group.title}</h3>

            <div className="avatar-row">
              <div className="avatar-fallback">VK</div>
              <div className="avatar-info">
                <p>{group.name}</p>
                <p className="small-text">
                  ID: {group.senlerId} <a href="#">перейти к редактированию</a>
                </p>
              </div>
            </div>

            <ol className="instructions">
              {group.instructions.map((txt, idx) => (
                <li key={idx}>{txt}</li>
              ))}
            </ol>

            <div className="link-row">
              <input type="text" value={group.link} readOnly />
              <button onClick={() => handleCopy(group.link)} title="Копировать">
                📋
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопки действий */}
      <div className="actions">
        <button className="btn delete">Удалить</button>
        <button className="btn save">Сохранить</button>
      </div>

      {/* Стили */}
      <style>{`
        * { box-sizing: border-box; }
        body, input, button { font-family: "Inter", sans-serif; }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          }
          
          .breadcrumbs {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            margin-bottom: 24px;
            }
            .breadcrumbs a {
              text-decoration: underline;
              }
              .room-id {
                font-family: monospace;
                }
                
                /* Tabs */
        .tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          margin-bottom: 32px;
          }
          .tab {
            padding: 10px 0;
          border: 1px solid #ccc;
          background: #f9f9f9;
          border-radius: 6px;
          font-size: 14px;
          }
          .tab.active {
            background: #fff;
          font-weight: 600;
          }
          .tab:disabled {
            opacity: 0.5;
            cursor: default;
            }
            
            /* Field */
            .field {
          margin-bottom: 32px;
          }
        .field label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          }
        .field input[type="text"] {
          width: 100%;
          padding: 10px 12px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        /* Cards */
        .groups {
          display: flex;
          flex-direction: column;
          gap: 24px;
          }
          .card {
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .card-title {
              font-size: 18px;
          margin-bottom: 16px;
          }
          
        .avatar-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
          }
          .avatar-fallback {
            width: 44px;
            height: 44px;
            border-radius: 50%;
          background: #ededed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          }
          .avatar-info p {
            margin: 2px 0;
            }
            .small-text {
              font-size: 12px;
          color: #666;
          }
          .small-text a {
            text-decoration: underline;
            }
            
            .instructions {
              margin-left: 18px;
              margin-bottom: 16px;
              font-size: 14px;
              line-height: 1.4;
              }
              
              /* Link row */
              .link-row {
                position: relative;
          display: flex;
          align-items: center;
          }
          .link-row input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
        }
        .link-row button {
          margin-left: 6px;
          padding: 6px 10px;
          font-size: 18px;
          background: #f5f5f5;
          border: 1px solid #ccc;
          border-radius: 6px;
          cursor: pointer;
          }
          
          /* Actions */
          .actions {
            display: flex;
            justify-content: space-between;
            margin-top: 48px;
            }
            .btn {
              padding: 14px 36px;
              font-size: 16px;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              }
              .save {
                background: #4f8ef7;
                color: #fff;
                }
                .delete {
                  background: #fddede;
                  color: #b91c1c;
                  }
                  `}</style>
      </RoomBox>
  );
}
