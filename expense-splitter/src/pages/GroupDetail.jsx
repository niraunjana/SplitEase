import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroupById } from '../utils/storage'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import BalanceSummary from '../components/BalanceSummary'
import { getTotalSpending, getCategorySummary, calculateBalances, calculateSettlements } from '../utils/calculations'
import { CATEGORY_EMOJI } from '../utils/categories'

const TABS = ['Expenses', 'Balances', 'Insights']

const CATEGORY_COLORS = {
  food: '#f97316', transport: '#3B82F6', shopping: '#ec4899',
  entertainment: '#8b5cf6', accommodation: '#10B981',
  utilities: '#0EA5E9', healthcare: '#F43F5E', other: '#94a3b8'
}

function detectCategory(desc = '') {
  const d = desc.toLowerCase()
  if (/food|pizza|dinner|lunch|breakfast|eat|restaurant|cafe|coffee|chai|biryani|swiggy|zomato/.test(d)) return 'food'
  if (/travel|uber|ola|cab|flight|train|bus|petrol|fuel|auto|trip/.test(d)) return 'transport'
  if (/shop|amazon|flipkart|buy|purchase|cloth|dress|market/.test(d)) return 'shopping'
  if (/movie|netflix|game|party|pub|bar|drink|club|entertainment/.test(d)) return 'entertainment'
  if (/rent|electricity|wifi|bill|water|gas|utility/.test(d)) return 'utilities'
  return 'other'
}

function DonutChart({ segments, size = 96, stroke = 14 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset} strokeLinecap="round" />
        )
        offset += dash
        return el
      })}
    </svg>
  )
}

