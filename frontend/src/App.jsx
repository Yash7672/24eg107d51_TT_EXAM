import { Route, Routes } from 'react-router-dom';
import ShopApp from './pages/ShopApp.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ShopApp />} />
      <Route path="*" element={<ShopApp />} />
    </Routes>
  );
}
