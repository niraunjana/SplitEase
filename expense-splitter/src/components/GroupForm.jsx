// components/GroupForm.jsx
// Form to create a new group with members

import { useState } from 'react'
import { createGroup } from '../utils/storage'

export default function GroupForm({ onCreated, onCancel }) {
  const [groupName, setGroupName] = useState('')
  const [memberInput, setMemberInput] = useState('')
  const [members, setMembers] = useState([])
  const [error, setError] = useState('')

  function addMember() {
    const trimmed = memberInput.trim()
    if (!trimmed) return
    if (members.includes(trimmed)) {
      setError('Member already added!')
      return
    }
    if (members.length >= 20) {
      setError('Maximum 20 members allowed.')
      return
    }
    setMembers([...members, trimmed])
    setMemberInput('')
    setError('')
  }

  function removeMember(name) {
    setMembers(members.filter(m => m !== name))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addMember()
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!groupName.trim()) { setError('Please enter a group name.'); return }
    if (members.length < 2) { setError('Add at least 2 members.'); return }

    createGroup(groupName.trim(), members)
    onCreated()
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            New Group
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Add a name and members</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Group name */}
        <div>
          <label className="form-label">Group Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Goa Trip, Flat Expenses, Team Lunch..."
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            autoFocus
            maxLength={50}
          />
        </div>

        {/* Add members */}
        <div>
          <label className="form-label">Add Members</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Member name, then press Enter"
              value={memberInput}
              onChange={e => setMemberInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
            />
            <button
              type="button"
              onClick={addMember}
              className="btn-primary px-4 py-3 flex-shrink-0"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Members list */}
        {members.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">
              {members.length} member{members.length !== 1 ? 's' : ''} added
            </p>
            <div className="flex flex-wrap gap-2">
              {members.map((name, i) => (
                <div
                  key={name}
                  className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `hsl(${i * 60 + 200}, 65%, 55%)` }}
                  >
                    {name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-indigo-700">{name}</span>
                  <button
                    type="button"
                    onClick={() => removeMember(name)}
                    className="text-indigo-300 hover:text-red-500 transition-colors ml-1 font-bold"
                  >
                    ✕
                  </button>
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
          disabled={!groupName.trim() || members.length < 2}
          style={{ opacity: (!groupName.trim() || members.length < 2) ? 0.5 : 1 }}
        >
          ✨ Create Group
        </button>
      </form>
    </div>
  )
}
