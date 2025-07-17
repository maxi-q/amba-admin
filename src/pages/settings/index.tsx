import { useOutletContext, useParams } from "react-router-dom";
import type { IRoomData } from "..";


export default function SettingPage() {
  const roomData = useOutletContext<IRoomData>();

  const { slug } = useParams();
  console.log(slug);

  const changeRoomName = (value: string) => {
    console.log(value);
  };

  const groups = roomData.groups;

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      alert("Ссылка скопирована в буфер обмена!");
    });
  };

  return (
    <div className="mx-auto max-w-[900px] p-6 font-sans antialiased">
      {/* Название */}
      <div className="mb-8">
        <label className="mb-1.5 block text-sm">Название:</label>
        <input
          type="text"
          value={roomData.roomName}
          onChange={(e) => changeRoomName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Группы */}
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold">{group.title}</h3>

            <div className="mb-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 font-bold">
                VK
              </div>
              <div>
                <p className="m-0">{group.name}</p>
                <p className="text-xs text-gray-600">
                  ID: {group.senlerId}{" "}
                  <a href="#" className="underline">
                    перейти к редактированию
                  </a>
                </p>
              </div>
            </div>

            <ol className="mb-4 ml-4 list-decimal space-y-1 text-sm leading-snug">
              {group.instructions.map((txt, idx) => (
                <li key={idx}>{txt}</li>
              ))}
            </ol>

            <div className="flex items-center">
              <input
                type="text"
                value={group.link}
                readOnly
                className="flex-1 rounded-md border border-gray-300 px-2 py-2 text-sm"
              />
              <button
                onClick={() => handleCopy(group.link)}
                title="Копировать"
                className="ml-1.5 rounded-md border border-gray-300 bg-gray-100 px-2 py-1.5 text-lg transition hover:bg-gray-200"
              >
                📋
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
