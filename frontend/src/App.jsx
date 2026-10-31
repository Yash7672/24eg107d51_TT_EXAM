import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Billing from './pages/Billing.jsx';
import Shop from './pages/Shop.jsx';
import StatusDashboard from './pages/StatusDashboard.jsx';

/**
 * Two pages behind one fixed sidebar (see Layout):
 *   /          Shop     - predefined products with price + "Add to List"
 *   /billing   Billing  - the list with the bill calculation
 *   /status    Status   - connection status check (website, backend, database)
 *
 * The list (cart) and the customer live here, so the products added on the
 * Shop page are still there when the user opens the Billing page.
 */
export default function App() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });

  const addItem = (product, quantity) => {
    setCart(prev => {
      const found = prev.find(i => i.productId === product.id);
      if (found) {
        return prev.map(i => (i.productId === product.id ? { ...i, quantity } : i));
      }
      return [...prev, {
        productId: product.id,
        productName: product.productName,
        price: Number(product.price),
        quantity,
      }];
    });
  };

  const setQuantity = (productId, quantity) => {
    setCart(prev => prev.map(i => (i.productId === productId ? { ...i, quantity } : i)));
  };

  const removeItem = (productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer({ name: '', phone: '' });
  };

  return (
    <Routes>
      <Route path="/" element={<Layout cartCount={cart.length}>
        <Shop cart={cart} onAdd={addItem} onRemove={removeItem} />
      </Layout>} />
      <Route path="/billing" element={<Layout cartCount={cart.length}>
        <Billing
          cart={cart}
          customer={customer}
          setCustomer={setCustomer}
          onQuantity={setQuantity}
          onRemove={removeItem}
          onClear={clearCart}
        />
      </Layout>} />
      <Route path="/status" element={<Layout cartCount={cart.length}>
        <StatusDashboard />
      </Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
