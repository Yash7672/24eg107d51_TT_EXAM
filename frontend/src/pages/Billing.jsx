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
  const billNo = 'SB-' + Date.now().toString().slice(-8);

  useEffect(() => {
    productApi.list()
      .then(res => {
        const data = res.data?.data || res.data || [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(e => setErr(e?.message || 'Failed to load products'));
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
    setMsg('Item added');
    setTimeout(() => setMsg(''), 900);
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
    if (!customerName.trim()) {
      setErr('Enter customer name');
      return;
    }
    if (items.length === 0) {
      setErr('Add at least one product');
      return;
    }
    try {
      const payload = {
        customerName,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };
      const res = await billApi.calculate(payload);
      setBill(res.data?.data || res.data);
      setMsg('Bill generated successfully');
      setTimeout(() => setMsg(''), 1200);
    } catch (e) {
      setBill(null);
      setErr(e?.message || 'Error generating bill');
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
    <div className="sb2-wrap">
      <div className="sb2-title">SMART BILLING SYSTEM</div>
      <div className="sb2-sub">Billing Management Dashboard</div>

      <div className="sb2-cards">
        <div className="sb2-card"><div>Total Products</div><div className="sb2-v">{products.length}</div></div>
        <div className="sb2-card"><div>Bill Items</div><div className="sb2-v">{items.length}</div></div>
        <div className="sb2-card"><div>Subtotal</div><div className="sb2-v">₹{subtotalCalc.toFixed(2)}</div></div>
        <div className="sb2-card"><div>Discount</div><div className="sb2-v">₹{discountCalc.toFixed(2)}</div></div>
        <div className="sb2-card sb2-card-g"><div>Final Payable</div><div className="sb2-v">₹{finalCalc.toFixed(2)}</div></div>
      </div>

      {msg && <div className="sb2-ok">{msg}</div>}
      {err && <div className="sb2-bad">{err}</div>}

      <div className="sb2-grid">
        <div className="sb2-panel">
          <div className="sb2-ph">Customer Details</div>
          <input className="sb2-inp" value={customerName} onChange={e => { setCustomerName(e.target.value); setBill(null); }} placeholder="Customer Name" />
          <input className="sb2-inp" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number (optional)" />
          <div className="sb2-meta">Bill No: {billNo} | {new Date().toLocaleString()}</div>
        </div>

        <div className="sb2-panel">
          <div className="sb2-ph">Products</div>
          <input className="sb2-inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product" />
          <div className="sb2-list">
            {filtered.map(p => (
              <div className="sb2-row" key={p.id}>
                <div><div className="sb2-n">{p.productName}</div><div className="sb2-p">₹{p.price}</div></div>
                <button className="sb2-b sb2-b1" onClick={() => addItem(p)}>Add to Bill</button>
              </div>
            ))}
          </div>
        </div>

        <div className="sb2-panel sb2-wide">
          <div className="sb2-ph">Billing</div>
          {items.length === 0 ? <div className="sb2-m">No products added</div> : (
            <table className="sb2-t">
              <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Item Total</th><th></th></tr></thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.productId}>
                    <td>{i.productName}</td>
                    <td>₹{i.price}</td>
                    <td><input className="sb2-q" type="number" min="1" value={i.quantity} onChange={e => changeQty(i.productId, e.target.value)} /></td>
                    <td>₹{(Number(i.price)*Number(i.quantity)).toFixed(2)}</td>
                    <td><button className="sb2-b sb2-b2" onClick={() => removeItem(i.productId)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="sb2-sum">
            <div>Subtotal: ₹{subtotalCalc.toFixed(2)}</div>
            <div>Discount ({subtotalCalc>1000?'10%':'0%'}): ₹{discountCalc.toFixed(2)}</div>
            <div className="sb2-f">Final Amount: ₹{finalCalc.toFixed(2)}</div>
          </div>
          <div className="sb2-act">
            <button className="sb2-b sb2-b3" onClick={generate}>Generate Bill</button>
            <button className="sb2-b sb2-b1" onClick={printBill}>Print Bill</button>
            <button className="sb2-b sb2-b4" onClick={clearAll}>Clear Bill</button>
          </div>
        </div>
      </div>

      {bill && (
        <div className="sb2-rec" id="print-rec">
          <div className="sb2-rec-h">
            <div>
              <div className="sb2-rec-t">SMART BILLING SYSTEM</div>
              <div>Shop Billing Receipt</div>
            </div>
            <div className="sb2-rec-m"><div>Bill No: {billNo}</div><div>{new Date().toLocaleString()}</div></div>
          </div>
          <div className="sb2-rec-c">Customer: {bill.customerName}{phone?' | Phone: '+phone:''}</div>
          <table className="sb2-t sb2-rec-t2">
            <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Item Total</th></tr></thead>
            <tbody>
              {(bill.items||[]).map((it,idx)=>(
                <tr key={idx}><td>{it.productName}</td><td>₹{it.price}</td><td>{it.quantity}</td><td>₹{it.itemTotal}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="sb2-rec-s">
            <div>Subtotal: ₹{bill.subtotal}</div>
            <div>Discount ({bill.discountPercentage}%): ₹{bill.discountAmount}</div>
            <div className="sb2-rec-f">Final Amount: ₹{bill.finalAmount}</div>
          </div>
        </div>
      )}
    </div>
  );
}
