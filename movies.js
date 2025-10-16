const { useState, useEffect, useRef, Fragment, useCallback } = React;

// --- Глобальные константы и хелперы ---
const API_URL = 'https://gametracker-backend-production.up.railway.app';
const REACTION_EMOJIS = ['😍', '🔥', '👍', '😮', '😂', '👎', '❤️', '🤔', '😢', '🤯'];

// --- Переиспользуемые UI-компоненты (взяты со страницы игр) ---

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    plus: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    search: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    user: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    users: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    settings: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    logout: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
    star: <svg className={className} fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    trash: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    x: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    loader: <svg className={className + " animate-spin"} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    upload: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
    check: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    userPlus: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
    userCheck: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>,
    userClock: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><circle cx="18" cy="18" r="3" /><path d="M20.5 16.5 18 18l.5 2.5"/></svg>,
  };
  return icons[name] || null;
};

const Avatar = ({ src, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-20 h-20', xl: 'w-32 h-32' };
  return src ? (
    <img src={src} className={`${sizes[size]} avatar-circle ${className}`} alt="avatar" />
  ) : (
    <div className={`${sizes[size]} avatar-circle bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ${className}`}>
      <Icon name="user" className={size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} />
    </div>
  );
};

// --- Основные компоненты приложения ---

function StarRating({ value = 0, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => onChange(star)} className="transition-transform hover:scale-110">
          <Icon name="star" className={`w-8 h-8 ${star <= value ? 'text-yellow-400' : 'text-gray-600'}`} />
        </button>
      ))}
    </div>
  );
}

function MediaCard({ item, onSelect, onRemove, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(item)}
      className="bg-gray-800/80 rounded-lg border border-gray-700 hover:border-purple-500 transition-all cursor-pointer flex gap-3 p-2 group relative"
    >
      <img src={item.poster || 'https://placehold.co/96x128/1f2937/ffffff?text=?'} alt={item.title} className="w-14 h-20 object-cover rounded-md flex-shrink-0" />
      <div className="flex flex-col justify-between flex-grow min-w-0 py-1">
        <div>
          <h3 className="text-white font-semibold text-sm truncate">{item.title}</h3>
          {item.rating && (
            <div className="flex gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Icon key={i} name="star" className={`w-3 h-3 ${i < item.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
              ))}
            </div>
          )}
        </div>
        {item.reactions && item.reactions.length > 0 && (
          <div className="flex gap-1.5 mt-1 flex-wrap items-center">
            {item.reactions.slice(0, 4).map((r, i) => <span key={i} className="text-lg">{r.emoji}</span>)}
            {item.reactions.length > 4 && <span className="text-xs text-gray-400 self-center">+{item.reactions.length - 4}</span>}
          </div>
        )}
      </div>
      <button onClick={(e) => onRemove(e, item)} className="absolute top-1 right-1 p-1.5 bg-red-600/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity self-start flex-shrink-0 z-10">
        <Icon name="trash" className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

function Column({ title, emoji, items, ...handlers }) {
  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30 flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-xl">{emoji}</span>
                <span>{title}</span>
            </h3>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-bold">{items.length}</span>
        </div>
        <div className="space-y-2 flex-grow min-h-[150px]">
            {items.map(it => <MediaCard key={it.id} item={it} {...handlers} />)}
        </div>
    </div>
  );
}

