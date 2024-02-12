import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import AppFournList from '../Onglet/AppFournList'
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<AppFournList />}></Route>
    </Routes>
  </HashRouter>
)
