// Загрузка общих списков
function loadGroups() {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        const div = document.getElementById('generalResults');
        let html = '<h3>Группы</h3><ul>';
        data.forEach(group => {
          html += `<li>Название: ${group.name}, Город: ${group.city}, Год: ${group.yearCreated}, Страна: ${group.country}, Рейтинг: ${group.rating}</li>`;
        });
        html += '</ul>';
        div.innerHTML = html;
      });
  }
  
  function loadSongs() {
    fetch('/api/songs')
      .then(res => res.json())
      .then(data => {
        const div = document.getElementById('generalResults');
        let html = '<h3>Песни</h3><ul>';
        data.forEach(song => {
          html += `<li>Название: ${song.title}, Композитор: ${song.composer}, Автор: ${song.lyricist}, Год: ${song.yearCreated}</li>`;
        });
        html += '</ul>';
        div.innerHTML = html;
      });
  }
  
  function loadTours() {
    fetch('/api/tours')
      .then(res => res.json())
      .then(data => {
        const div = document.getElementById('generalResults');
        let html = '<h3>Гастроли</h3><ul>';
        data.forEach(tour => {
          html += `<li>Группа: ${tour.groupId}, Название тура: ${tour.tourName}, Города: ${tour.cities.join(', ')}, Даты: ${tour.startDate} - ${tour.endDate}, Средняя цена: ${tour.averageTicketPrice}</li>`;
        });
        html += '</ul>';
        div.innerHTML = html;
      });
  }
  
  // 1. Песни на гастролях заданной группы
  function querySongsOnTour() {
    const groupName = document.getElementById('groupName1').value;
    fetch(`/api/query/songs-on-tour?groupName=${encodeURIComponent(groupName)}`)
      .then(res => res.json())
      .then(data => {
        let html = '<ul>';
        if (data.error) {
          html = `<p>${data.error}</p>`;
        } else {
          data.forEach(song => {
            html += `<li>Название: ${song.title}, Композитор: ${song.composer}</li>`;
          });
          html += '</ul>';
        }
        document.getElementById('resultSongsOnTour').innerHTML = html;
      });
  }
  
  // 2. Группы по композитору
  function queryGroupsByComposer() {
    const composer = document.getElementById('composerQuery').value;
    fetch(`/api/query/groups-by-composer?composer=${encodeURIComponent(composer)}`)
      .then(res => res.json())
      .then(data => {
        let html = '<ul>';
        if (data.error) {
          html = `<p>${data.error}</p>`;
        } else {
          data.forEach(group => {
            html += `<li>Название: ${group.name}</li>`;
          });
          html += '</ul>';
        }
        document.getElementById('resultGroupsByComposer').innerHTML = html;
      });
  }
  
  // 3. Детали песни по названию
  function querySongDetails() {
    const title = document.getElementById('songTitleQuery').value;
    fetch(`/api/query/song-details?title=${encodeURIComponent(title)}`)
      .then(res => res.json())
      .then(data => {
        let html = '';
        if (data.error) {
          html = `<p>${data.error}</p>`;
        } else {
          html += `<p>Песня: ${data.song.title}, Композитор: ${data.song.composer}, Автор: ${data.song.lyricist}, Год создания: ${data.song.yearCreated}</p>`;
          html += `<p>Входит в репертуар групп: ${data.groups.join(', ')}</p>`;
        }
        document.getElementById('resultSongDetails').innerHTML = html;
      });
  }
  
  // 4. Репертуар наиболее популярной группы
  function queryPopularRepertoire() {
    fetch('/api/query/popular-repertoire')
      .then(res => res.json())
      .then(data => {
        let html = '';
        if (data.error) {
          html = `<p>${data.error}</p>`;
        } else {
          html += `<p>Наиболее популярная группа: ${data.group}</p>`;
          html += '<ul>';
          data.repertoire.forEach(song => {
            html += `<li>Название: ${song.title}</li>`;
          });
          html += '</ul>';
        }
        document.getElementById('resultPopularRepertoire').innerHTML = html;
      });
  }
  
  // 5. Тур инфо группы
  function queryTourInfo() {
    const groupName = document.getElementById('groupName2').value;
    fetch(`/api/query/tour-info?groupName=${encodeURIComponent(groupName)}`)
      .then(res => res.json())
      .then(data => {
        let html = '';
        if (data.error) {
          html = `<p>${data.error}</p>`;
        } else {
          html += `<p>Тур группы ${data.group}: ${data.tourName}</p>`;
          html += `<p>Города: ${data.cities.join(', ')}</p>`;
          html += `<p>Даты: ${data.startDate} - ${data.endDate} (Продолжительность: ${data.durationInDays} дней)</p>`;
        }
        document.getElementById('resultTourInfo').innerHTML = html;
      });
  }
  
  // 6. Песни заданного певца
  function querySongsBySinger() {
    const singer = document.getElementById('singerQuery').value;
    fetch(`/api/query/songs-by-singer?singer=${encodeURIComponent(singer)}`)
      .then(res => res.json())
      .then(data => {
        let html = '<ul>';
        if (data.error) {
          html = `<p>${data.error}</p>`;
        } else {
          data.forEach(song => {
            html += `<li>Название: ${song.title}</li>`;
          });
          html += '</ul>';
        }
        document.getElementById('resultSongsBySinger').innerHTML = html;
      });
  }
  
  // 7. Добавление песни в репертуар группы
  function addSongToGroup() {
    const groupId = document.getElementById('groupIdAdd').value;
    const songId = document.getElementById('songIdAdd').value;
    const title = document.getElementById('songTitleAdd').value;
    const composer = document.getElementById('composerAdd').value;
    const lyricist = document.getElementById('lyricistAdd').value;
    const yearCreated = document.getElementById('yearCreatedAdd').value;
    
    const songData = {
      id: parseInt(songId),
      title: title,
      composer: composer,
      lyricist: lyricist,
      yearCreated: parseInt(yearCreated)
    };
    
    fetch(`/api/groups/${groupId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData)
    })
      .then(res => res.json())
      .then(data => {
        let html = `<p>${data.message ? data.message : data.error}</p>`;
        document.getElementById('resultAddSong').innerHTML = html;
      });
  }
  
  // 8. Удаление песни из репертуара группы
  function deleteSongFromGroup() {
    const groupId = document.getElementById('groupIdDelete').value;
    const songId = document.getElementById('songIdDelete').value;
    
    fetch(`/api/groups/${groupId}/songs/${songId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        let html = `<p>${data.message ? data.message : data.error}</p>`;
        document.getElementById('resultDeleteSong').innerHTML = html;
      });
  }
  