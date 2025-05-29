import React from 'react';

const GroupCard = ({ group }) => {
  return (
    <div className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold">{group.name}</h3>
      <p>Страна: {group.country} | Год основания: {group.foundedYear}</p>
      <p>Позиция в чарте: {group.chartPosition || 'Не в топе'}</p>
      <div className="mt-2">
        <span className="font-semibold">Состав:</span>
        <ul className="list-disc list-inside">
          {group.members.map((member, idx) => (
            <li key={idx}>{member}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupCard;