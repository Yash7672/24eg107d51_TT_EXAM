import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import StatusDashboard from './pages/StatusDashboard.jsx';

/**
 * Routes of the application.
 * Add a new page here, for example:
 *
 *   import Products from './pages/Products.jsx';
 *   <Route path="/products" element={<Products />} />
 */
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/status" element={<StatusDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
