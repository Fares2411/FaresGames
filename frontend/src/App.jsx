import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Register from './components/Register'
import AddRating from './components/AddRating'
import MyRatings from './components/MyRatings'
import TopGames from './components/TopGames'
import GamesByFilter from './components/GamesByFilter'
import TopGamesByMoby from './components/TopGamesByMoby'
import TopDevelopers from './components/TopDevelopers'
import DreamGame from './components/DreamGame'
import TopDirectors from './components/TopDirectors'
import TopCollaborations from './components/TopCollaborations'
import PlatformStats from './components/PlatformStats'
function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-rating" element={<AddRating />} />
          <Route path="/my-ratings" element={<MyRatings />} />
          <Route path="/top-games" element={<TopGames />} />
          <Route path="/games-filter" element={<GamesByFilter />} />
          <Route path="/top-moby" element={<TopGamesByMoby />} />
          <Route path="/top-developers" element={<TopDevelopers />} />
          <Route path="/dream-game" element={<DreamGame />} />
          <Route path="/top-directors" element={<TopDirectors />} />
          <Route path="/top-collaborations" element={<TopCollaborations />} />
          <Route path="/platform-stats" element={<PlatformStats />} />
        </Routes>
      </div>
    </Router>
  )
}
export default App