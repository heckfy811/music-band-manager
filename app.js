const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware для работы с JSON и статики
app.use(bodyParser.json());
app.use(express.static('public'));

// Утилиты для чтения/записи JSON-файлов
function readJSON(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

const groupsFile = path.join(__dirname, 'data', 'groups.json');
const songsFile = path.join(__dirname, 'data', 'songs.json');
const toursFile = path.join(__dirname, 'data', 'tours.json');

// Получение всех групп
app.get('/api/groups', (req, res) => {
  const groups = readJSON(groupsFile);
  res.json(groups);
});

// Получение всех песен
app.get('/api/songs', (req, res) => {
  const songs = readJSON(songsFile);
  res.json(songs);
});

// Получение всех гастролей
app.get('/api/tours', (req, res) => {
  const tours = readJSON(toursFile);
  res.json(tours);
});

// 1. Запрос: Какие песни исполнялись на гастролях заданной группы (используется репертуар группы)
app.get('/api/query/songs-on-tour', (req, res) => {
  const groupName = req.query.groupName;
  if (!groupName) {
    return res.status(400).json({ error: 'Параметр groupName обязателен.' });
  }
  const groups = readJSON(groupsFile);
  const songs = readJSON(songsFile);
  const group = groups.find(g => g.name.toLowerCase() === groupName.toLowerCase());
  if (!group) {
    return res.status(404).json({ error: 'Группа не найдена' });
  }
  const repertoireSongs = songs.filter(song => group.repertoire.includes(song.id));
  res.json(repertoireSongs);
});

// 2. Запрос: Какие группы исполняют песни заданного композитора
app.get('/api/query/groups-by-composer', (req, res) => {
  const composer = req.query.composer;
  if (!composer) {
    return res.status(400).json({ error: 'Параметр composer обязателен.' });
  }
  const groups = readJSON(groupsFile);
  const songs = readJSON(songsFile);
  const matchingGroups = groups.filter(group => {
    return group.repertoire.some(songId => {
      const song = songs.find(s => s.id === songId);
      return song && song.composer.toLowerCase() === composer.toLowerCase();
    });
  });
  res.json(matchingGroups);
});

// 3. Запрос: Детали песни по названию и в каких группах она входит (ищется по названию)
app.get('/api/query/song-details', (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.status(400).json({ error: 'Параметр title обязателен.' });
  }
  const songs = readJSON(songsFile);
  const groups = readJSON(groupsFile);
  const song = songs.find(s => s.title.toLowerCase() === title.toLowerCase());
  if (!song) {
    return res.status(404).json({ error: 'Песня не найдена' });
  }
  const belongingGroups = groups
    .filter(group => group.repertoire.includes(song.id))
    .map(g => g.name);
  res.json({
    song: {
      title: song.title,
      composer: song.composer,
      lyricist: song.lyricist,
      yearCreated: song.yearCreated
    },
    groups: belongingGroups
  });
});

// 4. Запрос: Репертуар наиболее популярной группы (предполагается, что группа с наименьшим числовым рейтингом – самая популярная)
app.get('/api/query/popular-repertoire', (req, res) => {
  const groups = readJSON(groupsFile);
  const songs = readJSON(songsFile);
  if (groups.length === 0)
    return res.status(404).json({ error: 'Нет данных о группах' });

  groups.sort((a, b) => a.rating - b.rating);
  const mostPopular = groups[0];
  const repertoireSongs = songs.filter(song => mostPopular.repertoire.includes(song.id));
  res.json({
    group: mostPopular.name,
    repertoire: repertoireSongs
  });
});

// 5. Запрос: Место (город(а)) и продолжительность гастролей для группы с заданным названием
app.get('/api/query/tour-info', (req, res) => {
  const groupName = req.query.groupName;
  if (!groupName) {
    return res.status(400).json({ error: 'Параметр groupName обязателен.' });
  }
  const groups = readJSON(groupsFile);
  const tours = readJSON(toursFile);
  const group = groups.find(g => g.name.toLowerCase() === groupName.toLowerCase());
  if (!group) {
    return res.status(404).json({ error: 'Группа не найдена' });
  }
  const tour = tours.find(t => t.groupId === group.id);
  if (!tour) {
    return res.status(404).json({ error: 'Гастроль для данной группы не найдены' });
  }
  const start = new Date(tour.startDate);
  const end = new Date(tour.endDate);
  const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  res.json({
    group: group.name,
    tourName: tour.tourName,
    cities: tour.cities,
    durationInDays: durationInDays,
    startDate: tour.startDate,
    endDate: tour.endDate
  });
});

// 6. Запрос: Какие песни исполняет заданный певец (ищется в списке исполнителей группы)
app.get('/api/query/songs-by-singer', (req, res) => {
  const singer = req.query.singer;
  if (!singer) {
    return res.status(400).json({ error: 'Параметр singer обязателен.' });
  }
  const groups = readJSON(groupsFile);
  const songs = readJSON(songsFile);
  let collectedSongIds = new Set();
  groups.forEach(group => {
    if (group.performers.some(p => p.toLowerCase() === singer.toLowerCase())) {
      group.repertoire.forEach(songId => collectedSongIds.add(songId));
    }
  });
  const resultSongs = songs.filter(s => collectedSongIds.has(s.id));
  res.json(resultSongs);
});

// 7. Эндпоинт: Добавление песни в репертуар заданной группы
// Принимается JSON-объект с данными песни { id, title, composer, lyricist, yearCreated }
app.post('/api/groups/:groupId/songs', (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const newSong = req.body;
  if (!newSong || !newSong.id || !newSong.title) {
    return res.status(400).json({ error: 'Неверные данные песни' });
  }
  let groups = readJSON(groupsFile);
  let songs = readJSON(songsFile);
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Группа не найдена' });
  }
  // Если песни нет в общем списке, добавляем её
  if (!songs.find(s => s.id === newSong.id)) {
    songs.push(newSong);
    writeJSON(songsFile, songs);
  }
  // Если песни ещё нет в репертуаре группы, добавляем
  if (!groups[groupIndex].repertoire.includes(newSong.id)) {
    groups[groupIndex].repertoire.push(newSong.id);
    writeJSON(groupsFile, groups);
  }
  res.json({ message: 'Песня успешно добавлена в репертуар группы' });
});

// 8. Эндпоинт: Удаление песни из репертуара заданной группы
app.delete('/api/groups/:groupId/songs/:songId', (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const songId = parseInt(req.params.songId);
  let groups = readJSON(groupsFile);
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Группа не найдена' });
  }
  const repertoire = groups[groupIndex].repertoire;
  const songIndex = repertoire.indexOf(songId);
  if (songIndex === -1) {
    return res.status(404).json({ error: 'Песня не найдена в репертуаре группы' });
  }
  repertoire.splice(songIndex, 1);
  groups[groupIndex].repertoire = repertoire;
  writeJSON(groupsFile, groups);
  res.json({ message: 'Песня удалена из репертуара группы' });
});

app.listen(port, () => {
  console.log(`Сервер запущен по адресу: http://localhost:${port}`);
});
