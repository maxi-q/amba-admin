import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const SprintSetting = () => {
  const { sprintId, slug } = useParams();
  const [sprintName, setSprintName] = useState('Загрузка')

  useEffect(()=>{
    console.log(sprintId)

    setSprintName('Подготовка к конференции')
  }, [])

  return (
    <div>
      <div className="mb-6 text-sm">
        <span>
          <Link to={`/rooms/${slug}/sprints`} className="underline">
            Список спринтов
          </Link>{" "}
          &gt; {sprintName}
        </span>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Настройки</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Название</label>
          <input type="text" placeholder="Будет показываться вам и определенным амбассадорам" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Ограничить спринт датами</label>
          <div className="flex space-x-4">
            <input type="date" className="mt-1 block w-1/2 border-gray-300 rounded-md shadow-sm" defaultValue="2024-12-10" />
            <input type="date" className="mt-1 block w-1/2 border-gray-300 rounded-md shadow-sm" defaultValue="2025-02-10" />
            <input type="checkbox" />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-2xl font-bold mb-4">Промокоды</label>
          <div className="flex space-x-4 max-w-md">
            <p className="mt-1 text-sm text-gray-700">Для какого участка будет спеймерован уникальный промокод, который отправится при добавлении в группу амбассадоров, а также будет отправлен указанные ниже награды</p>
          </div>
        </div>
        <div className="mb-4 flex justify-between">
          <label className="block text-sm font-medium text-gray-700">Использование промокода доступно только в период проведения спринта</label>
          <input type="checkbox" className="mt-1" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Награда для приодленных пользователей</label>
          <div className="flex space-x-4">
            <input type="number" className="mt-1 block w-1/2 border-gray-300 rounded-md shadow-sm" defaultValue="0" />
            <span className="mt-1 text-sm text-gray-700">руб</span>
          </div>
        </div>

        <div className="mb-4 flex justify-between">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ограничить число использования каждого промокода</label>
            <div className="flex space-x-4">
              <input type="number" className="mt-1 block w-1/2 border-gray-300 rounded-md shadow-sm" defaultValue="100" />
              <span className="mt-1 text-sm text-gray-700">раз</span>
            </div>
          </div>
          <input type="checkbox" className="mt-1" />
        </div>
      </div>
    </div>
  )
}

export default SprintSetting