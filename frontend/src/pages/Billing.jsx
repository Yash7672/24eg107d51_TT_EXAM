import { useState } from 'react';
import { Link } from 'react-router-dom';
import { billApi } from '../api/billing';

const money = (v) => Number(v || 0).toFixed(2);
const fmtDate = (v) => (v ? new Date(v).toLocaleString() : '');

/**
 * Billing page.
 *
 * Shows every product that was added on the Shop page with its quantity and
 * price and, at the bottom, the bill calculation:
 *
 *   Bill Calculation
 *   Subtotal: ₹0.00
 *   Discount: 0% (₹0.00)
 *   Final Amount: ₹0.00
 *   Generate Bill   Print Bill
 *
 * The discount is 10% and only applies when the subtotal is greater than ₹1,000.
 */
export default function Billing({ cart, customer, setCustomer, onQuantity, onRemove, onClear }) {
  const [bill, setBill] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const subtotal = cart.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  const discountPct = subtotal > 1000 ? 10 : 0;
  const discount = (subtotal * discountPct) / 100;
  const finalAmount = subtotal - discount;

  const generate = async () => {
    setErr('');
    setMsg('');
    if (!customer.name.trim()) { setErr('Enter customer name'); return null; }
    if (cart.length === 0) { setErr('Add at least one product from the Shop page'); return null; }
    try {
      const res = await billApi.create({
        customerName: customer.name.trim(),
        phone: customer.phone.trim(),
        items: cart.map(i => ({ productId: i.productId, quantity: Number(i.quantity) }))
      });
      let b = res.data;
      if (b && b.data) b = b.data;
      setBill(b);
      setMsg('Bill saved');
      return b;
    } catch (e) {
      setErr(e.message || 'Could not generate the bill');
      return null;
    }
  };

  // Printing an empty page would be useless, so the receipt is generated
  // first when Print is pressed before Generate Bill.
  const print = async () => {
    const b = bill || await generate();
    if (!b) return;
    setTimeout(() => window.print(), 60);
  };

  const changeQty = (id, value) => {
    const n = parseInt(value, 10);
    onQuantity(id, Number.isFinite(n) && n > 0 ? n : 1);
    setBill(null);
    setErr('');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Billing</h1>
          <p className="muted">Check the items, then generate and print the bill.</p>
        </div>
        <Link className="page-link" to="/">← Back to Shop</Link>
      </div>

      {msg && <div className="sb2-ok">{msg}</div>}
      {err && <div className="sb2-bad">{err}</div>}

      <div className="sb2-panel">
        <div className="sb2-ph">Customer Details</div>
        <div className="bill-fields">
          <input
            className="sb2-inp bill-name"
            placeholder="Customer Name"
            value={customer.name}
            onChange={e => { setCustomer({ ...customer, name: e.target.value }); setBill(null); }}
          />
          <input
            className="sb2-inp bill-phone"
            placeholder="Phone (optional)"
            value={customer.phone}
            onChange={e => { setCustomer({ ...customer, phone: e.target.value }); setBill(null); }}
          />
        </div>
      </div>

      <div className="sb2-panel">
        <div className="sb2-ph">Items</div>
        {cart.length === 0 ? (
          <div className="sb2-m">
            No items yet. <Link to="/">Add products from the Shop page</Link>.
          </div>
        ) : (
          <table className="sb2-t">
            <thead>
              <tr><th>Item</th><th>Price</th><th>Quantity</th><th>Amount</th><th></th></tr>
            </thead>
            <tbody>
              {cart.map(i => (
                <tr key={i.productId}>
                  <td>{i.productName}</td>
                  <td>₹{money(i.price)}</td>
                  <td>
                    <input
                      className="sb2-q"
                      type="number"
                      min="1"
                      value={i.quantity}
                      onChange={e => changeQty(i.productId, e.target.value)}
                    />
                  </td>
                  <td>₹{money(Number(i.price) * Number(i.quantity))}</td>
                  <td><button className="sb2-b sb2-b2" onClick={() => { setBill(null); onRemove(i.productId); }}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="bill-calc">
          <div className="sb2-ph">Bill Calculation</div>
          <div className="sb2-sum">
            <div>Subtotal: ₹{money(subtotal)}</div>
            <div>Discount: {discountPct}% (₹{money(discount)})</div>
            <div className="sb2-f">Final Amount: ₹{money(finalAmount)}</div>
          </div>
          <div className="sb2-act">
            <button className="sb2-b sb2-b3" onClick={generate}>Generate Bill</button>
            <button className="sb2-b sb2-b1" onClick={print}>Print Bill</button>
            <button
              className="sb2-b sb2-b4"
              onClick={() => { onClear(); setBill(null); setErr(''); setMsg(''); }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {bill && (
        <div className="sb2-rec" id="print-bill">
          <div className="sb2-rec-h">
            <div>
              <div className="sb2-rec-t">SMART SHOP</div>
              <div>Bill Receipt</div>
            </div>
            <div className="sb2-rec-m">
              <div>Bill No: #{bill.id || '-'}</div>
              <div>{fmtDate(bill.billDate)}</div>
            </div>
          </div>
          <div className="sb2-rec-c">
            Customer: {bill.customerName}{bill.phone ? ' | Phone: ' + bill.phone : ''}
          </div>
          <table className="sb2-t sb2-rec-t2">
            <thead>
              <tr><th>Item</th><th>Price</th><th>Quantity</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {(bill.items || []).map((it, idx) => (
                <tr key={idx}>
                  <td>{it.productName}</td>
                  <td>₹{money(it.price)}</td>
                  <td>{it.quantity}</td>
                  <td>₹{money(it.itemTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sb2-rec-s">
            <div>Subtotal: ₹{money(bill.subtotal)}</div>
            <div>Discount ({bill.discountPercentage}%): ₹{money(bill.discountAmount)}</div>
            <div className="sb2-rec-f">Final Amount: ₹{money(bill.finalAmount)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
