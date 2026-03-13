import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import IlRadar from './pages/IlRadar';
import Situazione from './pages/Situazione';
import Agenda from './pages/Agenda';
import Conversazione from './pages/Conversazione';
import Opportunita from './pages/Opportunita';
import Consumatore from './pages/Consumatore';
import Raccomandazioni from './pages/Raccomandazioni';
import Stampa from './pages/Stampa';
import Sintesi from './pages/Sintesi';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<IlRadar />} />
        <Route path="situazione" element={<Situazione />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="conversazione" element={<Conversazione />} />
        <Route path="opportunita" element={<Opportunita />} />
        <Route path="consumatore" element={<Consumatore />} />
        <Route path="raccomandazioni" element={<Raccomandazioni />} />
        <Route path="stampa" element={<Stampa />} />
        <Route path="sintesi" element={<Sintesi />} />
      </Route>
    </Routes>
  );
}
