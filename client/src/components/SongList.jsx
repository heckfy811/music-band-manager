// src/components/SongList.jsx
import React from 'react';

const SongList = ({ songs }) => {
  if (!songs || songs.length === 0) {
    return <p className="text-gray-500">Нет данных о репертуаре</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Название</th>
            <th className="py-2 px-4 border-b">Композитор</th>
            <th className="py-2 px-4 border-b">Автор текста</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-4 border-b">{song.title}</td>
              <td className="py-2 px-4 border-b">{song.composer}</td>
              <td className="py-2 px-4 border-b">{song.lyricist}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongList;