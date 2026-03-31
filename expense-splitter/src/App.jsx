// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import GroupDetail from './pages/GroupDetail'
import AIAssistant from './components/AIAssistant'    // ← ADD THIS

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/group/:id" element={<GroupDetail />} />
      </Routes>
      <AIAssistant />                                  {/* ← ADD THIS */}
    </Router>
  )
}

export default App