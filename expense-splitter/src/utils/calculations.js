// utils/calculations.js
// Core logic for calculating who owes whom

/**
 * Calculate net balance for each member in a group.
 * Positive = they are owed money. Negative = they owe money.
 */
export function calculateBalances(members, expenses) {
  // Initialize all balances to 0
  const balances = {}
  members.forEach(m => { balances[m.id] = 0 })

  expenses.forEach(expense => {
    const { amount, paidBy, splitBetween, splitType, customAmounts } = expense
    const totalAmount = parseFloat(amount)

    if (splitType === 'equal') {
      // Equal split among selected members
      const share = totalAmount / splitBetween.length
      // Payer gets credited the full amount
      balances[paidBy] = (balances[paidBy] || 0) + totalAmount
      // Each person in split gets debited their share
      splitBetween.forEach(memberId => {
        balances[memberId] = (balances[memberId] || 0) - share
      })
    } else {
      // Custom split
      balances[paidBy] = (balances[paidBy] || 0) + totalAmount
      Object.entries(customAmounts || {}).forEach(([memberId, amt]) => {
        balances[memberId] = (balances[memberId] || 0) - parseFloat(amt || 0)
      })
    }
  })

  return balances
}

/**
 * Minimize the number of transactions needed to settle all debts.
 * Returns array of { from, to, amount } settlement transactions.
 */
export function calculateSettlements(members, expenses) {
  const balances = calculateBalances(members, expenses)

  // Create member lookup map for names
  const memberMap = {}
  members.forEach(m => { memberMap[m.id] = m.name })

  // Separate into creditors (positive) and debtors (negative)
  const creditors = []
  const debtors = []

  Object.entries(balances).forEach(([id, balance]) => {
    const rounded = Math.round(balance * 100) / 100
    if (rounded > 0.01) {
      creditors.push({ id, name: memberMap[id], amount: rounded })
    } else if (rounded < -0.01) {
      debtors.push({ id, name: memberMap[id], amount: Math.abs(rounded) })
    }
  })

  // Sort by amount descending for efficiency
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const settlements = []

  // Greedy algorithm to minimize transactions
  let i = 0, j = 0
  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i]
    const debt = debtors[j]
    const amount = Math.min(credit.amount, debt.amount)

    if (amount > 0.01) {
      settlements.push({
        from: { id: debt.id, name: debt.name },
        to: { id: credit.id, name: credit.name },
        amount: Math.round(amount * 100) / 100
      })
    }

    credit.amount -= amount
    debt.amount -= amount

    if (credit.amount < 0.01) i++
    if (debt.amount < 0.01) j++
  }

  return settlements
}

/**
 * Get spending summary by category for a group
 */
export function getCategorySummary(expenses) {
  const summary = {}
  expenses.forEach(expense => {
    const cat = expense.category || 'Other'
    summary[cat] = (summary[cat] || 0) + parseFloat(expense.amount)
  })
  return summary
}

/**
 * Get total spending in a group
 */
export function getTotalSpending(expenses) {
  return expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
}

/**
 * Get spending per person (how much each person has paid)
 */
export function getSpendingPerPerson(members, expenses) {
  const spending = {}
  members.forEach(m => { spending[m.id] = { name: m.name, paid: 0, share: 0 } })

  expenses.forEach(expense => {
    const amount = parseFloat(expense.amount)
    if (spending[expense.paidBy]) {
      spending[expense.paidBy].paid += amount
    }
    const share = amount / expense.splitBetween.length
    expense.splitBetween.forEach(id => {
      if (spending[id]) spending[id].share += share
    })
  })

  return spending
}
