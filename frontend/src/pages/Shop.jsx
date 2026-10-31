import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/billing';

const money = (v) => Number(v || 0).toFixed(2);

const DEFAULT_PRODUCTS = [
  { id: 1, productName: 'Rice', price: 60.00 },
  { id: 2, productName: 'Sugar', price: 45.00 },
  { id: 3, productName: 'Oil', price: 150.00 },
  { id: 4, productName: 'Milk', price: 30.00 },
  { id: 5, productName: 'Soap', price: 40.00 },
  { id: 6, productName: 'Biscuits', price: 20.00 },
  { id: 7, productName: 'Tea Powder', price: 120.00 },
  { id: 8, productName: 'Detergent', price: 90.00 },
];

/**
 * Shop page.
 *
 * The products (name + price) come from the backend. Every row has an
 * "Add to List" button that first asks for the quantity and only then puts
 * the product into the list, which the Billing page then shows.
 */
export default function Shop({ cart, onAdd, onRemove }) {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [asking, setAsking] = useState(null);   // id of the product whose quantity is being entered
  const [qtyInput, setQtyInput] = useState('1');

  useEffect(() => {
    productApi.list()
      .then(r => {
        let d = r.data;
        if (d && d.data) d = d.data;
        if (Array.isArray(d) && d.length > 0) {
          setProducts(d);
        }
      })
      .catch(() => {
        // Fallback to default predefined products if backend is starting up
        setProducts(DEFAULT_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const inList = (id) => cart.find(i => i.productId === id);

  const openPrompt = (p) => {
    setErr('');
    const item = inList(p.id);
    setQtyInput(String(item ? item.quantity : 1));
    setAsking(p.id);
  };

  const confirmAdd = (p) => {
    const q = parseInt(qtyInput, 10);
    if (!Number.isFinite(q) || q < 1) {
      setErr('Quantity must be at least 1');
      return;
    }
    onAdd(p, q);
    setAsking(null);
    setErr('');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Shop</h1>
          <p className="muted">Press <b>Add to List</b> on a product and enter the quantity.</p>
        </div>
        <Link className="page-link" to="/billing">
          Go to Billing ({cart.length})
        </Link>
      </div>

      {err && <div className="sb2-bad">{err}</div>}

      <div className="sb2-panel">
        <div className="sb2-ph">Products</div>
        {loading ? (
          <div className="sb2-m">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="sb2-m">No products available.</div>
        ) : (
          <table className="sb2-t">
            <thead>
              <tr><th>Product</th><th>Price</th><th>Add to List</th></tr>
            </thead>
            <tbody>
              {products.map(p => {
                const item = inList(p.id);
                return (
                  <tr key={p.id}>
                    <td>{p.productName}</td>
                    <td>₹{money(p.price)}</td>
                    <td>
                      {asking === p.id ? (
                        <span className="shop-q">
                          <span className="shop-ql">Quantity</span>
                          <input
                            className="sb2-q"
                            type="number"
                            min="1"
                            autoFocus
                            value={qtyInput}
                            onChange={e => setQtyInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmAdd(p); }}
                          />
                          <button className="sb2-b sb2-b1" onClick={() => confirmAdd(p)}>Add</button>
                          <button className="sb2-b sb2-b4" onClick={() => setAsking(null)}>Cancel</button>
                        </span>
                      ) : item ? (
                        <span className="shop-q">
                          <span className="shop-ok">✓ In list · Qty {item.quantity}</span>
                          <button className="sb2-b sb2-b1" onClick={() => openPrompt(p)}>Change</button>
                          <button className="sb2-b sb2-b2" onClick={() => { setAsking(null); onRemove(p.id); }}>Remove</button>
                        </span>
                      ) : (
                        <button className="sb2-b sb2-b1" onClick={() => openPrompt(p)}>Add to List</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {cart.length > 0 && (
        <div className="page-bar">
          <span>{cart.length} product{cart.length > 1 ? 's' : ''} in your list.</span>
          <Link className="page-link" to="/billing">Open Billing →</Link>
        </div>
      )}
    </div>
  );
}
