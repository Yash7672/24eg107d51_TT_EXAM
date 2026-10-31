import { useEffect, useState } from "react";
import { productApi, billApi } from "../api/billing";

function SimpleBilling() {
  const [customerName, setCustomerName] = useState("");
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [qtyMap, setQtyMap] = useState({});
  const [bill, setBill] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    productApi.getProducts().then(res => {
      let data = res.data;
      if (data && data.data) data = data.data;
      setProducts(Array.isArray(data) ? data : []);
    }).catch(() => setErr("Failed to load products"));
  }, []);

  const toggle = (p) => {
    if (selected.find(x => x.id === p.id)) {
      setSelected(selected.filter(x => x.id !== p.id));
      let m = {...qtyMap};
      delete m[p.id];
      setQtyMap(m);
    } else {
      setSelected([...selected, p]);
      setQtyMap({...qtyMap, [p.id]: 1});
    }
    setBill(null);
    setErr("");
  };

  const setQty = (id, v) => {
    let q = Number(v);
    if (q < 1) q = 1;
    setQtyMap({...qtyMap, [id]: q});
    setBill(null);
    setErr("");
  };

  const itemTotal = (p) => {
    let q = qtyMap[p.id] || 1;
    return Number(p.price) * Number(q);
  };

  const subtotal = selected.reduce((s, p) => s + itemTotal(p), 0);
  const discount = subtotal > 1000 ? subtotal * 0.1 : 0;
  const finalAmt = subtotal - discount;

  const generate = async () => {
    setErr("");
    if (!customerName.trim()) { setErr("Enter customer name"); return; }
    if (selected.length === 0) { setErr("Select at least one product"); return; }
    try {
      let req = {
        customerName: customerName.trim(),
        items: selected.map(p => ({ productId: p.id, quantity: qtyMap[p.id] || 1 }))
      };
      let res = await billApi.calculateBill(req);
      let b = res.data;
      if (b && b.data) b = b.data;
      setBill(b);
    } catch (e) {
      setErr("Error generating bill");
    }
  };

  const printBill = () => {
    window.print();
  };

  return (
    <div className="sb">
      <div className="sb-head">
        <h1>SMART SHOP - BILLING</h1>
        <div>Simple Billing Application</div>
      </div>

      <div className="sb-row">
        <div className="sb-card">
          <h2>Customer Details</h2>
          <input className="sb-in" value={customerName} onChange={e => { setCustomerName(e.target.value); setBill(null); }} placeholder="Enter Customer Name" />
        </div>
      </div>

      <div className="sb-row">
        <div className="sb-card sb-wide">
          <h2>Products</h2>
          <table className="sb-t">
            <thead>
              <tr><th>Select</th><th>Product</th><th>Price (₹)</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><input type="checkbox" checked={!!selected.find(x=>x.id===p.id)} onChange={() => toggle(p)} /></td>
                  <td>{p.productName}</td>
                  <td>₹{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="sb-row">
          <div className="sb-card sb-wide">
            <h2>Enter Quantity</h2>
            <table className="sb-t">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Item Total</th></tr>
              </thead>
              <tbody>
                {selected.map(p => (
                  <tr key={p.id}>
                    <td>{p.productName}</td>
                    <td>₹{p.price}</td>
                    <td><input type="number" min="1" className="sb-q" value={qtyMap[p.id] || 1} onChange={e => setQty(p.id, e.target.value)} /></td>
                    <td>₹{itemTotal(p).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="sb-row">
        <div className="sb-card">
          <h2>Bill Calculation</h2>
          <div className="sb-s">Subtotal: ₹{subtotal.toFixed(2)}</div>
          <div className="sb-s">Discount: {subtotal > 1000 ? "10%" : "0%"} (₹{discount.toFixed(2)})</div>
          <div className="sb-f">Final Amount: ₹{finalAmt.toFixed(2)}</div>
          <div className="sb-btns">
            <button onClick={generate}>Generate Bill</button>
            <button onClick={printBill}>Print Bill</button>
          </div>
          {err && <div className="sb-err">{err}</div>}
        </div>
      </div>

      {bill && (
        <div className="sb-row" id="receipt">
          <div className="sb-card sb-wide">
            <div className="rc-h">
              <div>
                <h2>SMART SHOP</h2>
                <div>Bill Receipt</div>
              </div>
              <div>{new Date().toLocaleString()}</div>
            </div>
            <div className="rc-c">Customer Name: {bill.customerName}</div>
            <table className="sb-t">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Item Total</th></tr>
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
            <div className="rc-s">
              <div>Subtotal: ₹{bill.subtotal}</div>
              <div>Discount ({bill.discountPercentage}%): ₹{bill.discountAmount}</div>
              <div className="rc-f">Final Amount: ₹{bill.finalAmount}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sb { max-width: 1000px; margin: 0 auto; font-family: Arial; padding: 10px; }
        .sb-head { text-align: center; background: #1f4e79; color: #fff; padding: 12px; border-radius: 6px; }
        .sb-head h1 { margin: 0; }
        .sb-row { margin-top: 12px; }
        .sb-card { background: #fff; border: 1px solid #d0d7e2; border-radius: 6px; padding: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .sb-wide { width: 100%; }
        .sb-in { width: 300px; padding: 8px; border: 1px solid #b8c0cc; border-radius: 4px; }
        .sb-t { width: 100%; border-collapse: collapse; }
        .sb-t th, .sb-t td { border: 1px solid #cfd6e4; padding: 8px; text-align: left; }
        .sb-t th { background: #f4f6fb; }
        .sb-q { width: 70px; padding: 6px; }
        .sb-s { margin: 4px 0; }
        .sb-f { font-size: 18px; font-weight: bold; color: #1a7f37; margin: 6px 0; }
        .sb-btns { display: flex; gap: 8px; margin-top: 10px; }
        .sb-btns button { padding: 8px 14px; border: none; border-radius: 4px; background: #1f4e79; color: #fff; cursor: pointer; }
        .sb-err { color: #d33; margin-top: 6px; }
        .rc-h { display: flex; justify-content: space-between; align-items: center; }
        .rc-h h2 { margin: 0; }
        .rc-c { margin: 10px 0; }
        .rc-s { text-align: right; margin-top: 10px; display: grid; gap: 4px; }
        .rc-f { font-weight: bold; color: #1a7f37; font-size: 18px; }
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default SimpleBilling;
