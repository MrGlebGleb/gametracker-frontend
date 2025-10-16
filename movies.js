const { useState, useEffect, Fragment } = React;
const API_URL = 'https://gametracker-backend-production.up.railway.app';
const REACTION_EMOJIS = ['😍','🔥','👍','😮','😂','👎','❤️','🤔','😢','🤯'];

function StarRating({ value = 0, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} className={"text-xl " + (value >= star ? 'text-yellow-400' : 'text-gray-500')} onClick={() => onChange(star)}>★</button>
      ))}
    </div>
  );
}

function MediaCard({ item, onMove, onRemove, onRate, onReview, onReact }) {
  return (
    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 flex gap-3">
      <img src={item.poster || ''} alt={item.title} className="w-20 h-28 object-cover rounded" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{item.title}</div>
          <div className="text-xs text-gray-400">{item.mediaType === 'tv' ? 'Сериал' : 'Фильм'}</div>
        </div>
        <div className="mt-2"><StarRating value={item.rating || 0} onChange={val => onRate(item, val)} /></div>
        <textarea className="mt-2 w-full bg-black/40 border border-gray-700 rounded p-2 text-sm" rows="2" placeholder="Отзыв..." defaultValue={item.review || ''} onBlur={e => onReview(item, e.target.value)} />
        <div className="mt-2 flex items-center gap-2">
          <button className="px-2 py-1 bg-green-600/20 border border-green-600/40 rounded text-sm" onClick={() => onMove(item)}>
            {item.board === 'wishlist' ? 'Перенести в «Посмотрел»' : 'Вернуть в «Хочу посмотреть»'}
          </button>
          <button className="px-2 py-1 bg-red-600/20 border border-red-600/40 rounded text-sm" onClick={() => onRemove(item)}>Удалить</button>
          <div className="flex items-center gap-1 ml-auto">
            {REACTION_EMOJIS.map(e => (
              <button key={e} className="text-lg" onClick={() => onReact(item, e)}>{e}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Column({ title, items, ...handlers }) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="mb-2 text-sm text-gray-400">{title}</div>
      <div className="space-y-3">
        {items.map(it => (
          <MediaCard key={it.id} item={it} {...handlers} />
        ))}
      </div>
    </div>
  );
}

function Section({ heading, left, right }) {
  return (
    <div>
      <div className="text-xl font-bold mb-3">{heading}</div>
      <div className="flex gap-4">
        {left}
        {right}
      </div>
    </div>
  );
}

function App() {
  const [boards, setBoards] = useState({ movies: { wishlist: [], watched: [] }, tv: { wishlist: [], watched: [] } });
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie');
  const [searchResults, setSearchResults] = useState([]);
  const token = localStorage.getItem('token');

  async function loadBoards() {
    const res = await fetch(`${API_URL}/api/user/media/boards`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setBoards(data.boards);
  }

  async function search() {
    if (query.length < 2) { setSearchResults([]); return; }
    const res = await fetch(`${API_URL}/api/media/search?q=${encodeURIComponent(query)}&type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setSearchResults(data.items || []);
  }

  async function addItem(item, board = 'wishlist') {
    await fetch(`${API_URL}/api/user/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ item, board })
    });
    await loadBoards();
  }

  async function onMove(item) {
    const to = item.board === 'wishlist' ? 'watched' : 'wishlist';
    await fetch(`${API_URL}/api/user/media/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ board: to }) });
    await loadBoards();
  }
  async function onRemove(item) {
    await fetch(`${API_URL}/api/user/media/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadBoards();
  }
  async function onRate(item, val) {
    await fetch(`${API_URL}/api/user/media/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating: val }) });
    await loadBoards();
  }
  async function onReview(item, text) {
    await fetch(`${API_URL}/api/user/media/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ review: text }) });
  }
  async function onReact(item, emoji) {
    await fetch(`${API_URL}/api/media/${item.id}/reactions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ emoji }) });
  }

  useEffect(() => { loadBoards(); }, []);
  useEffect(() => { const t = setTimeout(search, 300); return () => clearTimeout(t); }, [query, type]);

  const movies = boards.movies || { wishlist: [], watched: [] };
  const tv = boards.tv || { wishlist: [], watched: [] };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex gap-2">
          <input className="flex-1 bg-black/40 border border-gray-700 rounded p-2" placeholder="Поиск TMDB..." value={query} onChange={e => setQuery(e.target.value)} />
          <select className="bg-black/40 border border-gray-700 rounded p-2" value={type} onChange={e => setType(e.target.value)}>
            <option value="movie">Фильмы</option>
            <option value="tv">Сериалы</option>
          </select>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {searchResults.map(it => (
              <div key={`${it.mediaType}-${it.tmdbId}`} className="bg-gray-800 rounded p-2 border border-gray-700">
                <img src={it.poster || ''} alt={it.title} className="w-full h-48 object-cover rounded" />
                <div className="mt-2 text-sm">{it.title}</div>
                <button className="mt-2 w-full px-2 py-1 bg-purple-600/30 border border-purple-600/50 rounded text-sm" onClick={() => addItem(it, 'wishlist')}>Добавить</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Section heading="Фильмы" left={<Column title="Хочу посмотреть" items={movies.wishlist} onMove={onMove} onRemove={onRemove} onRate={onRate} onReview={onReview} onReact={onReact} />} right={<Column title="Посмотрел" items={movies.watched} onMove={onMove} onRemove={onRemove} onRate={onRate} onReview={onReview} onReact={onReact} />} />

      <Section heading="Сериалы" left={<Column title="Хочу посмотреть" items={tv.wishlist} onMove={onMove} onRemove={onRemove} onRate={onRate} onReview={onReview} onReact={onReact} />} right={<Column title="Посмотрел" items={tv.watched} onMove={onMove} onRemove={onRemove} onRate={onRate} onReview={onReview} onReact={onReact} />} />

      <Stats />
      <FriendsActivity />
    </div>
  );
}

function Stats() {
  const [stats, setStats] = useState({ movies: { watched: 0, wishlist: 0 }, tv: { watched: 0, wishlist: 0 } });
  const token = localStorage.getItem('token');
  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/api/user/media/boards`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const movies = data.boards.movies; const tv = data.boards.tv;
      setStats({
        movies: { watched: movies.watched.length, wishlist: movies.wishlist.length },
        tv: { watched: tv.watched.length, wishlist: tv.wishlist.length }
      });
    }
    load();
  }, []);
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div><div className="text-2xl font-bold">{stats.movies.watched}</div><div className="text-gray-400">Фильмов посмотрено</div></div>
        <div><div className="text-2xl font-bold">{stats.movies.wishlist}</div><div className="text-gray-400">Фильмов хочу</div></div>
        <div><div className="text-2xl font-bold">{stats.tv.watched}</div><div className="text-gray-400">Сериалов посмотрено</div></div>
        <div><div className="text-2xl font-bold">{stats.tv.wishlist}</div><div className="text-gray-400">Сериалов хочу</div></div>
      </div>
    </div>
  );
}

function FriendsActivity() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem('token');
  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/api/friends/activity?media=media`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setItems(data.activities || []);
    }
    load();
  }, []);
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="font-semibold mb-2">Активность друзей (последние 12)</div>
      <div className="space-y-2">
        {items.map(a => (
          <div key={a.id} className="text-sm text-gray-300">{a.username}: {a.action_type}</div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">Нет активности</div>}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);


