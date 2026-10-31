import { Route, Routes } from 'react-router-dom';
import SimpleBilling from './pages/SimpleBilling.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SimpleBilling />} />
      <Route path="*" element={<SimpleBilling />} />
    </Routes>
  );
}
