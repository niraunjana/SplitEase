// utils/storage.js
// All data is stored in localStorage so it persists between page refreshes

const STORAGE_KEY = 'expense_splitter_groups'

// Get all groups from storage
export function getGroups() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Save all groups to storage
export function saveGroups(groups) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
}

// Get a single group by ID
export function getGroupById(id) {
  const groups = getGroups()
  return groups.find(g => g.id === id) || null
}

// Create a new group
export function createGroup(name, members) {
  const groups = getGroups()
  const newGroup = {
    id: Date.now().toString(),
    name,
    members: members.map((m, i) => ({
      id: `${Date.now()}_${i}`,
      name: m.trim()
    })),
    expenses: [],
    createdAt: new Date().toISOString()
  }
  groups.push(newGroup)
  saveGroups(groups)
  return newGroup
}

// Update a group
export function updateGroup(updatedGroup) {
  const groups = getGroups()
  const idx = groups.findIndex(g => g.id === updatedGroup.id)
  if (idx !== -1) {
    groups[idx] = updatedGroup
    saveGroups(groups)
  }
  return updatedGroup
}

// Delete a group
export function deleteGroup(id) {
  const groups = getGroups().filter(g => g.id !== id)
  saveGroups(groups)
}

// Add an expense to a group
export function addExpense(groupId, expense) {
  const groups = getGroups()
  const group = groups.find(g => g.id === groupId)
  if (!group) return null

  const newExpense = {
    id: Date.now().toString(),
    ...expense,
    date: new Date().toISOString()
  }
  group.expenses.push(newExpense)
  saveGroups(groups)
  return newExpense
}

// Delete an expense
export function deleteExpense(groupId, expenseId) {
  const groups = getGroups()
  const group = groups.find(g => g.id === groupId)
  if (!group) return
  group.expenses = group.expenses.filter(e => e.id !== expenseId)
  saveGroups(groups)
}
