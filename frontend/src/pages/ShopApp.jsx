import { useCallback, useEffect, useState } from "react";
import { productApi, billApi, reportApi } from "../api/billing";

const money = (v) => Number(v || 0).toFixed(2);
const fmtDate = (v) => (v ? new Date(v).toLocaleString() : "");

export default function ShopApp() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [dash, setDash] = useState(null);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [cart, setCart] = useState([]);
  const [qty, setQty] = useState({});
  const [bill, setBill] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");

  const load = useCallback(() => {
    productApi.list().then(r => {
      let d = r.data; if (d && d.data) d = d.data;
      setProducts(Array.isArray(d) ? d : []);
    }).catch(e => setErr(e.message || "Could not load products"));

    billApi.list().then(r => {
      let d = r.data; if (d && d.data) d = d.data;
      setBills(Array.isArray(d) ? d : []);
    }).catch(() => {});

    reportApi.dashboard().then(r => {
      let d = r.data; if (d && d.data) d = d.data;
      setDash(d || null);
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const addToCart = (p) => {
    if (!cart.find(c => c.id === p.id)) {
      setCart([...cart, { id: p.id, name: p.productName, price: Number(p.price) }]);
      setQty({ ...qty, [p.id]: 1 });
    }
    setBill(null); setErr(""); setMsg("");
  };

  const setQ = (id, v) => {
    const n = parseInt(v, 10);
    const qv = Number.isFinite(n) && n > 0 ? n : 1;
    setQty({ ...qty, [id]: qv }); setBill(null);
  };

  const remove = (id) => {
    setCart(cart.filter(c => c.id !== id));
    const m = { ...qty }; delete m[id]; setQty(m); setBill(null);
  };

  const sub = cart.reduce((s, c) => s + Number(c.price) * Number(qty[c.id] || 1), 0);
  const disc = sub > 1000 ? sub * 0.1 : 0;
  const fin = sub - disc;

  const gen = async () => {
    setErr(""); setMsg("");
    if (!custName.trim()) { setErr("Enter customer name"); return; }
    if (cart.length === 0) { setErr("Select products"); return; }
    try {
      const res = await billApi.create({
        customerName: custName.trim(),
        phone: custPhone.trim(),
        items: cart.map(c => ({ productId: c.id, quantity: qty[c.id] || 1 }))
      });
      let b = res.data; if (b && b.data) b = b.data;
      setBill(b);
      setMsg("Bill saved");
      load();
      return b;
    } catch (e) {
      setErr(e.message || "Could not generate the bill");
      return null;
    }
  };

  // Printing an empty page would be useless, so the receipt is generated
  // first when the user presses Print before Generate Bill.
  const print = async () => {
    const b = bill || await gen();
    if (!b) return;
    setTimeout(() => window.print(), 60);
  };

  const clear = () => {
    setCart([]); setQty({}); setBill(null); setCustName(""); setCustPhone(""); setErr(""); setMsg("");
  };

  const addProd = async () => {
    setErr(""); setMsg("");
    const price = Number(prodPrice);
    if (!prodName.trim() || !prodPrice) { setErr("Enter product name and price"); return; }
    if (!Number.isFinite(price) || price <= 0) { setErr("Price must be a number greater than zero"); return; }
    try {
      await productApi.add({ productName: prodName.trim(), price });
      setProdName(""); setProdPrice("");
      setMsg("Product added");
      load();
    } catch (e) {
      setErr(e.message || "Could not add the product");
    }
  };

  // The dashboard comes from the backend; fall back to what this page has loaded
  // when the report endpoint cannot be reached.
  const todayStr = new Date().toDateString();
  const totalProducts = dash ? Number(dash.totalProducts || 0) : products.length;
  const totalBills = dash ? Number(dash.totalBills || 0) : bills.length;
  const todayBills = dash ? Number(dash.todayBills || 0)
    : bills.filter(b => new Date(b.billDate).toDateString() === todayStr).length;
  const revenue = dash ? Number(dash.totalRevenue || 0)
    : bills.reduce((s, b) => s + Number(b.finalAmount || 0), 0);

  return (
    <div className="sp">
      <div className="sp-side">
        <div className="sp-logo">SMART SHOP</div>
        <div className="sp-nav">
          <div className={tab === "dashboard" ? "sp-a sp-on" : "sp-a"} onClick={() => setTab("dashboard")}>Dashboard</div>
          <div className={tab === "bill" ? "sp-a sp-on" : "sp-a"} onClick={() => setTab("bill")}>Create Bill</div>
          <div className={tab === "hist" ? "sp-a sp-on" : "sp-a"} onClick={() => setTab("hist")}>Billing History</div>
          <div className={tab === "prod" ? "sp-a sp-on" : "sp-a"} onClick={() => setTab("prod")}>Products</div>
        </div>
      </div>
      <div className="sp-main">
        <div className="sp-top">Billing & Management System</div>
        <div className="sp-body">
          {tab === "dashboard" && (
            <div>
              <div className="sp-cards">
                <div className="sp-card"><div>Products</div><div className="sp-v">{totalProducts}</div></div>
                <div className="sp-card"><div>Bills</div><div className="sp-v">{totalBills}</div></div>
                <div className="sp-card"><div>Today Sales</div><div className="sp-v">{todayBills}</div></div>
                <div className="sp-card"><div>Revenue</div><div className="sp-v">₹{money(revenue)}</div></div>
              </div>
              <div className="sp-panel">
                <div className="sp-ph">Recent Transactions</div>
                {bills.length === 0 ? (
                  <div className="sp-empty">No bills yet.</div>
                ) : (
                  <table className="sp-t">
                    <thead><tr><th>Bill No</th><th>Customer</th><th>Amount</th><th>Date</th></tr></thead>
                    <tbody>
                      {bills.slice(0, 6).map(b => (
                        <tr key={b.id}><td>#{b.id}</td><td>{b.customerName}</td><td>₹{money(b.finalAmount)}</td><td>{fmtDate(b.billDate)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          {tab === "bill" && (
            <div>
              <div className="sp-grid">
                <div className="sp-panel">
                  <div className="sp-ph">Customer</div>
                  <input className="sp-in" placeholder="Customer Name" value={custName} onChange={e => { setCustName(e.target.value); setBill(null); }} />
                  <input className="sp-in" placeholder="Phone (optional)" value={custPhone} onChange={e => setCustPhone(e.target.value)} />
                </div>
                <div className="sp-panel">
                  <div className="sp-ph">Products</div>
                  <div className="sp-list">
                    {products.map(p => (
                      <div className="sp-row" key={p.id}><div>{p.productName} - ₹{money(p.price)}</div><button onClick={() => addToCart(p)}>Add</button></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sp-panel" style={{ marginTop: 10 }}>
                <div className="sp-ph">Bill Items</div>
                <table className="sp-t">
                  <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
                  <tbody>
                    {cart.map(c => (
                      <tr key={c.id}><td>{c.name}</td><td>₹{money(c.price)}</td><td><input className="sp-q" type="number" min="1" value={qty[c.id] || 1} onChange={e => setQ(c.id, e.target.value)} /></td><td>₹{money(Number(c.price) * (qty[c.id] || 1))}</td><td><button onClick={() => remove(c.id)}>X</button></td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="sp-sum">
                  <div>Subtotal: ₹{money(sub)}</div>
                  <div>Discount: {sub > 1000 ? '10%' : '0%'} ₹{money(disc)}</div>
                  <div className="sp-f">Final: ₹{money(fin)}</div>
                </div>
                <div className="sp-actions">
                  <button className="sp-b sp-b1" onClick={gen}>Generate Bill</button>
                  <button className="sp-b sp-b2" onClick={print}>Print Bill</button>
                  <button className="sp-b sp-b3" onClick={clear}>Clear</button>
                </div>
                {err && <div className="sp-err">{err}</div>}
                {msg && <div className="sp-ok">{msg}</div>}
              </div>
              {bill && (
                <div className="sp-rec" id="sp-rec">
                  <div className="sp-rec-h"><div><b>SMART SHOP</b><div>Billing & Management System</div></div><div><div>Bill No: #{bill.id || '-'}</div><div>{fmtDate(bill.billDate)}</div></div></div>
                  <div>Customer: {bill.customerName}{bill.phone ? ' | ' + bill.phone : ''}</div>
                  <table className="sp-t" style={{ marginTop: 8 }}>
                    <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
                    <tbody>
                      {(bill.items || []).map((it, i) => (<tr key={i}><td>{it.productName}</td><td>₹{money(it.price)}</td><td>{it.quantity}</td><td>₹{money(it.itemTotal)}</td></tr>))}
                    </tbody>
                  </table>
                  <div className="sp-rec-s">
                    <div>Subtotal: ₹{money(bill.subtotal)}</div>
                    <div>Discount ({bill.discountPercentage}%): ₹{money(bill.discountAmount)}</div>
                    <div className="sp-rec-f">Final: ₹{money(bill.finalAmount)}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "hist" && (
            <div className="sp-panel">
              <div className="sp-ph">Billing History</div>
              {bills.length === 0 ? (
                <div className="sp-empty">No bills yet.</div>
              ) : (
                <table className="sp-t">
                  <thead><tr><th>Bill No</th><th>Customer</th><th>Subtotal</th><th>Discount</th><th>Final</th><th>Date</th></tr></thead>
                  <tbody>
                    {bills.map(b => (
                      <tr key={b.id}><td>#{b.id}</td><td>{b.customerName}</td><td>₹{money(b.subtotal)}</td><td>₹{money(b.discountAmount)}</td><td>₹{money(b.finalAmount)}</td><td>{fmtDate(b.billDate)}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {tab === "prod" && (
            <div>
              <div className="sp-panel">
                <div className="sp-ph">Add Product</div>
                <div className="sp-ad">
                  <input className="sp-in" placeholder="Product Name" value={prodName} onChange={e => setProdName(e.target.value)} />
                  <input className="sp-in" placeholder="Price" type="number" min="0" value={prodPrice} onChange={e => setProdPrice(e.target.value)} />
                  <button className="sp-b sp-b1" onClick={addProd}>Add</button>
                </div>
                {err && <div className="sp-err">{err}</div>}
                {msg && <div className="sp-ok">{msg}</div>}
              </div>
              <div className="sp-panel" style={{ marginTop: 10 }}>
                <div className="sp-ph">Products List</div>
                <table className="sp-t">
                  <thead><tr><th>ID</th><th>Name</th><th>Price</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}><td>{p.id}</td><td>{p.productName}</td><td>₹{money(p.price)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .sp{display:flex;min-height:100vh;font-family:Arial;background:#f6f8fb}
        .sp-side{width:230px;background:#0f2a4a;color:#fff;display:flex;flex-direction:column}
        .sp-logo{padding:16px;font-weight:800}
        .sp-nav{display:flex;flex-direction:column}
        .sp-a{padding:10px 16px;cursor:pointer;color:#d7e3f5}
        .sp-on{background:#1f4e79;color:#fff}
        .sp-main{flex:1;display:flex;flex-direction:column}
        .sp-top{background:#fff;border-bottom:1px solid #e3e8f2;padding:12px 18px;font-weight:700}
        .sp-body{padding:16px;display:flex;flex-direction:column;gap:12px}
        .sp-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        .sp-card{background:#fff;border:1px solid #e3e8f2;border-radius:8px;padding:12px}
        .sp-v{font-size:22px;font-weight:800}
        .sp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .sp-panel{background:#fff;border:1px solid #e3e8f2;border-radius:8px;padding:12px}
        .sp-ph{font-weight:700;margin-bottom:8px}
        .sp-in{width:100%;padding:8px;border:1px solid #c9d3e6;border-radius:6px;margin-bottom:6px}
        .sp-list{display:grid;gap:6px;max-height:260px;overflow:auto}
        .sp-row{display:flex;justify-content:space-between;border:1px solid #e3e8f2;padding:6px 8px;border-radius:6px}
        .sp-t{width:100%;border-collapse:collapse}
        .sp-t th,.sp-t td{border:1px solid #e3e8f2;padding:7px}
        .sp-t th{background:#f7f9fc}
        .sp-q{width:70px;padding:5px}
        .sp-sum{display:grid;gap:4px;text-align:right;margin-top:10px}
        .sp-f{font-weight:800;color:#1a7f37;font-size:18px}
        .sp-actions{display:flex;gap:8px;margin-top:10px}
        .sp-b{border:none;padding:8px 12px;border-radius:6px;cursor:pointer}
        .sp-b1{background:#1f4e79;color:#fff}
        .sp-b2{background:#2563eb;color:#fff}
        .sp-b3{background:#e5e7eb}
        .sp-err{color:#d33}
        .sp-ok{color:#1a7f37}
        .sp-empty{color:#6b7280;padding:6px 0}
        .sp-rec{background:#fff;border:1px solid #e3e8f2;padding:12px;margin-top:10px}
        .sp-rec-h{display:flex;justify-content:space-between}
        .sp-rec-s{display:grid;gap:4px;text-align:right;margin-top:10px}
        .sp-rec-f{font-weight:800;color:#1a7f37;font-size:18px}
        .sp-ad{display:flex;gap:8px}
        @media print{
          body *{visibility:hidden}
          #sp-rec,#sp-rec *{visibility:visible}
          #sp-rec{position:absolute;left:0;top:0;width:100%;border:none;margin:0}
        }
      `}</style>
    </div>
  );
}
