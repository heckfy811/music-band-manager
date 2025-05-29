import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import SongList from '../components/SongList';
import TourList from '../components/TourList';

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getGroup(id);
        setGroup(data);
      } catch (error) {
        console.error('Ошибка загрузки данных группы:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (!group) return <div>Группа не найдена</div>;

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Страна:</strong> {group.country}</p>
            <p><strong>Год основания:</strong> {group.foundedYear}</p>
            <p><strong>Текущая позиция:</strong> {group.chartPosition || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Состав:</h3>
            <ul className="list-disc pl-5">
              {group.members.map((member, idx) => (
                <li key={idx}>{member}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Репертуар</h2>
          <SongList songs={group.repertoire} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Гастроли</h2>
          <TourList tours={group.tours} />
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;