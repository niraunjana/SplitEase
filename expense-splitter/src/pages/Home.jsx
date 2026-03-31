import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const features = [
  {
    icon: '👥',
    title: 'Create Groups',
    desc: 'Add friends, roommates, or teammates to a group in seconds.',
    color: '#7C3AED',
    bg: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
    border: '#DDD6FE',
    accent: '#8B5CF6',
  },
  {
    icon: '💸',
    title: 'Split Expenses',
    desc: 'Split equally or set custom amounts. No math needed!',
    color: '#2563EB',
    bg: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
    border: '#BFDBFE',
    accent: '#3B82F6',
  },
  {
    icon: '🤖',
    title: 'AI Categories',
    desc: 'Claude AI auto-detects food, transport, shopping, and more.',
    color: '#DB2777',
    bg: 'linear-gradient(135deg, #FCE7F3 0%, #FDF2F8 100%)',
    border: '#FBCFE8',
    accent: '#EC4899',
  },
  {
    icon: '📊',
    title: 'Clear Balances',
    desc: 'See exactly who owes what with minimum payments needed.',
    color: '#059669',
    bg: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)',
    border: '#A7F3D0',
    accent: '#10B981',
  },
]

const floatingItems = ['🍕', '✈️', '🎬', '🏠', '🛍️', '☕', '🎮', '🍺']

const members = [
  { name: 'Rahul', label: 'gets back', amount: '₹1,200', color: '#059669', bg: '#D1FAE5', avatarClass: 'avatar-3', pillType: 'gets' },
  { name: 'Priya', label: 'owes',      amount: '₹600',   color: '#DC2626', bg: '#FFE4E6', avatarClass: 'avatar-2', pillType: 'owes' },
  { name: 'Arjun', label: 'owes',      amount: '₹350',   color: '#DC2626', bg: '#FEF2F2', avatarClass: 'avatar-1', pillType: 'owes' },
  { name: 'Sneha', label: 'settled ✓', amount: '₹0',     color: '#9CA3AF', bg: '#F9FAFB', avatarClass: 'avatar-0', pillType: 'settled' },
]

const stats = [
  { num: '2M+',   label: 'Happy users' },
  { num: '₹50Cr+', label: 'Tracked' },
  { num: '0 fights', label: 'Over money 😄' },
]

