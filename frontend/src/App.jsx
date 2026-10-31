import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Billing from './pages/Billing.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Billing />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
