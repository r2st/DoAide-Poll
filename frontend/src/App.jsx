import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Create from './pages/Create'
import Vote from './pages/Vote'
import Results from './pages/Results'
import Embed from './pages/Embed'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/poll/:id" element={<Vote />} />
        <Route path="/poll/:id/results" element={<Results />} />
        <Route path="/poll/:id/embed" element={<Embed />} />
      </Routes>
    </Layout>
  )
}