function AnalyticsSidebar({ group, open, onClose }) {
  const [activeSection, setActiveSection] = useState('overview')
  const { members, expenses } = group
  const totalSpent = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const balances = calculateBalances(members, expenses)
  const settlements = calculateSettlements(members, expenses)
  const perPerson = members.length > 0 ? totalSpent / members.length : 0

  const catMap = {}
  expenses.forEach(e => {
    const cat = e.category || detectCategory(e.description)
    catMap[cat] = (catMap[cat] || 0) + parseFloat(e.amount)
  })
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1])
  const donutSegments = catEntries.map(([cat, amt]) => ({
    color: CATEGORY_COLORS[cat] || '#94a3b8',
    pct: totalSpent > 0 ? (amt / totalSpent) * 100 : 0,
    label: cat, amt
  }))

  const memberSpend = {}
  expenses.forEach(e => { memberSpend[e.paidBy] = (memberSpend[e.paidBy] || 0) + parseFloat(e.amount) })
  const maxSpend = Math.max(...Object.values(memberSpend), 1)
  const avatarColors = ['#7C3AED','#2563EB','#059669','#DC2626','#D97706','#0891B2']

  const SECTIONS = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'categories', icon: '🏷️', label: 'Categories' },
    { id: 'members', icon: '👥', label: 'Members' },
    { id: 'settle', icon: '💸', label: 'Settle' },
  ]

  return (
    <>
      <div onClick={onClose} style={{
        position:'fixed',inset:0,zIndex:40,
        background:'rgba(10,5,30,0.55)',backdropFilter:'blur(4px)',
        opacity:open?1:0,pointerEvents:open?'auto':'none',
        transition:'opacity 0.35s ease',
      }}/>
      <div style={{
        position:'fixed',top:0,right:0,bottom:0,
        width:'min(480px,100vw)',zIndex:50,
        display:'flex',flexDirection:'column',
        background:'#0F0B2A',
        transform:open?'translateX(0)':'translateX(100%)',
        transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        boxShadow:'-24px 0 80px rgba(0,0,0,0.5)',
        overflow:'hidden',
      }}>
        <div style={{ padding:'20px 24px 0', background:'linear-gradient(160deg,#1a0f4f 0%,#0F0B2A 100%)', flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
            <div>
              <p style={{ color:'#a78bfa',fontSize:10,fontWeight:700,letterSpacing:2,textTransform:'uppercase',margin:0 }}>Analytics</p>
              <h2 style={{ color:'white',fontSize:20,fontWeight:900,margin:'2px 0 0',fontFamily:'Bricolage Grotesque,sans-serif',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:260 }}>{group.name}</h2>
            </div>
            <button onClick={onClose} style={{ width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'16px 20px',marginBottom:16,border:'1px solid rgba(167,139,250,0.15)' }}>
            <p style={{ color:'#a78bfa',fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',margin:0 }}>Total Spent</p>
            <p style={{ color:'white',fontSize:34,fontWeight:900,margin:'4px 0 0',fontFamily:'Bricolage Grotesque,sans-serif',lineHeight:1 }}>
              ₹{totalSpent.toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:0})}
            </p>
            <div style={{ display:'flex',gap:20,marginTop:12 }}>
              {[{label:'Per person',val:`₹${Math.round(perPerson).toLocaleString('en-IN')}`},{label:'Expenses',val:expenses.length},{label:'Settlements',val:settlements.length}].map(s=>(
                <div key={s.label}>
                  <p style={{ color:'white',fontSize:15,fontWeight:800,margin:0 }}>{s.val}</p>
                  <p style={{ color:'#6d7aad',fontSize:10,margin:'1px 0 0',fontWeight:600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex',gap:2 }}>
            {SECTIONS.map(s=>(
              <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{ flex:1,padding:'8px 4px 10px',background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,borderBottom:activeSection===s.id?'2px solid #a78bfa':'2px solid transparent',transition:'all 0.2s' }}>
                <span style={{ fontSize:15 }}>{s.icon}</span>
                <span style={{ fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:'uppercase',color:activeSection===s.id?'#a78bfa':'#4a5580' }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex:1,overflowY:'auto',padding:'20px 24px 40px' }}>
          {activeSection==='overview'&&(
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              {donutSegments.length>0&&(
                <div style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:20,border:'1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ color:'#a78bfa',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',margin:'0 0 16px' }}>Spend Breakdown</p>
                  <div style={{ display:'flex',alignItems:'center',gap:20 }}>
                    <div style={{ position:'relative',flexShrink:0 }}>
                      <DonutChart segments={donutSegments}/>
                      <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                        <span style={{ fontSize:9,color:'#6d7aad',fontWeight:600 }}>TOTAL</span>
                        <span style={{ fontSize:13,fontWeight:900,color:'white',lineHeight:1.2 }}>₹{totalSpent>=1000?(totalSpent/1000).toFixed(1)+'k':totalSpent.toFixed(0)}</span>
                      </div>
                    </div>
                    <div style={{ flex:1,display:'flex',flexDirection:'column',gap:8 }}>
                      {donutSegments.map((seg,i)=>(
                        <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                          <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                            <div style={{ width:8,height:8,borderRadius:2,background:seg.color,flexShrink:0 }}/>
                            <span style={{ fontSize:12,color:'#cbd5e1',fontWeight:600,textTransform:'capitalize' }}>{seg.label}</span>
                          </div>
                          <span style={{ fontSize:12,fontWeight:800,color:seg.color }}>{seg.pct.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                {[{icon:'🧾',label:'Total Bills',val:expenses.length,color:'#a78bfa'},{icon:'✂️',label:'Avg Expense',val:`₹${expenses.length>0?Math.round(totalSpent/expenses.length):0}`,color:'#38bdf8'},{icon:'💰',label:'Biggest Bill',val:expenses.length>0?`₹${Math.round(Math.max(...expenses.map(e=>parseFloat(e.amount))))}`:'—',color:'#fb923c'},{icon:'👥',label:'Members',val:members.length,color:'#34d399'}].map(s=>(
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize:22 }}>{s.icon}</span>
                    <p style={{ color:'white',fontSize:18,fontWeight:900,margin:'8px 0 2px' }}>{s.val}</p>
                    <p style={{ color:'#4a5580',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,margin:0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {expenses.length>0&&(
                <div style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:20,border:'1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ color:'#a78bfa',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',margin:'0 0 14px' }}>Recent Expenses</p>
                  <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                    {[...expenses].reverse().slice(0,4).map((e,i)=>{
                      const cat=e.category||detectCategory(e.description)
                      const color=CATEGORY_COLORS[cat]||'#94a3b8'
                      const payer=members.find(m=>m.id===e.paidBy)
                      return(
                        <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                            <div style={{ width:34,height:34,borderRadius:10,flexShrink:0,background:color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>{CATEGORY_EMOJI?.[cat]||'📦'}</div>
                            <div>
                              <p style={{ color:'white',fontSize:12,fontWeight:700,margin:0,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{e.description}</p>
                              <p style={{ color:'#4a5580',fontSize:10,margin:'1px 0 0',fontWeight:600 }}>paid by {payer?.name||'Unknown'}</p>
                            </div>
                          </div>
                          <span style={{ color,fontSize:13,fontWeight:900 }}>₹{parseFloat(e.amount).toFixed(0)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection==='categories'&&(
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              {donutSegments.length===0?(
                <div style={{ textAlign:'center',padding:'48px 0',color:'#4a5580' }}>
                  <div style={{ fontSize:40,marginBottom:12 }}>🏷️</div>
                  <p style={{ fontWeight:700 }}>No categories yet</p>
                </div>
              ):(
                <>
                  <div style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:24,border:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',alignItems:'center',gap:20 }}>
                    <div style={{ position:'relative' }}>
                      <DonutChart segments={donutSegments} size={140} stroke={20}/>
                      <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                        <span style={{ fontSize:10,color:'#6d7aad',fontWeight:600 }}>TOTAL</span>
                        <span style={{ fontSize:18,fontWeight:900,color:'white' }}>₹{totalSpent>=1000?(totalSpent/1000).toFixed(1)+'k':totalSpent.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                    {donutSegments.map((seg,i)=>(
                      <div key={i} style={{ background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                            <span style={{ fontSize:18 }}>{CATEGORY_EMOJI?.[seg.label]||'📦'}</span>
                            <span style={{ color:'white',fontWeight:700,fontSize:13,textTransform:'capitalize' }}>{seg.label}</span>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <span style={{ color:seg.color,fontWeight:900,fontSize:14 }}>₹{seg.amt.toFixed(0)}</span>
                            <span style={{ color:'#4a5580',fontSize:11,marginLeft:6 }}>({seg.pct.toFixed(0)}%)</span>
                          </div>
                        </div>
                        <div style={{ height:6,background:'rgba(255,255,255,0.07)',borderRadius:99,overflow:'hidden' }}>
                          <div style={{ height:'100%',borderRadius:99,background:seg.color,width:seg.pct+'%',transition:'width 0.9s cubic-bezier(.4,2,.6,1)' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection==='members'&&(
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <p style={{ color:'#a78bfa',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',margin:0 }}>Who Paid What</p>
              {members.map((member,i)=>{
                const paid=memberSpend[member.id]||0
                const pct=maxSpend>0?(paid/maxSpend)*100:0
                const balance=Math.round((balances[member.id]||0)*100)/100
                const isPos=balance>0.01,isNeg=balance<-0.01
                const color=avatarColors[i%avatarColors.length]
                return(
                  <div key={member.id} style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'16px 18px',border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:12 }}>
                      <div style={{ width:40,height:40,borderRadius:'50%',flexShrink:0,background:color,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:15,fontWeight:900 }}>{member.name[0].toUpperCase()}</div>
                      <div style={{ flex:1 }}>
                        <p style={{ color:'white',fontWeight:800,fontSize:14,margin:0 }}>{member.name}</p>
                        <p style={{ fontSize:11,fontWeight:700,margin:'2px 0 0',color:isPos?'#34d399':isNeg?'#f87171':'#6d7aad' }}>{isPos?`gets back ₹${balance.toFixed(0)}`:isNeg?`owes ₹${Math.abs(balance).toFixed(0)}`:'settled up ✓'}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ color,fontWeight:900,fontSize:16,margin:0 }}>₹{paid.toFixed(0)}</p>
                        <p style={{ color:'#4a5580',fontSize:10,margin:'1px 0 0',fontWeight:600 }}>paid</p>
                      </div>
                    </div>
                    <div style={{ height:6,background:'rgba(255,255,255,0.07)',borderRadius:99,overflow:'hidden' }}>
                      <div style={{ height:'100%',borderRadius:99,background:color,width:pct+'%',transition:'width 0.9s cubic-bezier(.4,2,.6,1)' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeSection==='settle'&&(
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <p style={{ color:'#a78bfa',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',margin:0 }}>{settlements.length} Payment{settlements.length!==1?'s':''} Needed</p>
              {settlements.length===0?(
                <div style={{ textAlign:'center',padding:'40px 0',background:'rgba(52,211,153,0.07)',borderRadius:20,border:'1px solid rgba(52,211,153,0.2)' }}>
                  <div style={{ fontSize:48,marginBottom:12 }}>🎉</div>
                  <p style={{ color:'#34d399',fontWeight:800,fontSize:18,margin:0 }}>All settled!</p>
                </div>
              ):(
                <>
                  {settlements.map((s,i)=>(
                    <div key={i} style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'16px 18px',border:'1px solid rgba(255,165,0,0.15)',position:'relative',overflow:'hidden' }}>
                      <div style={{ position:'absolute',top:0,left:0,bottom:0,width:3,background:'linear-gradient(180deg,#f97316,#fb923c)',borderRadius:'3px 0 0 3px' }}/>
                      <div style={{ paddingLeft:8,display:'flex',alignItems:'center',gap:10 }}>
                        <div style={{ width:34,height:34,borderRadius:'50%',background:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:13,fontWeight:900,flexShrink:0 }}>{s.from.name[0].toUpperCase()}</div>
                        <div style={{ flex:1 }}>
                          <p style={{ color:'white',fontWeight:800,fontSize:13,margin:0 }}>{s.from.name}</p>
                          <p style={{ color:'#6d7aad',fontSize:10,margin:0,fontWeight:600 }}>pays</p>
                        </div>
                        <div style={{ textAlign:'center',flexShrink:0 }}>
                          <p style={{ color:'#fb923c',fontWeight:900,fontSize:16,margin:0 }}>₹{s.amount.toFixed(2)}</p>
                          <svg width="44" height="14" viewBox="0 0 44 14" fill="none" style={{ display:'block',margin:'2px auto 0' }}>
                            <path d="M2 7h36M32 2l8 5-8 5" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div style={{ flex:1,textAlign:'right' }}>
                          <p style={{ color:'white',fontWeight:800,fontSize:13,margin:0 }}>{s.to.name}</p>
                          <p style={{ color:'#6d7aad',fontSize:10,margin:0,fontWeight:600 }}>receives</p>
                        </div>
                        <div style={{ width:34,height:34,borderRadius:'50%',background:'#34d399',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:13,fontWeight:900,flexShrink:0 }}>{s.to.name[0].toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ background:'rgba(167,139,250,0.1)',borderRadius:14,padding:'14px 18px',border:'1px solid rgba(167,139,250,0.2)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ color:'#a78bfa',fontWeight:700,fontSize:13 }}>Total to settle</span>
                    <span style={{ color:'white',fontWeight:900,fontSize:18 }}>₹{settlements.reduce((s,t)=>s+t.amount,0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [activeTab, setActiveTab] = useState('Expenses')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { refreshGroup() }, [id])

  function refreshGroup() {
    const g = getGroupById(id)
    if (!g) { navigate('/dashboard'); return }
    setGroup(g); setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="text-5xl animate-float mb-4">💸</div>
        <p className="text-violet-500 font-bold">Loading group...</p>
      </div>
    </div>
  )

  const total = getTotalSpending(group.expenses)
  const catSummary = getCategorySummary(group.expenses)
  const topCategory = Object.entries(catSummary).sort((a, b) => b[1] - a[1])[0]
  const perPerson = group.members.length > 0 ? (total / group.members.length).toFixed(2) : '0.00'

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh' }}>
      <AnalyticsSidebar group={group} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── STICKY HEADER ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(124,58,237,0.1)',
        boxShadow: '0 2px 24px rgba(124,58,237,0.07)',
        width: '100%',
      }}>
        <div style={{ padding: '0 20px' }}>

          {/* Top row: back + title + buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <button onClick={() => navigate('/dashboard')} style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#F5F3FF', border: '1.5px solid #EDE9FE',
                color: '#7C3AED', cursor: 'pointer',
              }}>
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
                </svg>
              </button>
              <div style={{ minWidth: 0 }}>
                <h1 style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontWeight: 900, fontSize: 'clamp(15px, 3.5vw, 22px)',
                  color: '#1e0a3c', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: 'clamp(110px, 28vw, 360px)',
                }}>{group.name}</h1>
                <p style={{ color: '#a78bfa', fontSize: 11, fontWeight: 600, margin: '1px 0 0' }}>
                  {group.members.length} members · {group.expenses.length} expenses
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
              {/* Analytics button */}
              <button onClick={() => setSidebarOpen(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 11, cursor: 'pointer',
                background: 'linear-gradient(135deg,#1a0f4f,#312e81)',
                border: '1px solid rgba(167,139,250,0.3)',
                color: 'white', fontSize: 13, fontWeight: 800,
                boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                position: 'relative',
              }}>
                {group.expenses.length > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#a78bfa', animation: 'pulseDot 2s infinite',
                  }}/>
                )}
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 20V10M12 20V4M6 20v-6"/>
                </svg>
                <span style={{ display: 'none' }} className="show-sm">Analytics</span>
                <span className="hide-sm">Analytics</span>
                <svg width="12" height="12" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>

              {/* Add Expense */}
              <button onClick={() => setShowForm(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 11, cursor: 'pointer',
                background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                border: 'none', color: 'white', fontSize: 13, fontWeight: 800,
                boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
              }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                <span className="hide-xs">Add Expense</span>
              </button>
            </div>
          </div>

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
            {[
              { label: 'TOTAL SPENT', value: `₹${total.toFixed(2)}`, color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE' },
              { label: 'PER PERSON', value: `₹${perPerson}`, color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE' },
              topCategory && { label: 'TOP CATEGORY', value: `${CATEGORY_EMOJI[topCategory[0]] || ''} ${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)}`, color: '#059669', bg: '#D1FAE5', border: '#A7F3D0' },
            ].filter(Boolean).map(s => (
              <div key={s.label} style={{
                flexShrink: 0, padding: '9px 16px', borderRadius: 12,
                background: s.bg, border: `1.5px solid ${s.border}`,
              }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: s.color, opacity: 0.65, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 'clamp(15px, 2.5vw, 20px)', fontWeight: 900, color: s.color, margin: '2px 0 0', lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, paddingBottom: 10 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                ...(activeTab === tab
                  ? { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }
                  : { color: '#7C3AED', background: 'transparent' }
                ),
              }}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT — full width, good padding ── */}
      <div style={{ width: '100%', padding: '20px 20px 48px', boxSizing: 'border-box' }}>

        {/* Members bar */}
        <div style={{
          background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 18,
          border: '1.5px solid #EDE9FE', boxShadow: '0 4px 20px rgba(124,58,237,0.07)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 10px' }}>Members</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {group.members.map((member, i) => (
              <div key={member.id} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 99,
                background: '#F5F3FF', border: '1.5px solid #EDE9FE',
              }}>
                <div className={`avatar-${i % 10}`} style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 10, fontWeight: 900,
                }}>
                  {member.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#5B21B6' }}>{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div key={activeTab} className="animate-fadeIn">
          {activeTab === 'Expenses' && <ExpenseList group={group} onUpdate={refreshGroup} />}
          {activeTab === 'Balances' && <BalanceSummary group={group} />}
          {activeTab === 'Insights' && <InsightsTab group={group} total={total} catSummary={catSummary} />}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)', zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', borderRadius: 24 }} className="animate-popIn">
            <ExpenseForm group={group} onAdded={() => { refreshGroup(); setShowForm(false) }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseDot {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.5;transform:scale(1.4)}
        }
        /* Hide scrollbar on stats strip */
        div::-webkit-scrollbar { display: none; }
        /* Responsive label hiding */
        @media (max-width: 420px) {
          .hide-xs { display: none !important; }
        }
        @media (max-width: 600px) {
          .hide-sm { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function InsightsTab({ group, total, catSummary }) {
  const expenses = group.expenses
  if (expenses.length === 0) return (
    <div style={{ textAlign: 'center', padding: '64px 0', color: '#a78bfa' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <p style={{ fontWeight: 700, fontSize: 16 }}>Add expenses to see insights</p>
    </div>
  )

  const paidMap = {}
  expenses.forEach(e => { paidMap[e.paidBy] = (paidMap[e.paidBy] || 0) + parseFloat(e.amount) })
  const topPayer = Object.entries(paidMap).sort((a, b) => b[1] - a[1])[0]
  const topPayerMember = group.members.find(m => m.id === topPayer[0])
  const catEntries = Object.entries(catSummary).sort((a, b) => b[1] - a[1])
  const topExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0]
  const avg = total / expenses.length
  const catColors = {
    food:'#F59E0B', transport:'#3B82F6', shopping:'#EC4899',
    entertainment:'#8B5CF6', accommodation:'#10B981',
    utilities:'#0EA5E9', healthcare:'#F43F5E', other:'#9CA3AF'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fadeInUp">
      <div style={{ borderRadius: 24, padding: 24, color: 'white', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
        <div style={{ position: 'absolute', top: -16, right: -16, fontSize: 80, opacity: 0.1 }}>🤖</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span>✨</span>
          <span style={{ fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 }}>AI Smart Insight</span>
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.4, margin: 0 }}>
          {topPayerMember?.name || 'Someone'} paid the most — ₹{topPayer[1].toFixed(0)}.
          {catEntries[0] && ` Biggest spend: ${catEntries[0][0]} at ${((catEntries[0][1]/total)*100).toFixed(0)}% of total.`}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Total Bills', value: expenses.length, icon: '🧾', color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Avg Split', value: `₹${avg.toFixed(0)}`, icon: '✂️', color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Biggest', value: `₹${parseFloat(topExpense.amount).toFixed(0)}`, icon: '💰', color: '#059669', bg: '#D1FAE5' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 20, padding: '14px 10px', textAlign: 'center', border: `1.5px solid ${s.bg}`, boxShadow: '0 4px 12px rgba(124,58,237,0.07)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 8px' }}>{s.icon}</div>
            <p style={{ fontWeight: 900, fontSize: 18, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#a78bfa', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '20px 22px', border: '1.5px solid #EDE9FE', boxShadow: '0 4px 16px rgba(124,58,237,0.08)' }}>
        <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 900, fontSize: 16, color: '#1e0a3c', margin: '0 0 16px' }}>Spending by Category</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {catEntries.map(([cat, amount]) => {
            const pct = (amount / total) * 100
            const color = catColors[cat] || '#9CA3AF'
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e0a3c' }}>{CATEGORY_EMOJI[cat]||'📦'} {cat.charAt(0).toUpperCase()+cat.slice(1)}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color }}>₹{amount.toFixed(0)} <span style={{ fontWeight: 600, color: '#a78bfa' }}>({pct.toFixed(0)}%)</span></span>
                </div>
                <div style={{ height: 8, background: '#EDE9FE', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: color, width: `${pct}%`, transition: 'width 0.7s cubic-bezier(.4,2,.6,1)' }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '20px 22px', border: '1.5px solid #EDE9FE', boxShadow: '0 4px 16px rgba(124,58,237,0.08)' }}>
        <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 900, fontSize: 16, color: '#1e0a3c', margin: '0 0 16px' }}>Who Paid Most</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(paidMap).sort((a,b)=>b[1]-a[1]).map(([memberId,paid],i)=>{
            const member=group.members.find(m=>m.id===memberId)
            if(!member)return null
            const pct=(paid/total)*100
            return(
              <div key={memberId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className={`avatar-${i%10}`} style={{ width:38,height:38,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:14,fontWeight:900,flexShrink:0 }}>{member.name[0].toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                    <span style={{ fontSize:13,fontWeight:700,color:'#1e0a3c' }}>{member.name}</span>
                    <span style={{ fontSize:13,fontWeight:900,color:'#7C3AED' }}>₹{paid.toFixed(0)}</span>
                  </div>
                  <div style={{ height:8,background:'#EDE9FE',borderRadius:99 }}>
                    <div style={{ height:'100%',borderRadius:99,background:'linear-gradient(90deg,#7C3AED,#EC4899)',width:`${pct}%`,transition:'width 0.7s cubic-bezier(.4,2,.6,1)' }}/>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}