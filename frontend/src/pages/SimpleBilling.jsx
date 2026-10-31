import { useEffect, useState } from 'react';
import { productApi, billApi } from '../api/billing';

export default function SimpleBilling() {
  const [name, setName] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    productApi.list().then(r => {
      let d = r.data;
      if (d && d.data) d = d.data;
      setProducts(Array.isArray(d) ? d : []);
    }).catch(() => setErr('No products'));
  }, []);

  const add = (p) => {
    const ex = cart.find(x => x.id === p.id);
    if (ex) setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty+1} : x));
    else setCart([...cart, {id:p.id, name:p.productName, price:p.price, qty:1}]);
    setBill(null);
  };

  const qty = (id, v) => {
    const qv = Number(v);
    if (qv <= 0) setCart(cart.filter(x=>x.id!==id));
    else setCart(cart.map(x=>x.id===id?{...x, qty:qv}:x));
    setBill(null);
  };

  const sub = cart.reduce((s,x)=>s + Number(x.price)*Number(x.qty), 0);
  const disc = sub > 1000 ? sub*0.1 : 0;
  const fin = sub - disc;

  const calc = async () => {
    setErr('');
    if (!name.trim()) { setErr('Enter name'); return; }
    if (cart.length===0) { setErr('Select products'); return; }
    try {
      const res = await billApi.calculate({customerName:name, items: cart.map(x=>({productId:x.id, quantity:x.qty}))});
      let b = res.data;
      if (b && b.data) b = b.data;
      setBill(b);
    } catch(e) { setErr('Error'); }
  };

  const print = () => window.print();

  return (
    <div style={{maxWidth:900, margin:'20px auto', fontFamily:'Arial'}}>
      <h2>Simple Billing</h2>
      <div>Customer: <input value={name} onChange={e=>{setName(e.target.value); setBill(null);}} /></div>
      <h3>Products</h3>
      {products.map(p=>(
        <div key={p.id} style={{display:'flex',gap:10,alignItems:'center'}}>
          <span>{p.productName} - ₹{p.price}</span>
          <button onClick={()=>add(p)}>Add</button>
        </div>
      ))}
      <h3>Items</h3>
      {cart.map(c=>(
        <div key={c.id}>
          {c.name} ₹{c.price} x <input type="number" value={c.qty} onChange={e=>qty(c.id,e.target.value)} style={{width:60}} />
        </div>
      ))}
      <div>Subtotal: ₹{sub.toFixed(2)}</div>
      <div>Discount: {sub>1000?'10%':'0%'} ₹{disc.toFixed(2)}</div>
      <div>Final: ₹{fin.toFixed(2)}</div>
      <button onClick={calc}>Generate Bill</button> <button onClick={print}>Print Bill</button>
      {err && <div style={{color:'red'}}>{err}</div>}
      {bill && (
        <div id="bill">
          <h3>Bill</h3>
          <div>Name: {bill.customerName}</div>
          {(bill.items||[]).map((it,i)=>(<div key={i}>{it.productName} ₹{it.price} x {it.quantity} = ₹{it.itemTotal}</div>))}
          <div>Subtotal: ₹{bill.subtotal}</div>
          <div>Discount: ₹{bill.discountAmount}</div>
          <div>Final: ₹{bill.finalAmount}</div>
        </div>
      )}
    </div>
  );
}
