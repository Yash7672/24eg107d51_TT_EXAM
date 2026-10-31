import { useEffect, useState } from 'react';
import { productApi, billApi } from '../api/billing';

export default function Billing() {
  const [customerName, setCustomerName] = useState('');
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [bill, setBill] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    productApi.list()
      .then(res => {
        const data = res.data?.data || res.data || [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(e => setErr(e?.message || 'Failed to load'));
  }, []);

  const addItem = (p) => {
    const exists = items.find(i => i.productId === p.id);
    if (exists) {
      setItems(items.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { productId: p.id, productName: p.productName, price: p.price, quantity: 1 }]);
    }
    setBill(null);
    setErr('');
  };

  const changeQty = (id, qty) => {
    const q = Number(qty);
    if (q <= 0) {
      setItems(items.filter(i => i.productId !== id));
    } else {
      setItems(items.map(i => i.productId === id ? { ...i, quantity: q } : i));
    }
    setBill(null);
    setErr('');
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.productId !== id));
    setBill(null);
    setErr('');
  };

  const generate = async () => {
    setErr('');
    try {
      const payload = {
        customerName,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };
      const res = await billApi.calculate(payload);
      setBill(res.data?.data || res.data);
    } catch (e) {
      setBill(null);
      setErr(e?.message || 'Error');
    }
  };

  const clearAll = () => {
    setCustomerName('');
    setItems([]);
    setBill(null);
    setErr('');
  };

  const printBill = () => {
    window.print();
  };

  const dateStr = new Date().toLocaleString();

  return (
    <div className="bill-wrap">
      <div className="bill-header">
        <div>
          <h1>SMART SHOP</h1>
          <div>Simple Billing System</div>
        </div>
        <div>{dateStr}</div>
      </div>

      <div className="bill-grid">
        <div className="bill-card">
          <h2>Customer</h2>
          <input className="bill-input" value={customerName} onChange={e => { setCustomerName(e.target.value); setBill(null); }} placeholder="Customer name" />
        </div>

        <div className="bill-card">
          <h2>Products</h2>
          <div className="prod-list">
            {products.map(p => (
              <div className="prod-row" key={p.id}>
                <div>
                  <div>{p.productName}</div>
                  <div className="muted">₹{p.price}</div>
                </div>
                <button className="btn btn-primary" onClick={() => addItem(p)}>Add</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bill-card">
          <h2>Bill Items</h2>
          {items.length === 0 ? <div className="muted">No items</div> : (
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.productId}>
                    <td>{i.productName}</td>
                    <td>₹{i.price}</td>
                    <td><input className="qty-input" type="number" min="1" value={i.quantity} onChange={e => changeQty(i.productId, e.target.value)} /></td>
                    <td><button className="btn btn-secondary" onClick={() => removeItem(i.productId)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="bill-actions">
            <button className="btn btn-primary" onClick={generate}>Generate Bill</button>
            <button className="btn btn-secondary" onClick={clearAll}>Clear Bill</button>
            <button className="btn btn-secondary" onClick={printBill}>Print Bill</button>
          </div>
          {err && <div className="bill-err">{err}</div>}
        </div>
      </div>

      {bill && (
        <div className="bill-card receipt" id="receipt">
          <div className="receipt-head">
            <div>
              <h2>SMART SHOP</h2>
              <div>Simple Billing System</div>
            </div>
            <div>{dateStr}</div>
          </div>
          <div>Customer: {bill.customerName}</div>
          <table className="bill-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Item Total</th>
              </tr>
            </thead>
            <tbody>
              {(bill.items || []).map((it, idx) => (
                <tr key={idx}>
                  <td>{it.productName}</td>
                  <td>₹{it.price}</td>
                  <td>{it.quantity}</td>
                  <td>₹{it.itemTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="receipt-sum">
            <div>Subtotal: ₹{bill.subtotal}</div>
            <div>Discount ({bill.discountPercentage}%): ₹{bill.discountAmount}</div>
            <div className="receipt-final">Final Amount: ₹{bill.finalAmount}</div>
          </div>
        </div>
      )}
    </div>
  );
}
