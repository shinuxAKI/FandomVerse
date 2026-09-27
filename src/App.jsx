import { useEffect, useMemo, useState, useRef } from 'react'
import './App.css'

const categories = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga']

const categoryInfo = {
  Anime: { accent: '#d26bff', description: 'Hand-drawn worlds, impossible stakes.', hero: '/assets/monolith-anime.jpg', genres: ['Action','Adventure','Comedy','Dark Fantasy','Drama','Fantasy','Film','Historical','Mystery','Noir','Sci-Fi','Shonen','Space Western','Supernatural','Thriller','Romance'] },
  Manga: { accent: '#aab2c0', description: 'Panels, pages, and worlds that stay with you.', hero: '/assets/monolith-manga.jpg', genres: ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Shonen'] },
  Comics: { accent: '#ff7aa8', description: 'Heroes, antiheroes, and stories in every shade.', hero: '/assets/monolith-comics.jpg', genres: ['Action','Adventure','Comedy','Crime','Drama','Fantasy','Horror','Mystery','Sci-Fi'] },
  Gaming: { accent: '#62d7b1', description: 'Worlds to play, explore, master, and remember.', hero: '/assets/monolith-gaming.jpg', genres: ['Action','Adventure','RPG','Strategy','Indie','Horror','Racing','Sports','Simulation'] },
  Movies: { accent: '#e6b354', description: 'Frames, soundtracks, and worlds on the big screen.', hero: '/assets/monolith-movies.jpg', genres: ['Action','Adventure','Comedy','Crime','Drama','Fantasy','Horror','Romance','Sci-Fi','Thriller'] },
  'TV Shows': { accent: '#65b9e8', description: 'Stories built for the next episode.', hero: '/assets/tv-lastofus.jpg', genres: ['Animation','Comedy','Crime','Drama','Fantasy','Historical','Horror','Mystery','Post-Apocalyptic','Sci-Fi','Surreal','Thriller'] },
  'K-Pop': { accent: '#ea73b5', description: 'Artists, eras, stages, and songs on repeat.', hero: '/assets/kpop-a.jpg', genres: ['Girl Group','Boy Group','Solo','R&B','Hip-Hop','Ballad','Dance','Rookie'] },
}

const imageMap = {
  Anime: ['/assets/anime-fmab.jpg','/assets/anime-aot.jpg','/assets/anime-steins.jpg','/assets/anime-cowboy.jpg','/assets/anime-spirited.jpg','/assets/anime-vinland.jpg','/assets/anime-dm.jpg','/assets/anime-jujutsu.jpg','/assets/anime-onepunch.jpg','/assets/anime-jjk.jpg'],
  'TV Shows': ['/assets/tv-arcane.jpg','/assets/tv-bcs.jpg','/assets/tv-breakingbad.jpg','/assets/tv-chernobyl.jpg','/assets/tv-fleabag.jpg','/assets/tv-severance.jpg','/assets/tv-stranger.jpg','/assets/tv-lastofus.jpg','/assets/tv-wire.jpg','/assets/tv-twinpeaks.jpg'],
  'K-Pop': ['/assets/kpop-a.jpg','/assets/kpop-b.jpg','/assets/kpop-c.jpg','/assets/generic.jpg','/assets/kpop-a.jpg','/assets/kpop-b.jpg'],
  Manga: ['/assets/anime-aot.jpg','/assets/anime-vinland.jpg','/assets/anime-onepunch.jpg','/assets/anime-jjk.jpg','/assets/anime-fmab.jpg','/assets/anime-steins.jpg'],
  Comics: ['/assets/monolith-comics.jpg','/assets/anime-cowboy.jpg','/assets/monolith-comics.jpg','/assets/kpop-c.jpg','/assets/monolith-comics.jpg'],
  Gaming: ['/assets/monolith-gaming.jpg','/assets/kpop-b.jpg','/assets/monolith-gaming.jpg','/assets/generic.jpg','/assets/monolith-gaming.jpg'],
  Movies: ['/assets/monolith-movies.jpg','/assets/anime-spirited.jpg','/assets/monolith-movies.jpg','/assets/generic.jpg','/assets/monolith-movies.jpg'],
}

const seeded = {
  Anime: [
    ['Fullmetal Alchemist: Brotherhood','Bones',9.1,2009,'Action','A boy who breaks the rules of alchemy pays a price that changes his family forever.'],
    ['Attack on Titan','Wit Studio / MAPPA',9.0,2013,'Action','Humanity fights for survival behind enormous walls while uncovering a terrifying history.'],
    ['Steins;Gate','White Fox',9.0,2011,'Sci-Fi','A self-styled mad scientist discovers that changing the past has consequences.'],
    ['Cowboy Bebop','Sunrise',8.9,1998,'Space Western','Bounty hunters drift through space while old debts and memories follow them.'],
    ['Spirited Away','Studio Ghibli',8.9,2001,'Fantasy','A young girl enters a mysterious spirit world and must find a way home.'],
    ['Vinland Saga','Wit Studio',8.8,2019,'Historical','A young warrior grows up in a world driven by revenge, war, and the dream of a true land.'],
    ['Demon Slayer','ufotable',8.6,2019,'Action','A determined brother joins the demon slayer corps to save his sister.'],
    ['Jujutsu Kaisen','MAPPA',8.6,2020,'Shonen','A teenager enters a hidden world of curses after swallowing a dangerous relic.'],
    ['One-Punch Man','Madhouse',8.5,2015,'Comedy','An overpowered hero searches for a challenge that can actually excite him.'],
    ['Tokyo Ghoul','Pierrot',8.3,2014,'Dark Fantasy','A college student is pulled into the hidden society of ghouls after a life-changing encounter.'],
  ],
  'TV Shows': [
    ['Arcane','Fortiche / Riot',9.0,2021,'Fantasy','Two sisters find themselves on opposite sides of a conflict between cities.'],
    ['Better Call Saul','Peter Gould',9.0,2015,'Crime','A small-time lawyer slowly becomes the man behind a notorious name.'],
    ['Breaking Bad','Vince Gilligan',9.5,2008,'Crime','A chemistry teacher enters the drug trade and transforms his life.'],
    ['Chernobyl','Craig Mazin',9.4,2019,'Historical','A disaster becomes a story about truth, responsibility, and survival.'],
    ['Fleabag','Phoebe Waller-Bridge',8.7,2016,'Comedy','A sharp, messy portrait of grief, love, and trying to keep moving.'],
    ['Severance','Dan Erickson',8.7,2022,'Sci-Fi','Employees divide their work and personal memories in an unsettling experiment.'],
    ['Stranger Things','The Duffer Brothers',8.6,2016,'Mystery','A group of friends confronts a secret supernatural world beneath their town.'],
    ['The Last of Us','HBO',8.7,2023,'Post-Apocalyptic','A hardened survivor escorts a teenager through a ruined America.'],
    ['The Wire','David Simon',9.3,2002,'Crime','Baltimore institutions collide in a deeply human crime drama.'],
    ['Twin Peaks','David Lynch',8.9,1990,'Mystery','A small town hides strange secrets behind a dreamlike surface.'],
  ],
  Manga: [
    ['Attack on Titan','Kodansha',9.0,2009,'Action','Humanity fights for survival behind enormous walls.'],['Vinland Saga','Kodansha',8.8,2005,'Historical','A warrior searches for purpose beyond revenge.'],['One-Punch Man','Shueisha',8.5,2012,'Comedy','The strongest hero around has one frustrating problem: no challenge.'],['Jujutsu Kaisen','Shueisha',8.6,2018,'Shonen','Curses and sorcerers collide in modern Japan.'],['Fullmetal Alchemist','Square Enix',9.0,2001,'Fantasy','Alchemy, family, and a journey to recover what was lost.'],['Steins;Gate 0','Kadokawa',8.8,2017,'Sci-Fi','A darker route through the time-travel story.']
  ],
  Comics: [['The Crimson Caviler','Aurora Press',8.1,2024,'Action','A bright symbol becomes a stronger promise in a city that needs hope.'],['Saga','Image Comics',9.0,2012,'Sci-Fi','A family crosses the stars while empires hunt them.'],['Batman: Year One','DC',8.9,1987,'Crime','A grounded origin story about a city and the man who refuses to leave it broken.'],['Spider-Man: Blue','Marvel',8.7,2002,'Drama','Memory, love, and responsibility in a classic superhero voice.'],['Ms. Marvel','Marvel',8.2,2014,'Comedy','A teenager discovers what heroism means on her own terms.']],
  Gaming: [['Cyberpunk 2077','CD Projekt Red',8.4,2020,'RPG','Night City offers upgrades, danger, and choices that stay with you.'],['The Last of Us Part I','Naughty Dog',9.3,2013,'Action','A dangerous journey across a broken America.'],['Elden Ring','FromSoftware',9.5,2022,'Fantasy','A shattered world invites exploration, challenge, and discovery.'],['Hades','Supergiant Games',9.2,2020,'Indie','Escape the underworld one run at a time.'],['The Legend of Zelda','Nintendo',9.4,1986,'Adventure','A timeless hero explores worlds built around curiosity and courage.']],
  Movies: [['Dune: Part Two','Warner Bros.',9.2,2024,'Sci-Fi','A desert world, a prophecy, and a war for the future.'],['Spirited Away','Studio Ghibli',8.9,2001,'Fantasy','A young girl finds courage inside a mysterious spirit world.'],['Interstellar','Paramount',8.7,2014,'Sci-Fi','A mission across space asks what humanity owes its future.'],['Everything Everywhere All at Once','A24',8.0,2022,'Comedy','A family story stretches across impossible possibilities.'],['The Dark Knight','Warner Bros.',9.0,2008,'Crime','A city is tested by a hero who believes in order.']],
  'K-Pop': [['Love Dive','IVE',8.9,2022,'Girl Group','A glossy era-defining single built around confidence and repetition.'],['Super Shy','NewJeans',8.8,2023,'Girl Group','Bright pop hooks, airy production, and unforgettable choreography.'],['Midas Touch','KISS OF LIFE',8.6,2024,'Girl Group','A bold, retro-leaning pop track with stage-ready energy.'],['God of Music','SEVENTEEN',8.7,2023,'Boy Group','Celebratory pop with a huge communal chorus.'],['Maniac','Stray Kids',8.7,2022,'Boy Group','A high-energy performance track with a sharp concept.']],
}

function buildItems(category) {
  const rows = seeded[category] || seeded.Anime
  const imgs = imageMap[category] || imageMap.Anime
  return rows.map((r, i) => ({ id: `${category}-${r[0]}`, title:r[0], creator:r[1], rating:r[2], year:r[3], genre:r[4], description:r[5], image:imgs[i % imgs.length], category }))
}

const DATA = Object.fromEntries(categories.map(c => [c, buildItems(c)]))

function getRoute() {
  const raw = window.location.hash.replace(/^#/, '')
  const parts = raw.split('/').filter(Boolean)
  if (!parts.length) return { page:'home' }
  if (parts[0] === 'favorites') return { page:'favorites' }
  if (parts[0] === 'category') return { page:'category', category:decodeURIComponent(parts[1] || 'Anime') }
  if (parts[0] === 'title') return { page:'title', category:decodeURIComponent(parts[1] || 'Anime'), id:decodeURIComponent(parts.slice(2).join('/')) }
  return { page:'home' }
}

function go(hash) { window.location.hash = hash }

function useLocalSet(key) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

function Brand() { return <div className="brand"><span className="brand-mark" /><span>Fandom<span>Verse</span></span></div> }

function Nav({ route, favoritesCount, onSearch }) {
  const active = route.category
  return <header className="topbar"><div className="nav-inner">
    <button className="brand" style={{border:0,background:'none',padding:0}} onClick={() => go('#/')} aria-label="FandomVerse home"><Brand /></button>
    <nav className="nav-links">
      {categories.map(c => <button key={c} className={`nav-link ${active===c?'active':''}`} onClick={() => go(`#/category/${encodeURIComponent(c)}`)}>{c}</button>)}
    </nav>
    <div className="nav-actions">
      <button className="icon-btn" onClick={onSearch} aria-label="Search">⌕</button>
      <button className="icon-btn" onClick={() => go('#/favorites')} aria-label="Favorites">♡{favoritesCount>0 && <span className="badge">{favoritesCount}</span>}</button>
    </div>
  </div></header>
}

function Footer() { return <footer className="footer"><div className="footer-grid">
  <div><Brand /><p style={{marginTop:10,maxWidth:270}}>A map of the things people love, arranged as a solar system you can spin.</p></div>
  <div><h4>Universes</h4><div className="footer-links">{categories.map(c => <a href={`#/category/${encodeURIComponent(c)}`} key={c}>{c}</a>)}</div></div>
  <div><h4>Elsewhere</h4><div className="footer-links"><a href="#/favorites">My favourites</a><a href="#/">About us</a><a href="#/">Contact us</a><a href="#/">Search everything</a></div></div>
</div><div className="copyright">© 2026 FandomVerse. Built for fans, by fans.</div></footer> }

function useClock() { const [d,setD]=useState(new Date()); useEffect(()=>{const t=setInterval(()=>setD(new Date()),1000); return()=>clearInterval(t)},[]); return d }

function Shatter({image, onDone}) {
  const pieces = useMemo(() => Array.from({length:180}, (_,i)=>({i, dx:`${(Math.random()-.5)*100}vw`, dy:`${(Math.random()-.5)*100}vh`, rot:`${(Math.random()-.5)*720}deg`, x:`${(i%15)*6.75}%`, y:`${Math.floor(i/15)*8.35}%`})),[])
  useEffect(()=>{const t=setTimeout(onDone,760); return()=>clearTimeout(t)},[onDone])
  return <div className="shatter-layer">{pieces.map(p => <span key={p.i} className="shard" style={{left:p.x,top:p.y,backgroundImage:`url(${image})`,backgroundSize:'1500% 1200%',backgroundPosition:`${(p.i%15)/14*100}% ${Math.floor(p.i/15)/11*100}%`, '--dx':p.dx,'--dy':p.dy,'--rot':p.rot}} />)}</div>
}

function Home({ onOpen }) {
  const date = useClock()
  const [current, setCurrent] = useState(3)
  const dragStart = useRef(null)
  const step = 276
  const move = (dir) => setCurrent((v) => (v + dir + categories.length) % categories.length)
  return <div className="hero-shell">
    <div className="hud"><div className="hud-card"><div className="hud-label">◷ Local time</div><div className="hud-value">{date.toLocaleTimeString()}</div><div className="hud-small">{date.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div></div><div className="hud-card" style={{minWidth:96}}><div className="hud-label">♧ Visitors</div><div className="hud-value" style={{textAlign:'right'}}>1</div><div className="hud-small" style={{textAlign:'right'}}><span className="live-dot">• live</span></div></div></div>
    <div className="hero-title"><h1>Step through the glass</h1><p>Drag or scroll through seven living monoliths — click one to fly inside its world.</p></div>
    <div className="monolith-stage" onWheel={(e)=>{e.preventDefault();move(e.deltaY>0?1:-1)}} onPointerDown={e=>{dragStart.current=e.clientX; e.currentTarget.setPointerCapture?.(e.pointerId)}} onPointerUp={e=>{if(dragStart.current!==null){const dx=e.clientX-dragStart.current; if(Math.abs(dx)>35) move(dx<0?1:-1); dragStart.current=null}}}>
      {categories.map((c,i)=>{
        let delta=i-current
        if(delta>3) delta-=7
        if(delta<-3) delta+=7
        const abs=Math.abs(delta)
        const x=delta*step
        const scale=Math.max(.78,1-abs*.055)
        const z=140-abs*24
        const opacity=Math.max(.52,1-abs*.12)
        return <div key={c} className="monolith-wrap" style={{position:'absolute',left:'50%',top:'56%',transform:`translateX(calc(-50% + ${x}px)) translateY(calc(-50% + ${abs*9}px)) scale(${scale}) translateZ(${z}px)`,opacity,zIndex:10-abs,transition:'transform .45s cubic-bezier(.2,.8,.25,1), opacity .35s ease'}}>
          <button className="monolith-button" onClick={()=>onOpen(c)} aria-label={`Open ${c}`}>
            <div className="monolith" style={{backgroundImage:`url(${categoryInfo[c].hero})`,boxShadow:`0 28px 45px rgba(0,0,0,.35), 0 0 55px ${categoryInfo[c].accent}18`}} />
            <div className="monolith-meta">{c}</div>
            <div className="monolith-platform" style={{background:`radial-gradient(ellipse at center, ${categoryInfo[c].accent}50, rgba(10,10,20,.08) 68%)`}} />
          </button>
        </div>
      })}
    </div>
    <div className="hero-controls"><div className="drag-pill">✧ Drag · scroll · click a monolith</div><div className="category-pills">{categories.map(c=><button key={c} className={`category-pill ${categories[current]===c?'active':''}`} onClick={()=>{setCurrent(categories.indexOf(c));onOpen(c)}} style={{borderColor:categoryInfo[c].accent+'40'}}>{c}</button>)}</div></div>
  </div>
}
function SearchOverlay({onClose,onOpen}) {
  const [q,setQ]=useState('')
  const all=categories.flatMap(c=>DATA[c])
  const results=all.filter(x=>x.title.toLowerCase().includes(q.toLowerCase())||x.creator.toLowerCase().includes(q.toLowerCase())).slice(0,10)
  return <div style={{position:'fixed',inset:0,zIndex:70,background:'rgba(4,4,14,.92)',backdropFilter:'blur(16px)',display:'flex',justifyContent:'center',alignItems:'flex-start',padding:'90px 18px'}} onClick={onClose}>
    <div style={{width:'min(720px,100%)',border:'1px solid var(--border)',borderRadius:20,background:'rgba(14,14,31,.98)',padding:18}} onClick={e=>e.stopPropagation()}>
      <div className="search-box"><input autoFocus placeholder="Search the FandomVerse..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <div style={{maxHeight:'60vh',overflow:'auto',marginTop:10}}>{q && results.map(x=><button key={x.id} style={{width:'100%',display:'grid',gridTemplateColumns:'48px 1fr auto',gap:10,alignItems:'center',padding:9,border:0,borderBottom:'1px solid rgba(155,115,255,.08)',background:'transparent',color:'#ddd',textAlign:'left'}} onClick={()=>{onClose();go(`#/title/${encodeURIComponent(x.category)}/${encodeURIComponent(x.id)}`)}}><img src={x.image} style={{width:48,height:58,objectFit:'cover',borderRadius:7}}/><span><strong>{x.title}</strong><small style={{display:'block',color:'#777',marginTop:3}}>{x.category} · {x.creator}</small></span><span style={{color:'#f3d873'}}>{x.rating.toFixed(1)}</span></button>)}{q && results.length===0 && <div className="empty">Nothing found.</div>}</div>
    </div>
  </div>
}

function Card({item, favorite, toggleFavorite}) { return <article className="card"><div className="card-art"><img src={item.image} alt={item.title}/><button className={`heart ${favorite?'active':''}`} onClick={e=>{e.stopPropagation();toggleFavorite(item.id)}}>{favorite?'♥':'♡'}</button></div><button style={{display:'block',width:'100%',border:0,background:'none',color:'inherit',padding:0,textAlign:'left'}} onClick={()=>go(`#/title/${encodeURIComponent(item.category)}/${encodeURIComponent(item.id)}`)}><div className="card-body"><div className="card-title">{item.title}</div><div className="card-sub">{item.creator}</div><div className="card-foot"><span className="rating">★ {item.rating.toFixed(1)}</span><span>· {item.year}</span><span className="dot" style={{background:categoryInfo[item.category].accent}} /></div></div></button></article> }

function CategoryPage({category,favorites,toggleFavorite,onOpenSearch}) {
  const info=categoryInfo[category]||categoryInfo.Anime
  const [q,setQ]=useState(''); const [sort,setSort]=useState('Top rated'); const [genre,setGenre]=useState('All')
  const items=useMemo(()=>{ let arr=[...(DATA[category]||[])]; if(q) arr=arr.filter(x=>`${x.title} ${x.creator} ${x.description}`.toLowerCase().includes(q.toLowerCase())); if(genre!=='All') arr=arr.filter(x=>x.genre===genre || (genre==='Romance' && /love|romance|heart|relationship/i.test(x.description+' '+x.title))); if(sort==='A–Z') arr.sort((a,b)=>a.title.localeCompare(b.title)); if(sort==='Best ratings') arr.sort((a,b)=>b.rating-a.rating); if(sort==='Newest') arr.sort((a,b)=>b.year-a.year); return arr },[category,q,sort,genre])
  return <><main className="page"><div className="page-title-row"><div><div className="page-kicker">Universe / {category}</div><h2>{category}</h2><p className="page-desc">{info.description}</p></div><button className="secondary" onClick={onOpenSearch}>⌕ Global search</button></div>
    <div className="filters"><div className="search-row"><div className="search-box"><span style={{paddingLeft:12,color:'#76758b'}}>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search ${category}...`} /></div><div className="sort-box"><select value={sort} onChange={e=>setSort(e.target.value)}><option>Top rated</option><option>Best ratings</option><option>Newest</option><option>A–Z</option></select></div></div>
    <div className="genre-row"><button className={`genre-chip ${genre==='All'?'active':''}`} onClick={()=>setGenre('All')}>All</button>{info.genres.map(g=><button className={`genre-chip ${genre===g?'active':''}`} key={g} onClick={()=>setGenre(g)}>{g}</button>)}</div></div>
    {items.length ? <div className="card-grid">{items.map(item=><Card key={item.id} item={item} favorite={favorites.includes(item.id)} toggleFavorite={toggleFavorite}/>)}</div> : <div className="empty">No {category.toLowerCase()} titles match those filters.</div>}
  </main><Footer/></>
}

function DetailPage({category,id,favorites,toggleFavorite}) {
  const item=(DATA[category]||[]).find(x=>x.id===id) || (DATA[category]||[])[0]
  const [note,setNote]=useState(()=>sessionStorage.getItem(`note:${item?.id}`)||'')
  useEffect(()=>{setNote(sessionStorage.getItem(`note:${item?.id}`)||'')},[item?.id])
  useEffect(()=>{if(item) sessionStorage.setItem(`note:${item.id}`,note)},[item,note])
  if(!item) return <main className="page empty">Title not found.</main>
  const more=(DATA[category]||[]).filter(x=>x.id!==item.id).slice(0,5)
  const f=favorites.includes(item.id)
  return <><main className="page detail"><div className="page-nav"><button className="back-btn" onClick={()=>go(`#/category/${encodeURIComponent(category)}`)}>← Back to {category}</button></div><div className="detail-hero"><div className="detail-poster"><img src={item.image} alt={item.title}/></div><div className="detail-copy"><div className="page-kicker">{category} / {item.year}</div><h1>{item.title}</h1><div className="detail-tagline">{item.creator} · ★ {item.rating.toFixed(1)}</div><div className="info-grid"><span className="info-chip">{item.genre}</span><span className="info-chip">{item.year}</span><span className="info-chip">{item.creator}</span></div><div className="detail-actions"><button className="primary" onClick={()=>toggleFavorite(item.id)}>{f?'♥ Favourited':'♡ Add to favourites'}</button><button className="secondary" onClick={()=>{navigator.clipboard?.writeText(location.href)}}>Share</button></div><p className="description">{item.description}</p></div></div><div className="note-panel"><div className="note-head"><span>Your private note</span><span>Session only</span></div><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={`Thoughts on ${item.title}...`} /></div><section className="more-section"><h3>More from {category}</h3><div className="card-grid">{more.map(x=><Card key={x.id} item={x} favorite={favorites.includes(x.id)} toggleFavorite={toggleFavorite}/>)}</div></section></main><Footer/></>
}

function FavoritesPage({favorites,toggleFavorite}) { const items=categories.flatMap(c=>DATA[c].filter(x=>favorites.includes(x.id))); return <><main className="page"><div className="page-title-row"><div><div className="page-kicker">Your collection</div><h2>My favourites</h2><p className="page-desc">Saved locally in this browser.</p></div></div>{items.length?<div className="card-grid">{items.map(x=><Card key={x.id} item={x} favorite toggleFavorite={toggleFavorite}/>)}</div>:<div className="empty">Nothing here yet. Tap a heart on any title to save it.</div>}</main><Footer/></> }

export default function App() {
  const [route,setRoute]=useState(getRoute()); const [searchOpen,setSearchOpen]=useState(false); const [favorites,setFavorites]=useLocalSet('fandomverse:favorites'); const [shatter,setShatter]=useState(null)
  useEffect(()=>{const fn=()=>setRoute(getRoute()); window.addEventListener('hashchange',fn); return()=>window.removeEventListener('hashchange',fn)},[])
  const toggleFavorite=(id)=>setFavorites(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])
  const openCategory=(category)=>{ setShatter({image:categoryInfo[category].hero,category}); }
  const finishShatter=()=>{if(shatter) { go(`#/category/${encodeURIComponent(shatter.category)}`); setShatter(null) }}
  return <div className="fv-app"><div className="space-bg"/><div className="space-stars"/><div className="space-glow"/><Nav route={route} favoritesCount={favorites.length} onSearch={()=>setSearchOpen(true)}/><div className="fv-content">
    {route.page==='home'&&<Home onOpen={openCategory}/>} 
    {route.page==='category'&&<CategoryPage category={route.category} favorites={favorites} toggleFavorite={toggleFavorite} onOpenSearch={()=>setSearchOpen(true)}/>} 
    {route.page==='title'&&<DetailPage category={route.category} id={route.id} favorites={favorites} toggleFavorite={toggleFavorite}/>} 
    {route.page==='favorites'&&<FavoritesPage favorites={favorites} toggleFavorite={toggleFavorite}/>} 
  </div>{searchOpen&&<SearchOverlay onClose={()=>setSearchOpen(false)} />} {shatter&&<Shatter image={shatter.image} onDone={finishShatter}/>}</div>
}
