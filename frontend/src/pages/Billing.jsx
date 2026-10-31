import { useEffect, useState } from 'react';
import { productApi, billApi } from '../api/billing';

export default function Billing() {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [bill, setBill] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const billNo = 'BILL-' + Date.now().toString().slice(-6);

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
    setMsg('Added to bill');
    setTimeout(() => setMsg(''), 1000);
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

  const subtotalCalc = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  const discountCalc = subtotalCalc > 1000 ? subtotalCalc * 0.1 : 0;
  const finalCalc = subtotalCalc - discountCalc;

  const generate = async () => {
    setErr('');
    setMsg('');
    try {
      const payload = {
        customerName,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };
      const res = await billApi.calculate(payload);
      setBill(res.data?.data || res.data);
      setMsg('Bill generated');
      setTimeout(() => setMsg(''), 1200);
    } catch (e) {
      setBill(null);
      setErr(e?.message || 'Error');
    }
  };

  const clearAll = () => {
    setCustomerName('');
    setPhone('');
    setItems([]);
    setBill(null);
    setErr('');
    setMsg('');
  };

  const printBill = () => {
    window.print();
  };

  const filtered = products.filter(p => (p.productName || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="sb-wrap">
      <div className="sb-cards">
        <div className="sb-card"><div className="sb-card-t">Total Products</div><div className="sb-card-v">{products.length}</div></div>
        <div className="sb-card"><div className="sb-card-t">Current Bill Items</div><div className="sb-card-v">{items.length}</div></div>
        <div className="sb-card"><div className="sb-card-t">Subtotal</div><div className="sb-card-v">₹{subtotalCalc.toFixed(2)}</div></div>
        <div className="sb-card"><div className="sb-card-t">Discount</div><div className="sb-card-v">₹{discountCalc.toFixed(2)}</div></div>
        <div className="sb-card sb-card-green"><div className="sb-card-t">Final Payable</div><div className="sb-card-v">₹{finalCalc.toFixed(2)}</div></div>
      </div>

      {msg && <div className="sb-msg">{msg}</div>}
      {err && <div className="sb-err">{err}</div>}

      <div className="sb-grid">
        <div className="sb-panel">
          <div className="sb-panel-h">Customer Details</div>
          <div className="sb-row">
            <input className="sb-input" value={customerName} onChange={e => { setCustomerName(e.target.value); setBill(null); }} placeholder="Customer name" />
            <input className="sb-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
          </div>
          <div className="sb-info">Bill No: {billNo} | Date: {new Date().toLocaleString()}</div>
        </div>

        <div className="sb-panel">
          <div className="sb-panel-h">Product Management</div>
          <input className="sb-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products" />
          <div className="sb-prod">
            {filtered.map(p => (
              <div className="sb-prod-row" key={p.id}>
                <div>
                  <div className="sb-prod-n">{p.productName}</div>
                  <div className="sb-prod-p">₹{p.price}</div>
                </div>
                <button className="sb-btn sb-btn-blue" onClick={() => addItem(p)}>Add</button>
              </div>
            ))}
          </div>
        </div>

        <div className="sb-panel sb-panel-wide">
          <div className="sb-panel-h">Billing Section</div>
          {items.length === 0 ? <div className="sb-muted">No items added</div> : (
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Item Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.productId}>
                    <td>{i.productName}</td>
                    <td>₹{i.price}</td>
                    <td><input className="sb-qty" type="number" min="1" value={i.quantity} onChange={e => changeQty(i.productId, e.target.value)} /></td>
                    <td>₹{(Number(i.price)*Number(i.quantity)).toFixed(2)}</td>
                    <td><button className="sb-btn sb-btn-red" onClick={() => removeItem(i.productId)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="sb-sum">
            <div>Subtotal: ₹{subtotalCalc.toFixed(2)}</div>
            <div>Discount: {subtotalCalc > 1000 ? '10%' : '0%'} (₹{discountCalc.toFixed(2)})</div>
            <div className="sb-sum-final">Final Amount: ₹{finalCalc.toFixed(2)}</div>
          </div>
          <div className="sb-actions">
            <button className="sb-btn sb-btn-green" onClick={generate}>Generate Bill</button>
            <button className="sb-btn sb-btn-blue" onClick={printBill}>Print Bill</button>
            <button className="sb-btn sb-btn-gray" onClick={clearAll}>Clear Bill</button>
          </div>
        </div>
      </div>

      {bill && (
        <div className="sb-receipt" id="sb-receipt">
          <div className="sb-receipt-h">
            <div>
              <div className="sb-receipt-title">SMART BILLING SYSTEM</div>
              <div>Billing Receipt</div>
            </div>
            <div className="sb-receipt-meta">
              <div>Bill No: {billNo}</div>
              <div>Date: {new Date().toLocaleString()}</div>
            </div>
          </div>
          <div className="sb-receipt-cust">
            <div>Customer: {bill.customerName}{phone ? ' | Phone: ' + phone : ''}</div>
          </div>
          <table className="sb-table sb-receipt-table">
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
          <div className="sb-receipt-sum">
            <div>Subtotal: ₹{bill.subtotal}</div>
            <div>Discount ({bill.discountPercentage}%): ₹{bill.discountAmount}</div>
            <div className="sb-receipt-final">Final Amount: ₹{bill.finalAmount}</div>
          </div>
        </div>
      )}
    </div>
  );
}
