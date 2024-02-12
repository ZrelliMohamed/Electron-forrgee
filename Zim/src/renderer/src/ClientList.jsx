import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import AppClientList from '../Onglet/AppClientList'
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<AppClientList />}></Route>
    </Routes>
  </HashRouter>
)
