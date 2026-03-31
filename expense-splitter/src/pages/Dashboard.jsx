import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGroups, deleteGroup } from '../utils/storage'
import GroupForm from '../components/GroupForm'

export default function Dashboard() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { setGroups(getGroups()) }, [])

  function handleGroupCreated() { setGroups(getGroups()); setShowForm(false) }

  function handleDelete(e, id) {
    e.stopPropagation()
    if (confirm('Delete this group? This cannot be undone.')) {
      deleteGroup(id); setGroups(getGroups())
    }
  }

  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  function getTotal(group) {
    return group.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  }

  const totalAcrossGroups = groups.reduce((sum, g) => sum + getTotal(g), 0)
  const totalExpenses = groups.reduce((sum, g) => sum + g.expenses.length, 0)

  return (
    <div className="min-h-screen mesh-bg">

      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-violet-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>S</div>
            <span className="font-extrabold text-lg text-violet-950" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>SplitEase</span>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <span className="text-base font-black">+</span> New Group
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Summary stats — only shown when groups exist */}
        {groups.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fadeInUp">
            {[
              { label: 'Total Groups', value: groups.length, icon: '👥', color: '#7C3AED', bg: '#EDE9FE' },
              { label: 'Total Expenses', value: totalExpenses, icon: '🧾', color: '#2563EB', bg: '#DBEAFE' },
              { label: 'Total Spent', value: `₹${totalAcrossGroups.toFixed(0)}`, icon: '💰', color: '#059669', bg: '#D1FAE5' },
            ].map(s => (
              <div key={s.label} className="stat-card flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <div>
                  <p className="font-black text-xl leading-tight" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs font-semibold text-violet-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="mb-6 animate-fadeInUp">
          <h1 className="text-3xl font-extrabold text-violet-950" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Your Groups
          </h1>
          <p className="text-violet-500 mt-1">
            {groups.length === 0 ? 'No groups yet. Create one to get started!' :
              `${groups.length} group${groups.length !== 1 ? 's' : ''} · Click a group to view expenses`}
          </p>
        </div>

        {/* Search */}
        {groups.length > 0 && (
          <div className="mb-6 animate-fadeInUp">
            <input type="text" className="input-field" placeholder="🔍  Search groups..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {/* Empty state */}
        {groups.length === 0 && (
          <div className="text-center py-20 animate-fadeInUp">
            <div className="text-7xl mb-5 animate-float">🪙</div>
            <h2 className="text-2xl font-black text-violet-900 mb-3" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              No groups yet!
            </h2>
            <p className="text-violet-400 mb-8 max-w-sm mx-auto">
              Create a group for your trip, household, or any shared expense situation.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary px-8 py-4 text-base">
              ✨ Create Your First Group
            </button>
          </div>
        )}

        {/* Groups grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger-children">
            {filtered.map((group, i) => {
              const total = getTotal(group)
              const memberCount = group.members.length
              const expenseCount = group.expenses.length
              const avatarColors = ['avatar-0','avatar-1','avatar-2','avatar-3','avatar-4','avatar-5','avatar-6','avatar-7','avatar-8','avatar-9']
              const hue = (group.id.charCodeAt(0) * 37) % 10

              return (
                <div key={group.id} onClick={() => navigate(`/group/${group.id}`)}
                  className="bg-white rounded-3xl p-5 cursor-pointer card-hover animate-fadeInUp group overflow-hidden relative"
                  style={{ border: '1.5px solid #EDE9FE', boxShadow: '0 4px 20px rgba(124,58,237,0.08)' }}>

                  {/* Decorative top strip */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                    style={{ background: `linear-gradient(90deg, hsl(${hue * 36}, 70%, 55%), hsl(${hue * 36 + 60}, 70%, 65%))` }} />

                  <div className="flex items-start justify-between mb-4 mt-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg avatar-${hue}`}>
                        {group.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-extrabold text-violet-950 text-lg leading-tight"
                          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{group.name}</h2>
                        <p className="text-sm text-violet-400 mt-0.5">
                          {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button onClick={(e) => handleDelete(e, group.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl text-red-300 hover:text-red-500 hover:bg-red-50">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                      </svg>
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="rounded-2xl px-3 py-2" style={{ background: '#EDE9FE' }}>
                        <p className="text-xs font-black text-violet-500 uppercase tracking-wide">Spent</p>
                        <p className="font-black text-violet-700 text-lg leading-tight">₹{total.toFixed(0)}</p>
                      </div>
                      <div className="rounded-2xl px-3 py-2" style={{ background: '#DBEAFE' }}>
                        <p className="text-xs font-black text-blue-500 uppercase tracking-wide">Bills</p>
                        <p className="font-black text-blue-700 text-lg leading-tight">{expenseCount}</p>
                      </div>
                    </div>

                    {/* Member avatars */}
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 4).map((member, mi) => (
                        <div key={member.id}
                          className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black shadow avatar-${mi % 10}`}
                          title={member.name}>
                          {member.name[0].toUpperCase()}
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-black"
                          style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-violet-300 font-medium">
                    Created {new Date(group.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* No search results */}
        {filtered.length === 0 && groups.length > 0 && (
          <div className="text-center py-12 text-violet-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-bold">No groups match "{search}"</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full max-w-md animate-popIn">
            <GroupForm onCreated={handleGroupCreated} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}