function MediaDetailsModal({ item, onClose, onUpdate, onReact }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-purple-500/30 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{item.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg"><Icon name="x" className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-2">Рейтинг:</p>
            <StarRating value={item.rating || 0} onChange={val => onUpdate(item, { rating: val })} />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Отзыв:</label>
            <textarea
              defaultValue={item.review || ''}
              onBlur={(e) => onUpdate(item, { review: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white mt-1"
              rows="4"
              placeholder="Ваши впечатления..."
            />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Ваша реакция:</p>
            <div className="flex flex-wrap gap-2">
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onReact(item, emoji)}
                  className="text-2xl transform hover:scale-125 transition-transform p-1 rounded-full"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          {item.reactions && item.reactions.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Все реакции:</p>
              <div className="flex flex-wrap gap-2">
                {item.reactions.map((reaction, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full">
                    <span className="text-xl">{reaction.emoji}</span>
                    <span className="text-xs text-gray-400">{reaction.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Главный компонент приложения ---

function MovieApp() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState({ movies: { wishlist: [], watched: [] }, tv: { wishlist: [], watched: [] } });
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [theme, setTheme] = useState('default');
  const [showProfile, setShowProfile] = useState(false);
  const [showUserHub, setShowUserHub] = useState(false);
  const [friends, setFriends] = useState([]);
  const dragItem = useRef(null);
  const token = localStorage.getItem('token');

  const loadBoards = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/user/media/boards`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.boards) {
        setBoards(data.boards);
      } else {
        // Если доски не пришли, возможно, пользователь разлогинен
        if(res.status === 401 || res.status === 403) handleLogout();
      }
    } catch (err) {
      console.error("Ошибка загрузки досок:", err);
    }
  }, [token]);
  
  const loadFriends = useCallback(async () => {
      if(!token) return;
      // Эта функция идентична той, что на странице игр
      // и будет использоваться для отображения друзей
  }, [token]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setTheme(parsedUser.theme || 'default');
        loadBoards();
        loadFriends();
    } else {
        window.location.href = '/index.html'; 
    }
  }, [token, loadBoards, loadFriends]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/api/media/search?q=${encodeURIComponent(q)}&type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSearchResults(data.items || []);
    } catch (err) {
      console.error("Ошибка поиска:", err);
    } finally {
      setSearching(false);
    }
  };

  const addItem = async (item, board = 'wishlist') => {
    await fetch(`${API_URL}/api/user/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ item, board })
    });
    await loadBoards();
    setShowSearch(false);
    setQuery('');
  };

  const updateItem = async (item, updates) => {
    await fetch(`${API_URL}/api/user/media/${item.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates)
    });
    await loadBoards();
    if(selectedMedia && selectedMedia.id === item.id) {
        setSelectedMedia(prev => ({...prev, ...updates}));
    }
  };
  
  const removeItem = async (e, item) => {
    e.stopPropagation();
    if (confirm(`Вы уверены, что хотите удалить "${item.title}"?`)) {
      await fetch(`${API_URL}/api/user/media/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      await loadBoards();
    }
  };

  const reactToItem = async (item, emoji) => {
    await fetch(`${API_URL}/api/media/${item.id}/reactions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ emoji })
    });
    await loadBoards();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/index.html';
  };
  
  const onDragStart = (e, item) => {
    dragItem.current = { item };
    setTimeout(() => e.target.classList.add('dragging'), 0);
  };
  
  const onDragEnd = (e) => {
    const draggingElement = document.querySelector('.dragging');
    if(draggingElement) draggingElement.classList.remove('dragging');
    dragItem.current = null;
    document.querySelectorAll('.drag-over-column').forEach(el => el.classList.remove('drag-over-column'));
  };

  const onDragOver = (e) => e.preventDefault();
  const onDragEnterColumn = (e) => e.currentTarget.classList.add('drag-over-column');
  const onDragLeaveColumn = (e) => e.currentTarget.classList.remove('drag-over-column');
  
  const onDrop = async (e, targetColumnKey) => {
    e.preventDefault();
    if (!dragItem.current) return;
    
    const { item } = dragItem.current;
    const [targetMedia, targetBoard] = targetColumnKey.split(':');

    if (item.mediaType !== targetMedia) return;
    
    await updateItem(item, { board: targetBoard });
  };
  
  const movies = boards.movies || { wishlist: [], watched: [] };
  const tv = boards.tv || { wishlist: [], watched: [] };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 ${theme} flex flex-col`}>
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <a href="./index.html" className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 active:scale-95 transition-transform cursor-pointer">🎮 GameTracker</a>
              <a href="./movies.html" className="inline-flex items-center gap-2 active:scale-95 transition-transform">
                <svg className="w-7 h-7" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs><linearGradient id="camGradHeaderReact" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
                  <path fill="url(#camGradHeaderReact)" d="M4 7a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-.764l3.553 2.132A1 1 0 0 0 22 14.5v-5a1 1 0 0 0-1.447-.868L17 10.764V10a3 3 0 0 0-3-3H11l-.553-1.106A2 2 0 0 0 8.658 5H6a2 2 0 0 0-1.789 1.106L4 7Zm7 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
                </svg>
                <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">MovieTracker</span>
              </a>
            </div>
            {user && (
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                        <Avatar src={user.avatar} size="sm" />
                        <span className="text-white font-semibold text-sm md:text-base block">{user.username}</span>
                    </div>
                    <button onClick={() => alert('Просмотр друзей и их досок с фильмами скоро появится!')} className="p-2 hover:bg-gray-800 rounded-lg border border-purple-500/30 relative">
                        <Icon name="users" className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                    </button>
                    <button onClick={() => alert('Настройки профиля скоро появятся!')} className="p-2 hover:bg-gray-800 rounded-lg border border-purple-500/30">
                        <Icon name="settings" className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                    </button>
                    <button onClick={handleLogout} className="p-2 hover:bg-red-900/50 rounded-lg border border-red-500/30">
                        <Icon name="logout" className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                    </button>
                </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6 space-y-8">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
            <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg transition-all border border-purple-500/30">
                <Icon name="search" className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 font-semibold text-sm md:text-base">Поиск фильмов/сериалов</span>
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white px-2">Фильмы</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" onDragOver={onDragOver}>
                    <div onDrop={(e) => onDrop(e, 'movie:wishlist')} onDragEnter={onDragEnterColumn} onDragLeave={onDragLeaveColumn}><Column title="Хочу посмотреть" emoji="🎬" items={movies.wishlist} onSelect={setSelectedMedia} onRemove={removeItem} onDragStart={onDragStart} onDragEnd={onDragEnd} /></div>
                    <div onDrop={(e) => onDrop(e, 'movie:watched')} onDragEnter={onDragEnterColumn} onDragLeave={onDragLeaveColumn}><Column title="Посмотрел" emoji="🍿" items={movies.watched} onSelect={setSelectedMedia} onRemove={removeItem} onDragStart={onDragStart} onDragEnd={onDragEnd} /></div>
                </div>
            </div>
             <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white px-2">Сериалы</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" onDragOver={onDragOver}>
                    <div onDrop={(e) => onDrop(e, 'tv:wishlist')} onDragEnter={onDragEnterColumn} onDragLeave={onDragLeaveColumn}><Column title="Хочу посмотреть" emoji="📺" items={tv.wishlist} onSelect={setSelectedMedia} onRemove={removeItem} onDragStart={onDragStart} onDragEnd={onDragEnd} /></div>
                    <div onDrop={(e) => onDrop(e, 'tv:watched')} onDragEnter={onDragEnterColumn} onDragLeave={onDragLeaveColumn}><Column title="Посмотрел" emoji="✅" items={tv.watched} onSelect={setSelectedMedia} onRemove={removeItem} onDragStart={onDragStart} onDragEnd={onDragEnd} /></div>
                </div>
            </div>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Активность друзей</h3>
            <p className="text-gray-400">Лента активности по фильмам и сериалам скоро появится здесь!</p>
        </div>

      </main>

      {showSearch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-2xl border border-purple-500/30 p-4 z-50 w-full max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <input type="text" value={query} onChange={e => handleSearch(e.target.value)} placeholder="Поиск TMDB..." className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm" autoFocus />
              <select className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white" value={type} onChange={e => {setType(e.target.value); handleSearch(query)}}>
                <option value="movie">Фильмы</option>
                <option value="tv">Сериалы</option>
              </select>
              <button onClick={() => { setShowSearch(false); setQuery(''); setSearchResults([]); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <Icon name="x" className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {searching ? (
                <div className="flex items-center justify-center py-8"><Icon name="loader" className="w-6 h-6 text-purple-400" /></div>
              ) : searchResults.length > 0 ? (
                searchResults.map(it => (
                  <div key={`${it.mediaType}-${it.tmdbId}`} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg">
                    <img src={it.poster || 'https://placehold.co/40x56/1f2937/ffffff?text=?'} alt={it.title} className="w-10 h-14 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{it.title} ({it.year})</p>
                      <p className="text-xs text-gray-400 truncate">{it.overview}</p>
                    </div>
                    <button onClick={() => addItem(it, 'wishlist')} className="p-2 bg-purple-500/80 hover:bg-purple-500 rounded-lg"><Icon name="plus" className="w-5 h-5 text-white" /></button>
                  </div>
                ))
              ) : query.length >= 2 && <p className="text-gray-400 text-center py-4 text-sm">Ничего не найдено</p>}
            </div>
          </div>
        </div>
      )}

      <MediaDetailsModal item={selectedMedia} onClose={() => setSelectedMedia(null)} onUpdate={updateItem} onReact={reactToItem}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MovieApp />);