export default function Home() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen mesh-bg relative overflow-hidden">

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingItems.map((emoji, i) => (
          <div key={i} className="absolute text-4xl opacity-[0.07] animate-float select-none"
            style={{ left: `${8 + i * 12}%`, top: `${10 + (i % 3) * 28}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.3}s` }}>
            {emoji}
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>S</div>
          <span className="font-extrabold text-xl text-violet-950" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>SplitEase</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-2.5 text-sm">
          Open App →
        </button>
      </nav>

      {/* ── HERO: two-column grid ── */}
      <div className="hero-grid relative z-10">

        {/* LEFT: text content */}
        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-7 text-sm font-bold"
            style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED', border: '1.5px solid rgba(124,58,237,0.25)' }}>
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse inline-block" />
            No sign-up required · 100% Free
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-violet-950"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            <span className="block">Split Expenses,</span>
            <span className="block gradient-text">Not Friendships!</span>
          </h1>

          <p className="text-xl text-violet-700/70 max-w-xl mb-10 leading-relaxed">
            The simplest way to track shared expenses with friends, roommates, and travel groups.
            Add expenses, split instantly, settle up effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/dashboard')} className="btn-primary px-10 py-4 text-lg">
              🚀 Start Splitting Now
            </button>
            <button
              onClick={scrollToFeatures}
              className="px-10 py-4 text-lg font-bold rounded-2xl transition-all"
              style={{ background: 'white', color: '#7C3AED', border: '2px solid #C4B5FD' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7C3AED'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#C4B5FD'}
            >
              See How It Works
            </button>
          </div>

          {/* ── Trust stats — fixed alignment ── */}
          <div
            className="mt-10 pt-8"
            style={{ borderTop: '1px solid rgba(124,58,237,0.12)' }}
          >
            <div className="flex items-center gap-0">
              {stats.map(({ num, label }, i) => (
                <div key={label} className="flex items-center">
                  {/* Stat block */}
                  <div className="flex flex-col items-start">
                    <span
                      className="font-extrabold text-xl leading-tight text-violet-950"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      {num}
                    </span>
                    <span className="text-sm text-violet-400 mt-0.5 whitespace-nowrap">{label}</span>
                  </div>
                  {/* Divider between stats */}
                  {i < stats.length - 1 && (
                    <div
                      className="mx-6 self-stretch"
                      style={{ width: '1px', background: 'rgba(124,58,237,0.15)', minHeight: '36px' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: floating Goa Trip card */}
        <div className={`hero-visual transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Spinning dashed ring */}
          <div className="dashed-ring" />

          {/* Floating pills */}
          <div className="float-pill pill-gets">✅ Rahul gets back ₹1,200</div>
          <div className="float-pill pill-owes">🔴 Priya owes ₹600</div>
          <div className="float-pill pill-settled">🎉 Sneha is settled!</div>

          {/* Card */}
          <div className="expense-card-wrapper">

            {/* Card header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-black text-violet-950 text-xl" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Goa Trip 🏖️
                </h3>
                <p className="text-sm text-violet-400 mt-0.5">4 members · 6 expenses</p>
              </div>
              <span className="text-2xl font-black" style={{ color: '#7C3AED' }}>₹8,400</span>
            </div>

            {/* Member rows */}
            <div className="space-y-2">
              {members.map(item => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl px-4 py-3"
                  style={{ background: item.bg }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black ${item.avatarClass}`}>
                      {item.name[0]}
                    </div>
                    <span className="font-bold text-violet-900">{item.name}</span>
                  </div>
                  <span className="font-black text-sm" style={{ color: item.color }}>
                    {item.label} {item.amount}
                  </span>
                </div>
              ))}
            </div>

            {/* Settlement progress bar */}
            <div className="progress-bar-wrap">
              <div className="flex justify-between text-xs mb-1" style={{ color: '#A78BFA' }}>
                <span>Settlement progress</span>
                <span>64%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" />
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* ── END HERO ── */}

      {/* ── HOW IT WORKS / FEATURES ── */}
      <section id="features" className="relative z-10 py-28 px-6">

        {/* Background accent blob */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: '700px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)',
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative">

          {/* Section heading */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-5 text-sm font-bold"
              style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1.5px solid rgba(124,58,237,0.2)' }}>
              ✨ Why SplitEase?
            </div>
            <h2
              className="text-4xl md:text-5xl font-extrabold text-violet-950 mb-4"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Everything you need
            </h2>
            <p className="text-violet-500 text-lg max-w-md mx-auto leading-relaxed">
              Built for groups. Designed for simplicity. No clutter, no confusion.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: f.bg,
                  border: `1.5px solid ${f.border}`,
                  boxShadow: '0 2px 16px rgba(124,58,237,0.06)',
                }}
              >
                {/* Step number badge */}
                <div
                  className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black opacity-30"
                  style={{ background: f.accent, color: 'white' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm"
                  style={{ background: 'white' }}
                >
                  {f.icon}
                </div>

                {/* Text */}
                <h3
                  className="text-xl font-black mb-2"
                  style={{ color: f.color, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {f.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">{f.desc}</p>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-7 right-7 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }}
                />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <div className="relative z-10 pb-24 px-6">
        <div
          className="relative rounded-3xl p-14 max-w-2xl mx-auto overflow-hidden text-center"
          style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 40%, #EC4899 100%)' }}
        >
          {/* Decorative blobs inside card */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
          }} />

          {/* Emoji row */}
          <div className="flex justify-center gap-3 text-2xl mb-5">
            {['🍕', '✈️', '🏠', '☕'].map(e => (
              <span key={e} className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}>{e}</span>
            ))}
          </div>

          <h2
            className="text-3xl md:text-4xl font-extrabold text-white mb-3 relative"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Ready to split?
          </h2>
          <p className="text-purple-200 mb-8 text-lg relative">
            No account needed. Start in 10 seconds.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="relative font-black px-12 py-4 rounded-2xl text-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: 'white', color: '#7C3AED' }}
          >
            Create Your First Group →
          </button>
        </div>
      </div>

    </div>
  )
}
