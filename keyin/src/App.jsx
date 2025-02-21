import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Game from './pages/Game';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/samaragoroad" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;