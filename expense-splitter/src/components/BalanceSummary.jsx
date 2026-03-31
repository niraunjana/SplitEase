// components/BalanceSummary.jsx
import { useState } from 'react'
import { calculateBalances, calculateSettlements } from '../utils/calculations'

const AVATAR_COLORS = [
  ['#7C3AED', '#EDE9FE'],
  ['#2563EB', '#DBEAFE'],
  ['#059669', '#D1FAE5'],
  ['#DC2626', '#FEE2E2'],
  ['#D97706', '#FEF3C7'],
  ['#0891B2', '#CFFAFE'],
]

export default function BalanceSummary({ group }) {
  const { members, expenses } = group
  const [showSummary, setShowSummary] = useState(false)
  const [copied, setCopied] = useState(false)

  if (expenses.length === 0) {
    return (
      <div className="text-center py-20 animate-fadeInUp">
        <div className="text-6xl mb-4 animate-float">⚖️</div>
        <h3 className="text-xl font-black text-violet-950 mb-2"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          All balanced!
        </h3>
        <p className="text-violet-400 font-medium">Add expenses to see who owes what.</p>
      </div>
    )
  }

  const balances = calculateBalances(members, expenses)
  const settlements = calculateSettlements(members, expenses)
  const allSettled = settlements.length === 0
  const totalSpent = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)

  const fullSummary =
    `Settlement Summary for "${group.name}"\n${'─'.repeat(32)}\n` +
    settlements.map(s => `${s.from.name} pays ${s.to.name} ₹${s.amount.toFixed(2)}`).join('\n') +
    `\n${'─'.repeat(32)}\nTotal payments: ${settlements.length}`

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSummary).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-4 animate-fadeInUp">

      {/* ── Net Balances ─────────────────────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1.5px solid #EDE9FE',
        boxShadow: '0 4px 24px rgba(124,58,237,0.09)',
      }}>
        {/* Card header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid #F5F3FF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 900, fontSize: 17, color: '#1e0a3c', margin: 0,
            }}>Net Balances</h3>
            <p style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600, margin: '2px 0 0' }}>
              {members.length} members · ₹{totalSpent.toLocaleString('en-IN')} total
            </p>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
          }}>⚖️</div>
        </div>

        {/* Member rows */}
        <div style={{ padding: '10px 14px 14px' }}>
          {members.map((member, i) => {
            const balance = Math.round((balances[member.id] || 0) * 100) / 100
            const isPos = balance > 0.01
            const isNeg = balance < -0.01
            const [avatarBg, avatarLight] = AVATAR_COLORS[i % AVATAR_COLORS.length]

            return (
              <div key={member.id} style={{
                display: 'flex', alignItems: 'center',
                padding: '11px 12px', borderRadius: 16, marginBottom: 8,
                background: isPos ? '#F0FDF4' : isNeg ? '#FFF1F2' : '#F8F7FF',
                border: `1.5px solid ${isPos ? '#BBF7D0' : isNeg ? '#FECDD3' : '#EDE9FE'}`,
                transition: 'all 0.2s',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: avatarBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 900, fontSize: 15,
                  boxShadow: `0 2px 8px ${avatarBg}55`,
                }}>
                  {member.name[0].toUpperCase()}
                </div>

                {/* Name + status */}
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#1e0a3c', margin: 0 }}>{member.name}</p>
                  <p style={{
                    fontSize: 11, fontWeight: 700, margin: '2px 0 0',
                    color: isPos ? '#16a34a' : isNeg ? '#e11d48' : '#7C3AED',
                  }}>
                    {isPos ? '↑ gets back money' : isNeg ? '↓ owes money' : '✓ all settled'}
                  </p>
                </div>

                {/* Amount pill */}
                <div style={{
                  padding: '5px 14px', borderRadius: 99,
                  background: isPos ? '#DCFCE7' : isNeg ? '#FFE4E6' : avatarLight,
                  border: `1px solid ${isPos ? '#86EFAC' : isNeg ? '#FECDD3' : '#DDD6FE'}`,
                }}>
                  <span style={{
                    fontWeight: 900, fontSize: 15,
                    color: isPos ? '#16a34a' : isNeg ? '#e11d48' : '#7C3AED',
                  }}>
                    {isPos ? '+' : isNeg ? '-' : ''}₹{Math.abs(balance).toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── How to Settle Up ─────────────────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1.5px solid #EDE9FE',
        boxShadow: '0 4px 24px rgba(124,58,237,0.09)',
      }}>
        {/* Card header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid #F5F3FF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 900, fontSize: 17, color: '#1e0a3c', margin: 0,
            }}>How to Settle Up</h3>
            <p style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600, margin: '2px 0 0' }}>
              {allSettled ? 'All payments cleared 🎉' : `${settlements.length} payment${settlements.length !== 1 ? 's' : ''} needed`}
            </p>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 14,
            background: allSettled
              ? 'linear-gradient(135deg,#059669,#047857)'
              : 'linear-gradient(135deg,#F59E0B,#D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: allSettled
              ? '0 4px 12px rgba(5,150,105,0.35)'
              : '0 4px 12px rgba(245,158,11,0.35)',
          }}>
            {allSettled ? '✅' : '💸'}
          </div>
        </div>

        <div style={{ padding: '14px 16px 18px' }}>
          {allSettled ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🎊</div>
              <p style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 900, fontSize: 20, color: '#059669', margin: 0,
              }}>All settled up!</p>
              <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6, fontWeight: 500 }}>
                No outstanding balances.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {settlements.map((s, i) => (
                <div key={i} style={{
                  borderRadius: 18, overflow: 'hidden',
                  border: '1.5px solid #FEF3C7',
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)',
                  padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 2px 10px rgba(245,158,11,0.08)',
                }}>
                  {/* From */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#FCA5A5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 900, fontSize: 14, flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                    }}>
                      {s.from.name[0].toUpperCase()}
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 14, color: '#1e0a3c', margin: 0 }}>
                      {s.from.name}
                    </p>
                  </div>

                  {/* Arrow + amount */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <span style={{ fontWeight: 900, fontSize: 14, color: '#D97706' }}>
                      ₹{s.amount.toFixed(2)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg,#F59E0B,#D97706)', borderRadius: 2 }} />
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5h6M5 2l3 3-3 3" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* To */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, justifyContent: 'flex-end' }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: '#1e0a3c', margin: 0 }}>
                      {s.to.name}
                    </p>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#6EE7B7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 900, fontSize: 14, flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                    }}>
                      {s.to.name[0].toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Settlement Summary (collapsible) ─────────────── */}
      {!allSettled && (
        <div style={{
          background: 'white', borderRadius: 24, overflow: 'hidden',
          border: '1.5px solid #EDE9FE',
          boxShadow: '0 4px 24px rgba(124,58,237,0.09)',
        }}>
          <button
            onClick={() => setShowSummary(p => !p)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '16px 22px',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FAF9FF'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: '#F5F3FF', border: '1.5px solid #EDE9FE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
              }}>📋</div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: '#1e0a3c', margin: 0 }}>
                  Settlement Summary
                </p>
                <p style={{ fontSize: 12, color: '#a78bfa', margin: '1px 0 0', fontWeight: 600 }}>
                  {settlements.length} payment{settlements.length !== 1 ? 's' : ''} to settle all debts
                </p>
              </div>
            </div>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#F5F3FF', border: '1.5px solid #EDE9FE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: showSummary ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
              flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2.5 4.5l4 4 4-4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {showSummary && (
            <div style={{ borderTop: '1px solid #F5F3FF' }}>
              {/* Summary header */}
              <div style={{
                padding: '14px 22px',
                background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ color: 'white', fontWeight: 900, fontSize: 15, margin: 0,
                    fontFamily: 'Bricolage Grotesque, sans-serif' }}>{group.name}</p>
                  <p style={{ color: '#c4b5fd', fontSize: 11, margin: '1px 0 0', fontWeight: 600 }}>Settlement Review</p>
                </div>
                <span style={{ fontSize: 26 }}>🧾</span>
              </div>

              {/* Settlement rows */}
              <div style={{ padding: '10px 16px 4px' }}>
                {settlements.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 8px',
                    borderBottom: i < settlements.length - 1 ? '1px solid #F5F3FF' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#EDE9FE', color: '#7C3AED',
                        fontSize: 11, fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>{i + 1}</div>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                        <span style={{ fontWeight: 800, color: '#1e0a3c' }}>{s.from.name}</span>
                        <span style={{ color: '#9ca3af', margin: '0 5px' }}>→</span>
                        <span style={{ fontWeight: 800, color: '#1e0a3c' }}>{s.to.name}</span>
                      </span>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 14, color: '#7C3AED' }}>
                      ₹{s.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total row */}
              <div style={{
                margin: '8px 16px 16px',
                padding: '12px 18px',
                background: '#EDE9FE', borderRadius: 14,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#7C3AED' }}>Total to settle</span>
                <span style={{ fontWeight: 900, fontSize: 17, color: '#6D28D9' }}>
                  ₹{settlements.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
                </span>
              </div>

              {/* Copy button */}
              <div style={{ padding: '0 16px 18px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 14, cursor: 'pointer',
                    fontWeight: 800, fontSize: 14, transition: 'all 0.25s',
                    border: `2px solid ${copied ? '#86EFAC' : '#DDD6FE'}`,
                    background: copied ? '#F0FDF4' : '#F5F3FF',
                    color: copied ? '#16a34a' : '#7C3AED',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {copied ? (
                    <>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      Copied to clipboard!
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Copy to Share
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
