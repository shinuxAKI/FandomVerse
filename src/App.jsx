import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const categories = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga']

const categoryInfo = {
  Anime: { accent: '#d26bff', description: 'Hand-drawn worlds, impossible stakes.', hero: './assets/home-anime.jpg', genres: ['Action', 'Adventure', 'Comedy', 'Dark Fantasy', 'Drama', 'Fantasy', 'Film', 'Historical', 'Mystery', 'Noir', 'Sci-Fi', 'Shonen', 'Space Western', 'Supernatural', 'Thriller', 'Romance'] },
  Manga: { accent: '#aab2c0', description: 'Panels, pages, and worlds that stay with you.', hero: './assets/home-manga.jpg', genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Shonen'] },
  Comics: { accent: '#ff7aa8', description: 'Heroes, antiheroes, and stories in every shade.', hero: './assets/home-comics.jpg', genres: ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Sci-Fi'] },
  Gaming: { accent: '#62d7b1', description: 'Worlds to play, explore, master, and remember.', hero: './assets/home-gaming.jpg', genres: ['Action', 'Adventure', 'RPG', 'Strategy', 'Indie', 'Horror', 'Racing', 'Sports', 'Simulation'] },
  Movies: { accent: '#e6b354', description: 'Frames, soundtracks, and worlds on the big screen.', hero: './assets/home-movies.jpg', genres: ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'] },
  'TV Shows': { accent: '#65b9e8', description: 'Stories built for the next episode.', hero: './assets/home-tv.jpg', genres: ['Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Mystery', 'Post-Apocalyptic', 'Sci-Fi', 'Surreal', 'Thriller'] },
  'K-Pop': { accent: '#ea73b5', description: 'Artists, eras, stages, and songs on repeat.', hero: './assets/home-kpop.jpg', genres: ['Girl Group', 'Boy Group', 'Solo', 'R&B', 'Hip-Hop', 'Ballad', 'Dance', 'Rookie'] },
}

const imageMap = {
  Anime: ['./assets/anime-fmab.jpg', './assets/anime-aot.jpg', './assets/anime-steins.jpg', './assets/anime-cowboy.jpg', './assets/anime-spirited.jpg', './assets/anime-vinland.jpg', './assets/anime-dm.jpg', './assets/anime-jujutsu.jpg', './assets/anime-onepunch.jpg', './assets/anime-jjk.jpg'],
  'TV Shows': ['./assets/tv-arcane.jpg', './assets/tv-bcs.jpg', './assets/tv-breakingbad.jpg', './assets/tv-chernobyl.jpg', './assets/tv-fleabag.jpg', './assets/tv-severance.jpg', './assets/tv-stranger.jpg', './assets/tv-lastofus.jpg', './assets/tv-wire.jpg', './assets/tv-twinpeaks.jpg'],
  'K-Pop': ['./assets/kpop-a.jpg', './assets/kpop-b.jpg', './assets/kpop-c.jpg', './assets/kpop-a.jpg', './assets/kpop-b.jpg', './assets/kpop-c.jpg'],
  Manga: ['./assets/anime-aot.jpg', './assets/anime-vinland.jpg', './assets/anime-onepunch.jpg', './assets/anime-jjk.jpg', './assets/anime-fmab.jpg', './assets/anime-steins.jpg'],
  Comics: ['./assets/home-comics.jpg', './assets/anime-cowboy.jpg', './assets/home-comics.jpg', './assets/kpop-c.jpg', './assets/home-comics.jpg'],
  Gaming: ['./assets/home-gaming.jpg', './assets/home-gaming.jpg', './assets/home-gaming.jpg', './assets/generic.jpg', './assets/home-gaming.jpg'],
  Movies: ['./assets/home-movies.jpg', './assets/anime-spirited.jpg', './assets/home-movies.jpg', './assets/generic.jpg', './assets/home-movies.jpg'],
}

const seeded = {
  Anime: [
    ['Fullmetal Alchemist: Brotherhood', 'Bones', 9.1, 2009, 'Action', 'A boy who breaks the rules of alchemy pays a price that changes his family forever.'],
    ['Attack on Titan', 'Wit Studio / MAPPA', 9.0, 2013, 'Action', 'Humanity fights for survival behind enormous walls while uncovering a terrifying history.'],
    ['Steins;Gate', 'White Fox', 9.0, 2011, 'Sci-Fi', 'A self-styled mad scientist discovers that changing the past has consequences.'],
    ['Cowboy Bebop', 'Sunrise', 8.9, 1998, 'Space Western', 'Bounty hunters drift through space while old debts and memories follow them.'],
    ['Spirited Away', 'Studio Ghibli', 8.9, 2001, 'Fantasy', 'A young girl enters a mysterious spirit world and must find a way home.'],
    ['Vinland Saga', 'Wit Studio', 8.8, 2019, 'Historical', 'A young warrior grows up in a world driven by revenge, war, and the dream of a true land.'],
    ['Demon Slayer', 'ufotable', 8.6, 2019, 'Action', 'A determined brother joins the demon slayer corps to save his sister.'],
    ['Jujutsu Kaisen', 'MAPPA', 8.6, 2020, 'Shonen', 'A teenager enters a hidden world of curses after swallowing a dangerous relic.'],
    ['One-Punch Man', 'Madhouse', 8.5, 2015, 'Comedy', 'An overpowered hero searches for a challenge that can actually excite him.'],
    ['Tokyo Ghoul', 'Pierrot', 8.3, 2014, 'Dark Fantasy', 'A college student is pulled into the hidden society of ghouls after a life-changing encounter.'],
  ],
  'TV Shows': [
    ['Arcane', 'Fortiche / Riot', 9.0, 2021, 'Fantasy', 'Two sisters find themselves on opposite sides of a conflict between cities.'],
    ['Better Call Saul', 'Peter Gould', 9.0, 2015, 'Crime', 'A small-time lawyer slowly becomes the man behind a notorious name.'],
    ['Breaking Bad', 'Vince Gilligan', 9.5, 2008, 'Crime', 'A chemistry teacher enters the drug trade and transforms his life.'],
    ['Chernobyl', 'Craig Mazin', 9.4, 2019, 'Historical', 'A disaster becomes a story about truth, responsibility, and survival.'],
    ['Fleabag', 'Phoebe Waller-Bridge', 8.7, 2016, 'Comedy', 'A sharp, messy portrait of grief, love, and trying to keep moving.'],
    ['Severance', 'Dan Erickson', 8.7, 2022, 'Sci-Fi', 'Employees divide their work and personal memories in an unsettling experiment.'],
    ['Stranger Things', 'The Duffer Brothers', 8.6, 2016, 'Mystery', 'A group of friends confronts a secret supernatural world beneath their town.'],
    ['The Last of Us', 'HBO', 8.7, 2023, 'Post-Apocalyptic', 'A hardened survivor escorts a teenager through a ruined America.'],
    ['The Wire', 'David Simon', 9.3, 2002, 'Crime', 'Baltimore institutions collide in a deeply human crime drama.'],
    ['Twin Peaks', 'David Lynch', 8.9, 1990, 'Mystery', 'A small town hides strange secrets behind a dreamlike surface.'],
  ],
  Manga: [
    ['Attack on Titan', 'Kodansha', 9.0, 2009, 'Action', 'Humanity fights for survival behind enormous walls.'],
    ['Vinland Saga', 'Kodansha', 8.8, 2005, 'Historical', 'A warrior searches for purpose beyond revenge.'],
    ['One-Punch Man', 'Shueisha', 8.5, 2012, 'Comedy', 'The strongest hero around has one frustrating problem: no challenge.'],
    ['Jujutsu Kaisen', 'Shueisha', 8.6, 2018, 'Shonen', 'Curses and sorcerers collide in modern Japan.'],
    ['Fullmetal Alchemist', 'Square Enix', 9.0, 2001, 'Fantasy', 'Alchemy, family, and a journey to recover what was lost.'],
    ['Steins;Gate 0', 'Kadokawa', 8.8, 2017, 'Sci-Fi', 'A darker route through the time-travel story.'],
  ],
  Comics: [
    ['The Crimson Caviler', 'Aurora Press', 8.1, 2024, 'Action', 'A bright symbol becomes a stronger promise in a city that needs hope.'],
    ['Saga', 'Image Comics', 9.0, 2012, 'Sci-Fi', 'A family crosses the stars while empires hunt them.'],
    ['Batman: Year One', 'DC', 8.9, 1987, 'Crime', 'A grounded origin story about a city and the man who refuses to leave it broken.'],
    ['Spider-Man: Blue', 'Marvel', 8.7, 2002, 'Drama', 'Memory, love, and responsibility in a classic superhero voice.'],
    ['Ms. Marvel', 'Marvel', 8.2, 2014, 'Comedy', 'A teenager discovers what heroism means on her own terms.'],
  ],
  Gaming: [
    ['Cyberpunk 2077', 'CD Projekt Red', 8.4, 2020, 'RPG', 'Night City offers upgrades, danger, and choices that stay with you.'],
    ['The Last of Us Part I', 'Naughty Dog', 9.3, 2013, 'Action', 'A dangerous journey across a broken America.'],
    ['Elden Ring', 'FromSoftware', 9.5, 2022, 'Fantasy', 'A shattered world invites exploration, challenge, and discovery.'],
    ['Hades', 'Supergiant Games', 9.2, 2020, 'Indie', 'Escape the underworld one run at a time.'],
    ['The Legend of Zelda', 'Nintendo', 9.4, 1986, 'Adventure', 'A timeless hero explores worlds built around curiosity and courage.'],
  ],
  Movies: [
    ['Dune: Part Two', 'Warner Bros.', 9.2, 2024, 'Sci-Fi', 'A desert world, a prophecy, and a war for the future.'],
    ['Spirited Away', 'Studio Ghibli', 8.9, 2001, 'Fantasy', 'A young girl finds courage inside a mysterious spirit world.'],
    ['Interstellar', 'Paramount', 8.7, 2014, 'Sci-Fi', 'A mission across space asks what humanity owes its future.'],
    ['Everything Everywhere All at Once', 'A24', 8.0, 2022, 'Comedy', 'A family story stretches across impossible possibilities.'],
    ['The Dark Knight', 'Warner Bros.', 9.0, 2008, 'Crime', 'A city is tested by a hero who believes in order.'],
  ],
  'K-Pop': [
    ['Love Dive', 'IVE', 8.9, 2022, 'Girl Group', 'A glossy era-defining single built around confidence and repetition.'],
    ['Super Shy', 'NewJeans', 8.8, 2023, 'Girl Group', 'Bright pop hooks, airy production, and unforgettable choreography.'],
    ['Midas Touch', 'KISS OF LIFE', 8.6, 2024, 'Girl Group', 'A bold, retro-leaning pop track with stage-ready energy.'],
    ['God of Music', 'SEVENTEEN', 8.7, 2023, 'Boy Group', 'Celebratory pop with a huge communal chorus.'],
    ['Maniac', 'Stray Kids', 8.7, 2022, 'Boy Group', 'A high-energy performance track with a sharp concept.'],
  ],
}

function buildItems(category) {
  const rows = seeded[category] || seeded.Anime
  const imgs = imageMap[category] || imageMap.Anime
  return rows.map((r, i) => ({ id: `${category}-${r[0]}`, title: r[0], creator: r[1], rating: r[2], year: r[3], genre: r[4], description: r[5], image: imgs[i % imgs.length], category }))
}

const DATA = Object.fromEntries(categories.map((category) => [category, buildItems(category)]))
const HOME_FEATURED = categories.flatMap((category) => DATA[category]).slice().sort((a, b) => b.rating - a.rating || b.year - a.year).slice(0, 10)

function getRoute() {
  const raw = window.location.hash.replace(/^#/, '')
  const parts = raw.split('/').filter(Boolean)
  if (!parts.length) return { page: 'home' }
  if (parts[0] === 'favorites') return { page: 'favorites' }
  if (parts[0] === 'about') return { page: 'about' }
  if (parts[0] === 'contact') return { page: 'contact' }
  if (parts[0] === 'category') return { page: 'category', category: decodeURIComponent(parts[1] || 'Anime') }
  if (parts[0] === 'title') return { page: 'title', category: decodeURIComponent(parts[1] || 'Anime'), id: decodeURIComponent(parts.slice(2).join('/')) }
  return { page: 'home' }
}

function go(hash) { window.location.hash = hash }

function useLocalSet(key) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

function Brand() {
  return <div className="brand"><span className="brand-mark" /><span>Fandom<span>Verse</span></span></div>
}

function Nav({ route, favoritesCount }) {
  const active = route.category
  return <header className="topbar"><div className="nav-inner">
    <button className="brand-home" onClick={() => go('#/')} aria-label="FandomVerse home"><Brand /></button>
    <nav className="nav-links">
      {categories.map((category) => <button key={category} className={`nav-link ${active === category ? 'active' : ''}`} onClick={() => go(`#/category/${encodeURIComponent(category)}`)}>{category}</button>)}
    </nav>
    <div className="nav-actions">
      <button className="icon-btn" onClick={() => go('#/favorites')} aria-label="Favorites">♡{favoritesCount > 0 && <span className="badge">{favoritesCount}</span>}</button>
    </div>
  </div></header>
}

function Footer() {
  return <footer className="footer">
    <div className="footer-grid">
      <div><Brand /><p className="footer-blurb">A map of the things people love, arranged as a solar system you can spin.</p></div>
      <div><h4>Universes</h4><div className="footer-links">{categories.map((category) => <a href={`#/category/${encodeURIComponent(category)}`} key={category}>{category}</a>)}</div></div>
      <div><h4>Elsewhere</h4><div className="footer-single"><a href="#/about" target="_blank" rel="noreferrer">About us</a><a href="#/contact" target="_blank" rel="noreferrer">Contact us</a></div></div>
    </div>
    <div className="copyright">© 2026 FandomVerse. Built for fans, by fans.</div>
  </footer>
}

function useClock() {
  const [date, setDate] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return date
}

function Shatter({ image, category, onDone }) {
  const pieces = useMemo(() => {
    const cols = 24
    const rows = 18
    return Array.from({ length: cols * rows }, (_, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const angle = Math.atan2(row - (rows - 1) / 2, col - (cols - 1) / 2)
      const distance = 18 + Math.random() * 42
      const dx = Math.cos(angle) * distance + (Math.random() - 0.5) * 16
      const dy = Math.sin(angle) * distance + (Math.random() - 0.5) * 18
      return {
        i,
        col,
        row,
        dx: `${dx}vw`,
        dy: `${dy}vh`,
        rot: `${(Math.random() - 0.5) * 720}deg`,
        delay: `${Math.random() * 100}ms`,
      }
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(onDone, 1120)
    return () => clearTimeout(timer)
  }, [onDone])

  return <div className="shatter-layer">
    <div className="shatter-backdrop" />
    <div className="shatter-focus" aria-hidden="true">
      <div className="shatter-card-underlay" style={{ backgroundImage: `url(${image})` }} />
      <div className="shatter-card-label">{category}</div>
      <div className="shatter-shards">
        {pieces.map((piece) => <span
          key={piece.i}
          className="shard"
          style={{
            left: `${piece.col * (100 / 24)}%`,
            top: `${piece.row * (100 / 18)}%`,
            width: `${100 / 24 + 0.2}%`,
            height: `${100 / 18 + 0.2}%`,
            backgroundImage: `url(${image})`,
            backgroundSize: '2400% 1800%',
            backgroundPosition: `${piece.col / 23 * 100}% ${piece.row / 17 * 100}%`,
            '--dx': piece.dx,
            '--dy': piece.dy,
            '--rot': piece.rot,
            animationDelay: piece.delay,
          }}
        />)}
      </div>
      <div className="shatter-flash" />
    </div>
  </div>
}

function Home({ onOpen, favorites, toggleFavorite }) {
  const date = useClock()
  const [current, setCurrent] = useState(0)
  const [stageWidth, setStageWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440)
  const dragStart = useRef(null)
  const stageRef = useRef(null)
  const step = Math.min(285, Math.max(175, stageWidth / 5.45))

  useEffect(() => {
    if (!stageRef.current) return undefined
    const observer = new ResizeObserver(() => setStageWidth(stageRef.current?.clientWidth || window.innerWidth))
    observer.observe(stageRef.current)
    setStageWidth(stageRef.current.clientWidth || window.innerWidth)
    return () => observer.disconnect()
  }, [])

  const move = (dir) => setCurrent((value) => (value + dir + categories.length) % categories.length)

  return <>
    <main className="hero-shell">
      <div className="hud">
        <div className="hud-card"><div className="hud-label">◷ Local time</div><div className="hud-value">{date.toLocaleTimeString()}</div><div className="hud-small">{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div></div>
        <div className="hud-card visitors-card"><div className="hud-label">♧ Visitors</div><div className="hud-value">1</div><div className="hud-small"><span className="live-dot">• live</span></div></div>
      </div>

      <div className="hero-title"><div className="hero-kicker">FandomVerse // seven universes</div><h1>Step through the glass</h1><p>Drag or scroll through seven living monoliths — click one to fly inside its world.</p></div>

      <div
        className="monolith-stage"
        ref={stageRef}
        onWheel={(event) => { event.preventDefault(); move(event.deltaY > 0 ? 1 : -1) }}
        onPointerDown={(event) => {
          if (event.target.closest('.monolith-button') || event.target.closest('.category-pill')) return
          dragStart.current = event.clientX
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }}
        onPointerUp={(event) => {
          if (event.target.closest('.monolith-button') || event.target.closest('.category-pill')) {
            dragStart.current = null
            return
          }
          if (dragStart.current === null) return
          const dx = event.clientX - dragStart.current
          if (Math.abs(dx) > 35) move(dx < 0 ? 1 : -1)
          dragStart.current = null
          if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
        }}
      >
        {categories.map((category, index) => {
          let delta = index - current
          if (delta > 3) delta -= 7
          if (delta < -3) delta += 7
          const abs = Math.abs(delta)
          const x = delta * step
          const scale = Math.max(0.82, 1 - abs * 0.04)
          const z = 180 - abs * 30
          const opacity = Math.max(0.62, 1 - abs * 0.10)
          return <div key={category} className="monolith-wrap" style={{ left: '50%', top: '51%', transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${abs * 10}px), ${z}px) scale(${scale})`, opacity, zIndex: 20 - abs }}>
            <button className="monolith-button" onClick={(event) => { event.stopPropagation(); onOpen(category) }} aria-label={`Open ${category}`}>
              <div className="monolith" style={{ '--accent': categoryInfo[category].accent }}>
                <img src={categoryInfo[category].hero} alt={`${category} universe`} draggable="false" onError={(event) => event.currentTarget.classList.add('broken')} />
                <div className="monolith-fallback">{category[0]}</div>
                <div className="monolith-shine" />
                <div className="monolith-name">{category}</div>
              </div>
              <div className="monolith-meta">{category}</div>
              <div className="monolith-platform" style={{ '--accent': categoryInfo[category].accent }} />
            </button>
          </div>
        })}
      </div>

      <div className="hero-controls">
        <div className="drag-pill">✧ Drag · scroll · click a monolith</div>
        <div className="category-pills">{categories.map((category) => <button key={category} className={`category-pill ${categories[current] === category ? 'active' : ''}`} onClick={() => { setCurrent(categories.indexOf(category)); onOpen(category) }} style={{ '--accent': categoryInfo[category].accent }}>{category}</button>)}</div>
      </div>
    </main>

    <section className="home-discover">
      <div className="home-discover-inner">
        <div className="home-discover-head">
          <div><div className="page-kicker">Across the Verse</div><h2>Highly rated & new</h2><p>Fresh picks and fan favorites from across the seven universes.</p></div>
          <button className="secondary" onClick={() => go('#/favorites')}>♡ My favourites</button>
        </div>
        <div className="featured-grid">{HOME_FEATURED.map((item) => <Card key={item.id} item={item} favorite={favorites.includes(item.id)} toggleFavorite={toggleFavorite} />)}</div>
      </div>
    </section>
    <Footer />
  </>
}

function Card({ item, favorite, toggleFavorite }) {
  return <article className="card">
    <div className="card-art">
      <img src={item.image} alt={item.title} onError={(event) => event.currentTarget.classList.add('broken')} />
      <div className="card-fallback">{item.title.slice(0, 1)}</div>
      <button className={`heart ${favorite ? 'active' : ''}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(item.id) }}>{favorite ? '♥' : '♡'}</button>
    </div>
    <button className="card-link" onClick={() => go(`#/title/${encodeURIComponent(item.category)}/${encodeURIComponent(item.id)}`)}>
      <div className="card-body"><div className="card-title">{item.title}</div><div className="card-sub">{item.creator}</div><div className="card-foot"><span className="rating">★ {item.rating.toFixed(1)}</span><span>· {item.year}</span><span className="dot" style={{ background: categoryInfo[item.category].accent }} /></div></div>
    </button>
  </article>
}

function CategoryPage({ category, favorites, toggleFavorite }) {
  const info = categoryInfo[category] || categoryInfo.Anime
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('Best ratings')
  const [genre, setGenre] = useState('All')

  const items = useMemo(() => {
    let list = [...(DATA[category] || DATA.Anime)]
    if (query) list = list.filter((item) => `${item.title} ${item.creator} ${item.description}`.toLowerCase().includes(query.toLowerCase()))
    if (genre !== 'All') list = list.filter((item) => item.genre === genre || (genre === 'Romance' && /love|romance|heart|relationship/i.test(`${item.description} ${item.title}`)))
    if (sort === 'A–Z') list.sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'Best ratings') list.sort((a, b) => b.rating - a.rating)
    if (sort === 'Newest') list.sort((a, b) => b.year - a.year)
    return list
  }, [category, genre, query, sort])

  return <><main className="page category-page">
    <div className="page-title-row"><div><div className="page-kicker">Universe / {category}</div><h2>{category}</h2><p className="page-desc">{info.description}</p></div></div>
    <div className="filters">
      <div className="search-row"><div className="search-box"><span className="search-symbol">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${category}...`} /></div><div className="sort-box"><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Best ratings</option><option>Newest</option><option>A–Z</option></select></div></div>
      <div className="genre-row"><button className={`genre-chip ${genre === 'All' ? 'active' : ''}`} onClick={() => setGenre('All')}>All</button>{info.genres.map((item) => <button key={item} className={`genre-chip ${genre === item ? 'active' : ''}`} onClick={() => setGenre(item)}>{item}</button>)}</div>
    </div>
    {items.length ? <div className="card-grid">{items.map((item) => <Card key={item.id} item={item} favorite={favorites.includes(item.id)} toggleFavorite={toggleFavorite} />)}</div> : <div className="empty">No {category.toLowerCase()} titles match those filters.</div>}
  </main><Footer /></>
}

function DetailPage({ category, id, favorites, toggleFavorite }) {
  const item = (DATA[category] || []).find((entry) => entry.id === id) || (DATA[category] || [])[0]
  const [note, setNote] = useState(() => sessionStorage.getItem(`note:${item?.id}`) || '')
  useEffect(() => { setNote(sessionStorage.getItem(`note:${item?.id}`) || '') }, [item?.id])
  useEffect(() => { if (item) sessionStorage.setItem(`note:${item.id}`, note) }, [item, note])
  if (!item) return <main className="page empty">Title not found.</main>
  const more = (DATA[category] || []).filter((entry) => entry.id !== item.id).slice(0, 5)
  const favorite = favorites.includes(item.id)
  return <><main className="page detail">
    <div className="page-nav"><button className="back-btn" onClick={() => go(`#/category/${encodeURIComponent(category)}`)}>← Back to {category}</button></div>
    <div className="detail-hero">
      <div className="detail-poster"><img src={item.image} alt={item.title} onError={(event) => event.currentTarget.classList.add('broken')} /><div className="detail-fallback">{item.title.slice(0, 1)}</div></div>
      <div className="detail-copy"><div className="page-kicker">{category} / {item.year}</div><h1>{item.title}</h1><div className="detail-tagline">{item.creator} · ★ {item.rating.toFixed(1)}</div><div className="info-grid"><span className="info-chip">{item.genre}</span><span className="info-chip">{item.year}</span><span className="info-chip">{item.creator}</span></div><div className="detail-actions"><button className="primary" onClick={() => toggleFavorite(item.id)}>{favorite ? '♥ Favourited' : '♡ Add to favourites'}</button><button className="secondary" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Share</button></div><p className="description">{item.description}</p></div>
    </div>
    <div className="note-panel"><div className="note-head"><span>Your private note</span><span>Session only</span></div><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={`Thoughts on ${item.title}...`} /></div>
    <section className="more-section"><div className="section-heading"><div className="page-kicker">Keep exploring</div><h3>More from {category}</h3></div><div className="card-grid more-grid">{more.map((entry) => <Card key={entry.id} item={entry} favorite={favorites.includes(entry.id)} toggleFavorite={toggleFavorite} />)}</div></section>
  </main><Footer /></>
}

function FavoritesPage({ favorites, toggleFavorite }) {
  const items = categories.flatMap((category) => DATA[category].filter((item) => favorites.includes(item.id)))
  return <><main className="page favorites-page"><div className="page-title-row"><div><div className="page-kicker">Your collection</div><h2>My favourites</h2><p className="page-desc">Saved locally in this browser.</p></div></div>{items.length ? <div className="card-grid">{items.map((item) => <Card key={item.id} item={item} favorite toggleFavorite={toggleFavorite} />)}</div> : <div className="empty">Nothing here yet. Tap a heart on any title to save it.</div>}</main><Footer /></>
}

function AboutPage() {
  return <><main className="page info-page"><div className="page-kicker">About FandomVerse</div><h2>Why we made this</h2><div className="info-box"><p>FandomVerse was made to turn the feeling of stepping into a favorite story into an interactive place you can explore.</p><p>Instead of putting every universe into one long list, we wanted each world to feel like its own destination — something you enter, browse, save, and come back to.</p><p>The project mixes a dark space-inspired interface with playful motion, searchable collections, favorites, notes, and detail pages so the experience feels closer to exploring than simply reading a catalog.</p><p>It is built as a fan-focused concept: a place to discover something familiar, find something new, and keep a personal trail of the titles that matter to you.</p></div><button className="secondary info-back" onClick={() => go('#/')}>← Back to the Verse</button></main><Footer /></>
}

function ContactPage() {
  const [username, setUsername] = useState('')
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const submit = (event) => { event.preventDefault(); setSent(true) }
  return <><main className="page contact-page"><div className="page-kicker">Contact us</div><h2>Say hello to FandomVerse</h2><p className="page-desc contact-intro">Leave a username and a comment. The map beside the form shows the Aptech Qatar Computer Education Centre location in Doha.</p>
    <div className="contact-layout">
      <form className="contact-card" onSubmit={submit}><label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your username" required /></label><label>Comment<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tell us what you think..." required /></label><button className="primary" type="submit">Send comment</button>{sent && <div className="form-success">Thanks, {username}. Your comment was recorded for this demo.</div>}</form>
      <div className="map-card"><div className="map-head"><div><div className="page-kicker">Find us</div><h3>Aptech Qatar</h3></div><span className="map-pin">● Doha</span></div><iframe title="Aptech Qatar location" src="https://www.google.com/maps?q=Aptech+Qatar+Computer+Education+Centre+WLL%2C+Building+111%2C+Street+250%2C+Doha%2C+Qatar&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><p>Building 111, Street 250, between Mall & Lulu on D-Ring Road, Matar Kadeem Zone 45, Doha, Qatar.</p></div>
    </div>
    <button className="secondary info-back" onClick={() => go('#/')}>← Back to the Verse</button>
  </main><Footer /></>
}

export default function App() {
  const [route, setRoute] = useState(getRoute())
  const [favorites, setFavorites] = useLocalSet('fandomverse:favorites')
  const [shatter, setShatter] = useState(null)

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const toggleFavorite = (id) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const openCategory = (category) => setShatter({ image: categoryInfo[category].hero, category })
  const finishShatter = () => { if (shatter) { go(`#/category/${encodeURIComponent(shatter.category)}`); setShatter(null) } }

  return <div className="fv-app"><div className="space-bg" /><div className="space-stars" /><div className="space-glow" /><Nav route={route} favoritesCount={favorites.length} /><div key={`${route.page}-${route.category || ''}-${route.id || ''}`} className="fv-content page-transition">
    {route.page === 'home' && <Home onOpen={openCategory} favorites={favorites} toggleFavorite={toggleFavorite} />}
    {route.page === 'category' && <CategoryPage category={route.category} favorites={favorites} toggleFavorite={toggleFavorite} />}
    {route.page === 'title' && <DetailPage category={route.category} id={route.id} favorites={favorites} toggleFavorite={toggleFavorite} />}
    {route.page === 'favorites' && <FavoritesPage favorites={favorites} toggleFavorite={toggleFavorite} />}
    {route.page === 'about' && <AboutPage />}
    {route.page === 'contact' && <ContactPage />}
  </div>{shatter && <Shatter image={shatter.image} category={shatter.category} onDone={finishShatter} />}</div>
}
