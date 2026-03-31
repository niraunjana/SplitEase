// components/ExpenseList.jsx
import { deleteExpense } from '../utils/storage'
import { getCategoryInfo } from '../utils/categories'

export default function ExpenseList({ group, onUpdate }) {
  const { expenses, members } = group

  function getMemberName(id) {
    return members.find(m => m.id === id)?.name || 'Unknown'
  }

  function getSplitNames(expense) {
    if (expense.splitType === 'equal') {
      return expense.splitBetween.map(id => getMemberName(id)).join(', ')
    }
    return Object.keys(expense.customAmounts || {}).map(id => getMemberName(id)).join(', ')
  }

  function handleDelete(expenseId) {
    if (confirm('Remove this expense?')) {
      deleteExpense(group.id, expenseId)
      onUpdate()
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 animate-fadeInUp">
        <div className="text-6xl mb-4 animate-float">🧾</div>
        <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          No expenses yet
        </h3>
        <p className="text-slate-400">Hit "Add Expense" to record your first shared cost.</p>
      </div>
    )
  }

  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-3 stagger-children">
      {sorted.map((expense) => {
        const catInfo = getCategoryInfo(expense.category || 'other')
        const payer = getMemberName(expense.paidBy)
        const isEqual = expense.splitType === 'equal'
        const perPerson = isEqual && expense.splitBetween?.length > 0
          ? (parseFloat(expense.amount) / expense.splitBetween.length).toFixed(2)
          : null

        return (
          <div
            key={expense.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-fadeInUp group"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left side */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Category icon circle — FIX: use catInfo.emoji not catInfo.label */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: catInfo.color + '22', border: `1px solid ${catInfo.color}44` }}
                >
                  {catInfo.emoji}
                </div>

                {/* Description + details */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{expense.description}</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Paid by <span className="font-semibold text-slate-600">{payer}</span>
                    {perPerson && (
                      <span> · ₹{perPerson}/person</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-300 mt-1 truncate">
                    Split: {getSplitNames(expense)}
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="font-extrabold text-slate-900 text-lg">
                  ₹{parseFloat(expense.amount).toFixed(2)}
                </span>
                {/* FIX: category badge uses inline style instead of broken className */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: catInfo.color + '22',
                    color: catInfo.color,
                    border: `1px solid ${catInfo.color}44`
                  }}
                >
                  {catInfo.emoji} {catInfo.label}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-500 text-xs font-bold p-1 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Custom amounts detail */}
            {expense.splitType === 'custom' && expense.customAmounts && (
              <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                {Object.entries(expense.customAmounts).map(([memberId, amt]) => (
                  <div key={memberId} className="bg-slate-50 rounded-lg px-2 py-1 text-xs">
                    <span className="text-slate-500">{getMemberName(memberId)}: </span>
                    <span className="font-bold text-slate-700">₹{parseFloat(amt).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
