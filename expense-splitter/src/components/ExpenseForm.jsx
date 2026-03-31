// components/ExpenseForm.jsx
// Form to add a new expense with smart category detection

import { useState, useEffect } from 'react'
import { addExpense } from '../utils/storage'
import { detectCategory, CATEGORIES } from '../utils/categories'

export default function ExpenseForm({ group, onAdded, onCancel }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(group.members[0]?.id || '')
  const [splitType, setSplitType] = useState('equal') // 'equal' or 'custom'
  const [splitBetween, setSplitBetween] = useState(group.members.map(m => m.id)) // all selected by default
  const [customAmounts, setCustomAmounts] = useState({})
  const [category, setCategory] = useState('other')
  const [autoDetected, setAutoDetected] = useState(false)
  const [error, setError] = useState('')

  // Auto-detect category when description changes
  useEffect(() => {
    if (description.length > 2) {
      const detected = detectCategory(description)
      setCategory(detected)
      setAutoDetected(detected !== 'other')
    }
  }, [description])

  function toggleMember(memberId) {
    if (splitBetween.includes(memberId)) {
      if (splitBetween.length === 1) return // At least 1 person
      setSplitBetween(splitBetween.filter(id => id !== memberId))
    } else {
      setSplitBetween([...splitBetween, memberId])
    }
  }

  // Calculate per-person share for equal split
  const perPersonShare = splitBetween.length > 0 && amount
    ? (parseFloat(amount) / splitBetween.length).toFixed(2)
    : '0.00'

  // Validate custom amounts total
  const customTotal = Object.values(customAmounts).reduce((s, v) => s + parseFloat(v || 0), 0)
  const customDiff = amount ? Math.abs(customTotal - parseFloat(amount)) : 0

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!description.trim()) { setError('Please enter a description.'); return }
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount.'); return }
    if (!paidBy) { setError('Please select who paid.'); return }
    if (splitBetween.length === 0) { setError('Select at least one person to split with.'); return }

    if (splitType === 'custom') {
      if (customDiff > 0.01) {
        setError(`Custom amounts must add up to ₹${parseFloat(amount).toFixed(2)}. Current total: ₹${customTotal.toFixed(2)}.`)
        return
      }
    }

    addExpense(group.id, {
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitType,
      splitBetween,
      customAmounts: splitType === 'custom' ? customAmounts : null,
      category
    })

    onAdded()
  }

  const catInfo = CATEGORIES.find(c => c.id === category)

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Add Expense
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">For: {group.name}</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
        >✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Description + auto category */}
        <div>
          <label className="form-label">What was this for?</label>
          <div className="relative">
            <input
              type="text"
              className="input-field pr-24"
              placeholder="e.g. Dinner at Zomato, Uber to airport..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              autoFocus
              maxLength={80}
            />
            {description.length > 2 && (
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 badge ${catInfo?.className}`}>
                {catInfo?.label}
              </div>
            )}
          </div>
          {autoDetected && (
            <p className="text-xs text-indigo-500 mt-1 font-semibold">
              🤖 Auto-categorized as {catInfo?.label}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="form-label">Total Amount (₹)</label>
          <input
            type="number"
            className="input-field"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        {/* Paid by */}
        <div>
          <label className="form-label">Paid By</label>
          <select
            className="input-field"
            value={paidBy}
            onChange={e => setPaidBy(e.target.value)}
          >
            {group.members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Category (manual override) */}
        <div>
          <label className="form-label">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.id); setAutoDetected(false) }}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
                  category === cat.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Split type */}
        <div>
          <label className="form-label">Split Type</label>
          <div className="flex gap-2">
            {['equal', 'custom'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSplitType(type)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                  splitType === type
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-indigo-300'
                }`}
              >
                {type === 'equal' ? '⚖️ Equal Split' : '✏️ Custom Amounts'}
              </button>
            ))}
          </div>
        </div>

        {/* Split between (for equal split) */}
        {splitType === 'equal' && (
          <div>
            <label className="form-label">
              Split Between
              {amount && splitBetween.length > 0 && (
                <span className="ml-2 text-indigo-500 normal-case font-bold">
                  (₹{perPersonShare} each)
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {group.members.map((member, i) => {
                const selected = splitBetween.includes(member.id)
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      selected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: selected ? `hsl(${i * 60 + 200}, 65%, 55%)` : '#CBD5E1' }}
                    >
                      {member.name[0].toUpperCase()}
                    </div>
                    {member.name}
                    {selected && <span className="text-indigo-400">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Custom amounts */}
        {splitType === 'custom' && (
          <div>
            <label className="form-label">
              Custom Amounts
              {amount && (
                <span className={`ml-2 normal-case font-bold ${customDiff <= 0.01 ? 'text-green-500' : 'text-red-500'}`}>
                  {customDiff <= 0.01 ? '✓ Balanced' : `Difference: ₹${customDiff.toFixed(2)}`}
                </span>
              )}
            </label>
            <div className="space-y-2">
              {group.members.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700 w-24 flex-shrink-0 truncate">
                    {member.name}
                  </span>
                  <input
                    type="number"
                    className="input-field flex-1 py-2"
                    placeholder="0.00"
                    value={customAmounts[member.id] || ''}
                    onChange={e => setCustomAmounts({
                      ...customAmounts,
                      [member.id]: e.target.value
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary w-full py-3.5 text-base"
        >
          💸 Add Expense
        </button>
      </form>
    </div>
  )
}
