const { useState, useEffect, useRef, Fragment, useCallback } = React;

// --- Глобальные константы и хелперы ---
const API_URL = 'https://gametracker-backend-production.up.railway.app';
const REACTION_EMOJIS = ['😍', '🔥', '👍', '😮', '😂', '👎', '❤️', '🤔', '😢', '🤯'];
const MEDIA_PER_COLUMN = 5;

// Функция группировки реакций
const groupReactions = (reactions) => {
  if (!reactions || reactions.length === 0) return {};
  return reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});
};

// --- Переиспользуемые UI-компоненты (идентичны странице игр) ---

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
    chevronUp: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>,
    chevronDown: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
    menu: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    moreVertical: <svg className={className} fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>,
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

function MediaCard({ item, onSelect, onRemove, onDragStart, onDragEnd, isViewingFriend, boardId, onMobileClick, boardKey }) {
  const type = item.media_type || 'movie'; // Определяем тип медиа
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div
      draggable={!isViewingFriend}
      onDragStart={(e) => !isViewingFriend && onDragStart(e, item)}
      onDragEnd={onDragEnd}
      onClick={() => {
        if (isMobile && onMobileClick) {
          onMobileClick(item, boardKey);
        } else {
          onSelect(item);
        }
      }}
          className="bg-gray-800/80 rounded-xl border border-gray-700 hover:border-purple-500 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex gap-3 p-2 group relative elevation-1 hover:elevation-2 shadow-transition media-card"
    >
      {/* Цветная полоска слева */}
      <div 
        className="w-1 rounded-l-xl flex-shrink-0" 
        style={{ backgroundColor: boardId === 'wishlist' ? '#3B82F6' : '#10B981' }}
      ></div>
      <div className="relative flex-shrink-0">
        <img src={item.poster || 'https://placehold.co/96x128/1f2937/ffffff?text=?'} alt={item.title} className="w-20 h-28 md:w-16 md:h-24 object-cover rounded-lg flex-shrink-0" />
        {/* Рейтинг звездами как overlay */}
        {item.rating && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex gap-0.5">
            {[...Array(5)].map((_, i) => (<Icon key={i} name="star" className={`w-2 h-2 ${i < item.rating ? 'text-yellow-400' : 'text-gray-400'}`} />))}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between flex-grow min-w-0 py-1">
        <div>
          <h3 className="text-white font-semibold text-base md:text-sm line-clamp-2">{item.title}</h3>
        </div>
        {item.reactions && item.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap items-center">
            {Object.entries(groupReactions(item.reactions)).map(([emoji, count]) => (
              <span key={emoji} className="text-base">
                {emoji}{count > 1 && <span className="text-xs text-gray-400">×{count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
       {!isViewingFriend && (
            <button onClick={(e) => onRemove(e, item)} className="absolute top-1 right-1 p-1.5 bg-red-600/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity self-start flex-shrink-0 z-10">
                <Icon name="trash" className="w-3 h-3 text-white" />
            </button>
       )}

    </div>
  );
}

function Column({ title, emoji, items, columnKey, isExpanded, onToggleExpand, isViewingFriend, ...handlers }) {
  // Определяем boardId на основе columnKey
  const boardId = columnKey.includes('wishlist') ? 'wishlist' : 'watched';
  const visibleItems = isExpanded ? items : items.slice(0, MEDIA_PER_COLUMN);
  const [isMobileAccordionOpen, setIsMobileAccordionOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
    
  return (
    <div className={`bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30 flex flex-col h-full elevation-1 board-column accordion-column ${isMobile && isMobileAccordionOpen ? 'expanded' : 'collapsed'}`}>
        <div 
          className="flex items-center justify-between mb-4 accordion-header" 
          onClick={() => isMobile && setIsMobileAccordionOpen(!isMobileAccordionOpen)}
        >
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 tracking-wide whitespace-nowrap">
                <span className="text-xl">{emoji}</span>
                <span>{title}</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 text-white px-2 py-1 rounded-full text-xs font-bold">{items.length}</span>
              {isMobile && (
                <Icon name={isMobileAccordionOpen ? 'chevronUp' : 'chevronDown'} className="w-4 h-4 text-purple-400" />
              )}
            </div>
        </div>
        <div className="accordion-content">
          <div className="space-y-2 flex-grow min-h-[150px]">
              {visibleItems.map(it => <MediaCard key={it.id} item={it} isViewingFriend={isViewingFriend} boardId={boardId} boardKey={columnKey} onMobileClick={handlers.onMobileClick} {...handlers} />)}
          </div>
          {items.length > MEDIA_PER_COLUMN && (
            <button onClick={() => onToggleExpand(columnKey)} className="w-full text-center mt-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg flex items-center justify-center gap-1">
              {isExpanded ? 'Свернуть' : `Показать еще ${items.length - MEDIA_PER_COLUMN}`}
              <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} className="w-3 h-3" />
            </button>
          )}
        </div>
    </div>
  );
}

function MediaDetailsModal({ item, onClose, onUpdate, onReact, isViewingFriend, user }) {
  if (!item) return null;
  const userReaction = (item.reactions || []).find(r => r.user_id === user?.id);
  const modalRef = useRef(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    const currentTouch = e.touches[0].clientY;
    const offset = currentTouch - touchStart;
    if (offset > 0) {
      setTouchOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    if (touchOffset > 100) {
      onClose();
    }
    setTouchOffset(0);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] md:p-4" onClick={onClose}>
      <div 
        ref={modalRef}
        className={`bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-purple-500/30 max-h-[90vh] overflow-y-auto elevation-3 ${isMobile ? 'mobile-fullscreen-modal' : ''}`}
        style={isMobile ? { transform: `translateY(${touchOffset}px)`, transition: touchOffset === 0 ? 'transform 0.3s ease' : 'none' } : {}}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isMobile && <div className="swipe-indicator"></div>}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{item.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg"><Icon name="x" className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          {!isViewingFriend ? (
              <Fragment>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Рейтинг:</p>
                    <StarRating value={item.rating || 0} onChange={val => onUpdate(item, { rating: val })} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Отзыв:</label>
                    <textarea defaultValue={item.review || ''} onBlur={(e) => onUpdate(item, { review: e.target.value })} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white mt-1" rows="4" placeholder="Ваши впечатления..."/>
                  </div>
              </Fragment>
          ) : (
             <Fragment>
                {item.rating && <div><p className="text-gray-400 text-sm mb-2">Рейтинг от {item.owner.username}:</p><div className="flex gap-1">{[...Array(5)].map((_, i) => (<Icon key={i} name="star" className={`w-6 h-6 ${i < item.rating ? 'text-yellow-400' : 'text-gray-600'}`} />))}</div></div>}
                {item.review && <div><p className="text-gray-400 text-sm mb-1">Отзыв от {item.owner.username}:</p><p className="text-white bg-gray-800 p-3 rounded-lg border border-gray-700">{item.review}</p></div>}
                {!item.rating && !item.review && <p className="text-gray-400 italic">Пользователь не оставил отзыва.</p>}
             </Fragment>
          )}

          <div>
            <p className="text-gray-400 text-sm mb-2">Ваша реакция:</p>
            <div className="flex flex-wrap gap-2">
              {REACTION_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => onReact(item, emoji)} className={`text-2xl transform hover:scale-125 transition-transform p-1 rounded-full ${userReaction?.emoji === emoji ? 'bg-purple-500/30' : ''}`}>
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
                  <div key={idx} className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full" title={reaction.username}>
                     <Avatar src={reaction.avatar} size="sm" className="w-5 h-5" />
                    <span className="text-xl">{reaction.emoji}</span>
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

function ActivityFeed({ token, boardType = 'media', onNavigateToUser }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/friends/activity?type=${boardType}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setActivities(data.activities);
                }
            } catch (err) {
                console.error("Failed to fetch activities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
        const interval = setInterval(fetchActivities, 60000);
        return () => clearInterval(interval);
    }, [token]);
    
    const boardTitles = { wishlist: 'Хочу посмотреть', watched: 'Посмотрел' };
    const mediaTypes = { movie: 'фильм', tv: 'сериал'};

    const formatActivity = (act) => {
        const { username, action_type, details, user_id } = act;
        const mediaName = <span className="font-bold text-purple-300">{details.title}</span>;
        const mediaType = mediaTypes[details.mediaType] || 'медиа';
        const clickableUsername = (
            <button 
                onClick={() => onNavigateToUser && onNavigateToUser(user_id)}
                className="text-blue-400 hover:text-blue-300 underline cursor-pointer font-semibold"
            >
                {username}
            </button>
        );
        
        switch (action_type) {
            case 'add_media':
                return <>{clickableUsername} добавил {mediaType} {mediaName} в <span className="italic">{boardTitles[details.board]}</span></>;
            case 'complete_media':
                return <><span className="text-green-400 font-semibold">{clickableUsername}</span> посмотрел {mediaType} {mediaName}! 🎉</>;
            case 'move_media':
                return <>{clickableUsername} вернул {mediaType} {mediaName} в <span className="italic">"{boardTitles.wishlist}"</span></>;
             case 'remove_media':
                return <>{clickableUsername} удалил {mediaName}</>;
            default:
                return <>{clickableUsername} {action_type}</>;
        }
    };
    
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Активность друзей</h3>
            {loading ? (
                <div className="w-full flex items-center justify-center p-10"><Icon name="loader" className="w-8 h-8 text-purple-400"/></div>
            ) : activities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activities.map(act => (
                        <div key={act.id} className="text-sm text-gray-300 p-4 bg-gray-800/80 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
                            <p>{formatActivity(act)}</p>
                            <div className="text-xs text-gray-500 mt-2 text-right">{new Date(act.created_at).toLocaleString('ru-RU')}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-center">Пока нет активности от ваших друзей.</p>
            )}
        </div>
    );
};


// --- Главный компонент приложения ---

function MovieApp() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState({ 
    movies: { 
      wishlist: [], 
      watched: [],
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      accentColor: '#3B82F6'
    }, 
    tv: { 
      wishlist: [], 
      watched: [],
      color: 'from-orange-500/20 to-amber-500/20',
      borderColor: 'border-orange-500/30',
      accentColor: '#F59E0B'
    } 
  });
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [theme, setTheme] = useState('default');
  const [viewingUser, setViewingUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserHub, setShowUserHub] = useState(false);
  const dragItem = useRef(null);
  const [expandedColumns, setExpandedColumns] = useState({});
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [friendshipStatus, setFriendshipStatus] = useState('none');
  const [showMobileActionMenu, setShowMobileActionMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userNickname, setUserNickname] = useState('');
  const [confirmingAddFriend, setConfirmingAddFriend] = useState(null);
  const [confirmingDeleteFriend, setConfirmingDeleteFriend] = useState(null);
  const [profileData, setProfileData] = useState({ username: '', bio: '', currentPassword: '', newPassword: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem('token');
  
  const loadBoards = useCallback(async (userId = null) => {
    if (!token) return;
    try {
      const url = userId ? `${API_URL}/api/user/${userId}/media/boards` : `${API_URL}/api/user/media/boards`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      
      if (userId) {
        setViewingUser(data.user);
        setFriendshipStatus(data.friendship || 'none');
        setUserNickname(data.nickname || '');
      } else {
        setViewingUser(null);
        setFriendshipStatus('none');
        setUserNickname('');
      }
      
      if (res.ok && data.boards) {
        setBoards(data.boards);
      } else {
        if(res.status === 401 || res.status === 403) handleLogout();
      }
    } catch (err) {
      console.error("Ошибка загрузки досок:", err);
    }
  }, [token]);

  const loadFriends = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/friends`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
        setFriendRequests(data.requests || []);
        setSentRequests(data.sentRequests || []);
      }
    } catch (err) { console.error('Ошибка загрузки друзей:', err); }
  }, [token]);
  
  const loadAllUsers = useCallback(async (query = '') => {
      const url = query ? `${API_URL}/api/users?q=${encodeURIComponent(query)}` : `${API_URL}/api/users`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
          const data = await response.json();
          setAllUsers(data.users || []);
      }
  }, [token]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setTheme(parsedUser.theme || 'default');
        setProfileData({ username: parsedUser.username || '', bio: parsedUser.bio || '', currentPassword: '', newPassword: '' });
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
    await loadBoards(viewingUser?.id);
    setSelectedMedia(prev => (prev && prev.id === item.id) ? { ...prev, ...updates } : prev);
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
    await loadBoards(viewingUser?.id);
    try {
      const res = await fetch(`${API_URL}/api/user/media/boards`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.boards) return;
      const allItems = [
        ...(data.boards.movies?.wishlist || []),
        ...(data.boards.movies?.watched || []),
        ...(data.boards.tv?.wishlist || []),
        ...(data.boards.tv?.watched || [])
      ];
      const updatedItem = allItems.find(i => i.id === item.id);
      if (updatedItem) {
        setSelectedMedia(prev => (prev && prev.id === item.id) ? updatedItem : prev);
      }
    } catch (e) {
      // swallow; non-critical UI update
      console.error(e);
    }
  };

  const friendAction = async (friendId, action) => {
    try {
      if (action === 'request') {
        await fetch(`${API_URL}/api/friends/request`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ friendId }) });
      } else if (action === 'accept') {
        await fetch(`${API_URL}/api/friends/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ friendId }) });
      } else if (action === 'reject') {
        await fetch(`${API_URL}/api/friends/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ friendId }) });
      } else if (action === 'delete') {
        await fetch(`${API_URL}/api/friends/${friendId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      }
      await loadFriends();
      if (viewingUser && viewingUser.id === friendId) await loadBoards(friendId);
    } catch (err) {
      console.error('Ошибка действия с другом:', err);
    } finally {
      setConfirmingAddFriend(null);
      setConfirmingDeleteFriend(null);
    }
  };

  const updateNickname = async (friendId, nickname) => {
    try {
      await fetch(`${API_URL}/api/friends/${friendId}/nickname`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ nickname }) });
      await loadFriends();
    } catch (e) { console.error('Ошибка изменения метки:', e); }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploadingAvatar(true);
        const res = await fetch(`${API_URL}/api/profile/avatar`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ avatar: reader.result }) });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
      } catch (err) { console.error('Ошибка загрузки аватара:', err); }
      finally { setUploadingAvatar(false); }
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ username: profileData.username, bio: profileData.bio, theme, currentPassword: profileData.currentPassword, newPassword: profileData.newPassword }) });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setTheme(data.user.theme || 'default');
        setShowProfile(false);
      }
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/index.html';
  };
  
  const onDragStart = (e, item) => {
    if(viewingUser) return;
    dragItem.current = { item };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    setTimeout(() => {
      e.currentTarget.classList.add('dragging-card');
    }, 0);
  };
  
  const onDragEnd = (e) => {
    document.querySelectorAll('.dragging-card').forEach(el => el.classList.remove('dragging-card'));
    dragItem.current = null;
    document.querySelectorAll('.drag-over-column').forEach(el => el.classList.remove('drag-over-column'));
  };

  const toggleColumnExpansion = (columnKey) => {
    setExpandedColumns(prev => ({...prev, [columnKey]: !prev[columnKey]}));
  };

  // Обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Функции для мобильного меню действий
  const handleMobileCardClick = (item, boardKey) => {
    if (!isMobile || viewingUser) return;
    setSelectedCard({...item, boardKey});
    setShowMobileActionMenu(true);
  };

  const closeMobileActionMenu = () => {
    setShowMobileActionMenu(false);
    setShowMoveMenu(false);
    setSelectedCard(null);
  };

  const handleMoveToBoard = (targetBoardKey) => {
    if (selectedCard && targetBoardKey !== selectedCard.boardKey) {
      // TODO: Реализовать перемещение медиа
      console.log(`Moving ${selectedCard.title} to board ${targetBoardKey}`);
      closeMobileActionMenu();
    }
  };

  const openEditModal = () => {
    setShowMobileActionMenu(false);
    setSelectedMedia(selectedCard);
  };

  const onDragOver = (e) => e.preventDefault();
  const onDragEnterColumn = (e) => e.currentTarget.classList.add('drag-over-column');
  const onDragLeaveColumn = (e) => e.currentTarget.classList.remove('drag-over-column');
  
  const onDrop = async (e, targetColumnKey) => {
    e.preventDefault();
    if (!dragItem.current || viewingUser) return;
    
    const { item } = dragItem.current;
    const [targetMedia, targetBoard] = targetColumnKey.split(':');

    if (item.mediaType !== targetMedia) return;
    if (item.board === targetBoard) return;
    
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
              <a href="/index.html" className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 active:scale-95 transition-transform cursor-pointer">🎮 GameTracker</a>
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
                        <Avatar src={viewingUser ? viewingUser.avatar : user.avatar} size="sm" />
                        <span className="text-white font-semibold text-sm md:text-base block">{viewingUser ? (userNickname || viewingUser.username) : user.username}</span>
                        {viewingUser && userNickname && <span className="text-xs text-gray-400">@{viewingUser.username}</span>}
                    </div>
                    {viewingUser ? (
                       <Fragment>
                         {friendshipStatus === 'friends' && (
                           <button onClick={() => setConfirmingDeleteFriend(viewingUser)} className="p-2 bg-blue-500/20 hover:bg-red-500/20 rounded-lg border border-blue-500/30 hover:border-red-500/30"><Icon name="userCheck" className="w-4 h-4 md:w-5 md:h-5 text-green-400" /></button>
                         )}
                         {friendshipStatus === 'request_sent' && (
                           <button onClick={() => friendAction(viewingUser.id, 'reject')} className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30"><Icon name="userClock" className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" /></button>
                         )}
                         {friendshipStatus === 'request_received' && (
                           <div className="flex gap-2">
                             <button onClick={() => setConfirmingAddFriend(viewingUser)} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500/30"><Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-green-400" /></button>
                             <button onClick={() => friendAction(viewingUser.id, 'reject')} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30"><Icon name="x" className="w-4 h-4 md:w-5 md:h-5 text-red-400" /></button>
                           </div>
                         )}
                         {friendshipStatus === 'none' && (
                           <button onClick={() => friendAction(viewingUser.id, 'request')} className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30"><Icon name="userPlus" className="w-4 h-4 md:w-5 md:h-5 text-purple-400" /></button>
                         )}
                         <button onClick={() => { setViewingUser(null); loadBoards(); }} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700">
                           <Icon name="x" className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                         </button>
                       </Fragment>
                    ) : (
                       <Fragment>
                           <button onClick={() => { setShowUserHub(true); loadAllUsers(); }} className="p-2 hover:bg-gray-800 rounded-lg border border-purple-500/30 relative">
                               <Icon name="users" className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                               {friendRequests.length > 0 && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                           </button>
                           <button onClick={() => setShowProfile(true)} className="p-2 hover:bg-gray-800 rounded-lg border border-purple-500/30">
                               <Icon name="settings" className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                           </button>
                       </Fragment>
                    )}
                    <button onClick={handleLogout} className="p-2 hover:bg-red-900/50 rounded-lg border border-red-500/30">
                        <Icon name="logout" className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                    </button>
                </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6 space-y-8">
        {!viewingUser && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
                <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg transition-all border border-purple-500/30">
                    <Icon name="search" className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300 font-semibold text-sm md:text-base">Поиск фильмов/сериалов</span>
                </button>
            </div>
        )}
        
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="hidden lg:block absolute left-1/2 -ml-px top-0 h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent w-px"></div>
            
            {/* Desktop: 4 columns side by side, Tablet: 2x2 grid, Mobile: 1 column stack */}
            <div className="md:col-span-2 lg:col-span-1" onDrop={(e) => onDrop(e, 'movie:wishlist')} onDragEnter={onDragEnterColumn} onDragLeave={onDragLeaveColumn}>
                <Column title="🎬 Хочу посмотреть" emoji="" items={movies.wishlist} columnKey="movie:wishlist" isExpanded={!!expandedColumns['movie:wishlist']} onToggleExpand={toggleColumnExpansion} onSelect={setSelectedMedia} onRemove={removeItem} onDragStart={onDragStart} onDragEnd={onDragEnd} onMobileClick={handleMobileCardClick} isViewingFriend={!!viewingUser} />
            </div>
            <div className="md:col-span-2 lg:col-span-1" onDrop={(e) => onDrop(e, 'movie:watched')} onDragEnter={onDragEnterColumn} onDragLeave={onDragLeaveColumn}>
                <Column title="🍿 Посмотрел" emoji="" items={movies.watched} columnKey="movie:watched" isExpanded={!!expandedColumns['movie:watched']} onToggleExpand={toggleColumnExpansion} onSelect={setSelectedMedia} onRemove={removeItem} onDragStart={onDragStart} onDragEnd={onDragEnd} onMobileClick={handleMobileCardClick} isViewingFriend={!!viewingUser} />
            </div>
            <div className="md:col-span-2 lg:col-span-1" onDrop={(e) => onDrop(e, 'tv:wishlist')} onDragEnter={onDragEnterColumn} onDragLeave={onDragLeaveColumn}>
                <Column title="📺 Хочу посмотреть" emoji="" items={tv.wishlist} columnKey="tv:wishlist" isExpanded={!!expandedColumns['tv:wishlist']} onToggleExpand={toggleColumnExpansion} onSelect={setSelectedMedia} onRemove={removeItem} onDragStart={onDragStart} onDragEnd={onDragEnd} onMobileClick={handleMobileCardClick} isViewingFriend={!!viewingUser} />
            </div>
            <div className="md:col-span-2 lg:col-span-1" onDrop={(e) => onDrop(e, 'tv:watched')} onDragEnter={onDragEnterColumn} onDragLeave={onDragLeaveColumn}>
                <Column title="✅ Посмотрел" emoji="" items={tv.watched} columnKey="tv:watched" isExpanded={!!expandedColumns['tv:watched']} onToggleExpand={toggleColumnExpansion} onSelect={setSelectedMedia} onRemove={removeItem} onDragStart={onDragStart} onDragEnd={onDragEnd} onMobileClick={handleMobileCardClick} isViewingFriend={!!viewingUser} />
            </div>
        </div>
        
        {!viewingUser && <ActivityFeed 
          token={token} 
          boardType="media" 
          onNavigateToUser={(userId) => {
            console.log('Navigating to user:', userId);
            loadBoards(userId);
          }}
        />}

      </main>

      {showProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setShowProfile(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-purple-500/30 max-h-[90vh] overflow-y-auto elevation-3" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-4">Настройки профиля</h2>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <Avatar src={user?.avatar} size="xl" />
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all disabled:opacity-50">
                  {uploadingAvatar ? <Icon name="loader" className="w-4 h-4" /> : <Icon name="upload" className="w-4 h-4" />} {uploadingAvatar ? 'Загрузка...' : 'Загрузить аватар'}
                </button>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Имя пользователя:</label>
                <input type="text" value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} placeholder={user?.username} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white mt-1" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">О себе:</label>
                <textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} placeholder={user?.bio || 'Расскажи о себе...'} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white mt-1" rows="3" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Тема оформления:</label>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setTheme('default')} className={`flex-1 py-2 rounded-lg text-sm ${theme === 'default' ? 'bg-purple-500 text-white' : 'bg-gray-800'}`}>Стандартная</button>
                  <button onClick={() => setTheme('liquid-eye')} className={`flex-1 py-2 rounded-lg text-sm ${theme === 'liquid-eye' ? 'bg-white text-black' : 'bg-gray-800'}`}>Liquid Eye</button>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Текущий пароль (для изменения):</label>
                <input type="password" value={profileData.currentPassword} onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white mt-1" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Новый пароль:</label>
                <input type="password" value={profileData.newPassword} onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white mt-1" />
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={updateProfile} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600">Сохранить</button>
                <button onClick={() => setShowProfile(false)} className="flex-1 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserHub && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setShowUserHub(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-3xl border border-purple-500/30 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">Сообщество</h2>
              <button onClick={() => setShowUserHub(false)} className="p-2 hover:bg-gray-800 rounded-lg"><Icon name="x" className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto">
              {friendRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Запросы в друзья ({friendRequests.length})</h3>
                  <div className="space-y-3">
                    {friendRequests.map(req => (
                      <div key={req.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Avatar src={req.avatar} size="md" />
                        <div className="flex-1 cursor-pointer" onClick={() => { loadBoards(req.id); setShowUserHub(false); }}>
                          <p className="text-white font-semibold">{req.username}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmingAddFriend(req)} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg"><Icon name="check" className="w-5 h-5 text-green-400" /></button>
                          <button onClick={() => friendAction(req.id, 'reject')} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><Icon name="x" className="w-5 h-5 text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {friends.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Мои друзья ({friends.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {friends.map(friend => (
                      <div key={friend.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg group">
                        <Avatar src={friend.avatar} size="md" />
                        <div className="flex-1 cursor-pointer" onClick={() => { loadBoards(friend.id); setShowUserHub(false); }}>
                          <p className="text-white font-semibold">{friend.nickname || friend.username}</p>
                          {friend.nickname && <p className="text-xs text-gray-400">@{friend.username}</p>}
                        </div>
                        <button onClick={() => setConfirmingDeleteFriend(friend)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="x" className="w-5 h-5 text-red-400" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Все пользователи</h3>
                <input type="text" value={userSearchQuery} onChange={(e) => { setUserSearchQuery(e.target.value); loadAllUsers(e.target.value); }} placeholder="Поиск пользователей..." className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allUsers.map(u => {
                    const isFriend = friends.some(f => f.id === u.id);
                    const isRequestReceived = friendRequests.some(r => r.id === u.id);
                    const isRequestSent = sentRequests.includes(u.id);
                    return (
                      <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Avatar src={u.avatar} size="md" />
                        <div className="flex-1 cursor-pointer" onClick={() => { loadBoards(u.id); setShowUserHub(false); }}>
                          <p className="text-white font-semibold">{u.username}</p>
                        </div>
                        {isFriend ? (
                          <button onClick={() => setConfirmingDeleteFriend(u)} className="p-2 bg-green-500/20 hover:bg-red-500/20 rounded-lg transition-all"><Icon name="userCheck" className="w-5 h-5 text-green-400" /></button>
                        ) : isRequestReceived ? (
                          <div className="flex gap-2">
                            <button onClick={() => setConfirmingAddFriend(u)} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg"><Icon name="check" className="w-5 h-5 text-green-400" /></button>
                            <button onClick={() => friendAction(u.id, 'reject')} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><Icon name="x" className="w-5 h-5 text-red-400" /></button>
                          </div>
                        ) : isRequestSent ? (
                          <button onClick={() => friendAction(u.id, 'reject')} className="p-2 bg-yellow-500/20 hover:bg-red-500/20 rounded-lg"><Icon name="userClock" className="w-5 h-5 text-yellow-400" /></button>
                        ) : (
                          <button onClick={() => friendAction(u.id, 'request')} className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg"><Icon name="userPlus" className="w-5 h-5 text-purple-400" /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmingAddFriend && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4" onClick={() => setConfirmingAddFriend(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-purple-500/30 elevation-3" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Добавить в друзья {confirmingAddFriend.username}?</h2>
            <div className="flex gap-2">
              <button onClick={() => friendAction(confirmingAddFriend.id, 'accept')} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Добавить</button>
              <button onClick={() => setConfirmingAddFriend(null)} className="flex-1 py-2 bg-gray-800 text-white rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {confirmingDeleteFriend && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4" onClick={() => setConfirmingDeleteFriend(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-purple-500/30 elevation-3" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Удалить из друзей {confirmingDeleteFriend.username}?</h2>
            <div className="flex gap-2">
              <button onClick={() => friendAction(confirmingDeleteFriend.id, 'delete')} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Удалить</button>
              <button onClick={() => setConfirmingDeleteFriend(null)} className="flex-1 py-2 bg-gray-800 text-white rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

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

      <MediaDetailsModal item={selectedMedia} onClose={() => setSelectedMedia(null)} onUpdate={updateItem} onReact={reactToItem} isViewingFriend={!!viewingUser} user={user}/>
      {/* Мобильное меню выбора действия */}
      {showMobileActionMenu && selectedCard && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-40"
            onClick={closeMobileActionMenu}
          />
          
          {/* Action Menu */}
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl z-50 p-6 transform transition-transform">
            {/* Handle (полоска для drag) */}
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>
            
            {/* Название медиа */}
            <h3 className="text-white font-bold text-lg mb-4 text-center">
              {selectedCard.title}
            </h3>
            
            {/* Действия */}
            <div className="space-y-3">
              <button 
                onClick={openEditModal}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  ✏️
                </div>
                <div>
                  <p className="font-semibold">Редактировать</p>
                  <p className="text-sm text-gray-400">Поставить рейтинг, написать отзыв</p>
                </div>
              </button>
              
              <button 
                onClick={() => {setShowMoveMenu(true); setShowMobileActionMenu(false);}}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  ➡️
                </div>
                <div>
                  <p className="font-semibold">Переместить</p>
                  <p className="text-sm text-gray-400">Изменить статус просмотра</p>
                </div>
              </button>
              
              <button 
                onClick={closeMobileActionMenu}
                className="w-full py-3 text-gray-400 hover:text-white"
              >
                Отмена
              </button>
            </div>
          </div>
        </>
      )}

      {/* Меню выбора колонки для перемещения */}
      {showMoveMenu && selectedCard && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => {setShowMoveMenu(false); setSelectedCard(null);}}
          />
          
          {/* Move Menu */}
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl z-50 p-6 transform transition-transform">
            {/* Handle */}
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>
            
            <h3 className="text-white font-bold text-lg mb-4 text-center">
              Переместить "{selectedCard.title}"
            </h3>
            
            <div className="space-y-2">
              {/* Фильмы */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-semibold">🎬 ФИЛЬМЫ</p>
                <button 
                  onClick={() => handleMoveToBoard('movie:wishlist')}
                  disabled={selectedCard.boardKey === 'movie:wishlist'}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border transition-colors ${
                    selectedCard.boardKey === 'movie:wishlist' 
                      ? 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed' 
                      : 'text-white hover:bg-gray-800 border-gray-700'
                  }`}
                >
                  <span className="text-2xl">🎬</span>
                  <div>
                    <p className="font-semibold">Хочу посмотреть</p>
                    <p className="text-sm text-gray-400">{boards.movies.wishlist.length} фильмов</p>
                  </div>
                  {selectedCard.boardKey === 'movie:wishlist' && (
                    <span className="ml-auto text-xs bg-gray-600 px-2 py-1 rounded">Текущая</span>
                  )}
                </button>
                <button 
                  onClick={() => handleMoveToBoard('movie:watched')}
                  disabled={selectedCard.boardKey === 'movie:watched'}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border transition-colors ${
                    selectedCard.boardKey === 'movie:watched' 
                      ? 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed' 
                      : 'text-white hover:bg-gray-800 border-gray-700'
                  }`}
                >
                  <span className="text-2xl">🍿</span>
                  <div>
                    <p className="font-semibold">Посмотрел</p>
                    <p className="text-sm text-gray-400">{boards.movies.watched.length} фильмов</p>
                  </div>
                  {selectedCard.boardKey === 'movie:watched' && (
                    <span className="ml-auto text-xs bg-gray-600 px-2 py-1 rounded">Текущая</span>
                  )}
                </button>
              </div>

              {/* Сериалы */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-semibold">📺 СЕРИАЛЫ</p>
                <button 
                  onClick={() => handleMoveToBoard('tv:wishlist')}
                  disabled={selectedCard.boardKey === 'tv:wishlist'}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border transition-colors ${
                    selectedCard.boardKey === 'tv:wishlist' 
                      ? 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed' 
                      : 'text-white hover:bg-gray-800 border-gray-700'
                  }`}
                >
                  <span className="text-2xl">📺</span>
                  <div>
                    <p className="font-semibold">Хочу посмотреть</p>
                    <p className="text-sm text-gray-400">{boards.tv.wishlist.length} сериалов</p>
                  </div>
                  {selectedCard.boardKey === 'tv:wishlist' && (
                    <span className="ml-auto text-xs bg-gray-600 px-2 py-1 rounded">Текущая</span>
                  )}
                </button>
                <button 
                  onClick={() => handleMoveToBoard('tv:watched')}
                  disabled={selectedCard.boardKey === 'tv:watched'}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border transition-colors ${
                    selectedCard.boardKey === 'tv:watched' 
                      ? 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed' 
                      : 'text-white hover:bg-gray-800 border-gray-700'
                  }`}
                >
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold">Посмотрел</p>
                    <p className="text-sm text-gray-400">{boards.tv.watched.length} сериалов</p>
                  </div>
                  {selectedCard.boardKey === 'tv:watched' && (
                    <span className="ml-auto text-xs bg-gray-600 px-2 py-1 rounded">Текущая</span>
                  )}
                </button>
              </div>
              
              <button 
                onClick={() => {setShowMoveMenu(false); setSelectedCard(null);}}
                className="w-full py-3 text-gray-400 hover:text-white mt-4"
              >
                Отмена
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MovieApp />);

