import {useEffect,useRef,useState} from 'react';import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import Bottle from './components/Bottle.jsx';import Checkout from './components/Checkout.jsx';
import {useBottle} from './hooks/useBottle.js';import {useCart} from './hooks/useCart.js';
import {getMenu,getStatus} from './utils/api.js';import {statusOf,findThaiTea,recipeText,fmt,STEPS} from './utils/order.js';
import {bottleConfig as C} from './data/bottleConfig.js';import {THAI_TEA_ID,THAI_TEA_COPY as T,CONTACT} from './data/products.js';import {load,save} from './utils/storage.js';
const ING=[['tea','เติมชาไทย','สีส้มอำพัน','#c46a1c'],['sm','เติมนมข้นหวาน','สีครีมอ่อน','#f6e8c8'],['em','เติมนมข้นจืด','สีขาวนวล','#fcfaf4']];
export default function App(){
 const rm=useReducedMotion(),cart=useCart(),b=useBottle(),[menu,setMenu]=useState([]),[shop,setShop]=useState({open:true,msg:''}),[st,setSt]=useState('load'),
  [view,setView]=useState('home'),[cartOpen,setCartOpen]=useState(false),[co,setCo]=useState(false),[toast,setToast]=useState(''),[fly,setFly]=useState(null),
  [orders,setOrders]=useState(()=>load('ouan-orders',[]).filter(o=>o&&!['เสร็จสิ้น','ยกเลิก'].includes(o.st)&&!(o.ts&&Date.now()-o.ts>864e5)));
 const addBtn=useRef(),cartBtn=useRef();
 const loadMenu=async()=>{try{const j=await getMenu();setMenu(j.menu||[]);setShop(j.shop||{open:true,msg:''});cart.sync(j.menu||[]);setSt('ok')}catch(e){setSt(s=>s==='ok'?s:'err')}};
 useEffect(()=>{loadMenu();const t=setInterval(()=>!document.hidden&&loadMenu(),20000);return()=>clearInterval(t)},[]);
 useEffect(()=>save('ouan-orders',orders),[orders]);
 useEffect(()=>{const t=setInterval(async()=>{const act=orders.filter(o=>o.sent&&o.st!=='เสร็จสิ้น').map(o=>o.no);if(!act.length)return;try{const s=await getStatus(act);setOrders(p=>p.map(o=>s[o.no]?{...o,st:s[o.no]}:o))}catch(e){}},15000);return()=>clearInterval(t)},[orders.length]);
 const tea=findThaiTea(menu,THAI_TEA_ID),teaSt=tea&&statusOf(tea),canOrder=shop.open&&teaSt==='AVAILABLE';
 const others=menu.filter(m=>m!==tea);
 const say=t=>{setToast(t);setTimeout(()=>setToast(''),2200)};
 const addTea=()=>{if(!tea||!b.done)return;cart.add({key:`${tea.id}:${b.v.tea}-${b.v.sm}-${b.v.em}`,id:tea.id,n:tea.n,p:tea.p,rc:{...b.v}});
  if(!rm&&addBtn.current&&cartBtn.current){const a=addBtn.current.getBoundingClientRect(),c=cartBtn.current.getBoundingClientRect();setFly({x:a.left+a.width/2,y:a.top,dx:c.left-a.left,dy:c.top-a.top});setTimeout(()=>setFly(null),700)}
  say('เพิ่มชาไทยลงตะกร้าแล้ว 💛')};
 const addPlain=m=>{cart.add({key:String(m.id),id:m.id,n:m.n,p:m.p});say('เพิ่มลงตะกร้าแล้ว 💛')};
 return <div className="max-w-5xl mx-auto pb-28 overflow-x-clip">
  <header className="flex items-center gap-3 px-4 py-3 sticky top-0 z-30 bg-cream/95 backdrop-blur">
   <img src="/icon-512.png" alt="OUAN" className="w-12 h-12 rounded-2xl bg-white"/><div className="leading-tight"><b className="text-ouan text-lg">OUAN</b><div className="text-xs">กินกับอ้วน</div></div>
   <nav className="ml-auto flex gap-2 items-center"><button className={view==='home'?'btn2 bg-soft':'btn2'} onClick={()=>setView('home')}>เมนู</button>
    <button className={view==='orders'?'btn2 bg-soft':'btn2'} onClick={()=>setView('orders')}>ออเดอร์{orders.length?` (${orders.length})`:''}</button>
    <motion.button ref={cartBtn} key={cart.count} animate={rm?{}:{scale:[1,1.25,1]}} className="btn !px-3 relative" aria-label="ตะกร้า" onClick={()=>setCartOpen(true)}>🛒{cart.count>0&&<span className="absolute -top-2 -right-2 bg-sun text-ink text-xs rounded-full w-6 h-6 grid place-items-center">{cart.count}</span>}</motion.button></nav>
  </header>
  {!shop.open&&<div className="card mx-4 p-3 border-red-300">🔴 <b>ร้านปิดรับออเดอร์ชั่วคราว</b> {shop.msg}</div>}
  {view==='orders'?<Orders orders={orders}/>:<main>
   <section className="bg-sun mx-4 rounded-[28px] p-5 grid sm:grid-cols-2 gap-4 items-center">
    <div><h1 className="text-3xl font-bold">วันนี้กินอะไรดี?</h1><p className="mt-1">ชาไทยหอม ๆ พร้อมเสิร์ฟแล้ว</p><div className="inline-block bg-white rounded-full px-4 py-1 my-3 font-bold text-ouan">25 บาท / {T.size}</div><br/>
     <a href="#make"><button className="btn">สั่งชาไทยเลย</button></a></div>
    <motion.img initial={rm?false:{y:20,opacity:0}} animate={{y:0,opacity:1}} src={T.img} alt="ชาไทยขวด OUAN 250 ml" className="rounded-3xl max-h-72 mx-auto"/>
   </section>
   <section className="px-4 mt-6" id="make"><h2 className="text-xl font-bold mb-2">เมนูที่เปิดขายตอนนี้</h2>
    {st==='load'&&<p>กำลังโหลดเมนูจากร้าน...</p>}
    {st==='err'&&<div className="card p-4">เชื่อมต่อร้านไม่ได้ <button className="btn2" onClick={loadMenu}>ลองใหม่</button></div>}
    {st==='ok'&&!tea&&<div className="card p-4">ยังไม่พบเมนูชาไทยในระบบร้าน (ตรวจแท็บ menu หรือ THAI_TEA_ID)</div>}
    {tea&&<div className="card p-4 grid md:grid-cols-2 gap-4">
     <div><Bottle v={b.v} pour={b.pour} done={b.done}/>
      <div className="text-center font-bold mt-2" aria-live="polite">{b.total} / {C.capacity} ML</div>
      {b.done&&<motion.div initial={rm?false:{scale:.6}} animate={{scale:1}} className="text-center text-ok font-bold mt-1">พร้อมดื่มแล้ว! {fmt(tea.p)}</motion.div>}</div>
     <div className="space-y-3"><div><b className="text-lg">{tea.n} <small>{T.size}</small></b><p className="text-sm">{T.tag}<br/>{T.sub}</p></div>
      {ING.map(([k,lb,cl,col])=><div key={k} className="rounded-2xl border-2 border-line p-3"><div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full border" style={{background:col}}/><span className="font-semibold flex-1">{lb.slice(4)}<small className="block font-normal">{cl}</small></span><span className="text-sm">{b.v[k]} ml</span>
       <button className="btn !py-1 !px-3" disabled={b.done||b.total>=C.capacity} onClick={()=>b.add(k)}>{lb}</button></div>
       {C.allowCustomAmount&&<input type="range" className="w-full mt-2" min="0" max={C.capacity} step="5" value={b.v[k]} disabled={b.done} onChange={e=>b.set(k,e.target.value)} aria-label={'ปริมาณ'+lb.slice(4)}/>}</div>)}
      <div className="flex gap-2"><button className="btn2" onClick={b.reset}>RESET</button><button className="btn flex-1" disabled={!b.canFinish} onClick={b.finish}>FINISH BOTTLE</button></div>
      {!b.v.tea&&<small>ต้องมีชาไทยก่อนจึงจะปิดฝาขวดได้</small>}
      <button ref={addBtn} className="btn w-full" disabled={!b.done||!canOrder} onClick={addTea}>{teaSt==='SOLD_OUT'?'หมดชั่วคราว':teaSt==='COMING_SOON'?'เร็ว ๆ นี้':'เพิ่มลงตะกร้า'}</button></div></div>}
    {others.length>0&&<div className="grid grid-cols-2 gap-3 mt-4">{others.map(m=>{const s=statusOf(m);return <div key={m.id} className="card p-3"><div className="text-3xl">{m.img?<img src={m.img} alt={m.n} className="h-20 object-cover rounded-xl"/>:m.e}</div><b>{m.n}</b><div className="text-sm">{m.d}</div><div className="font-bold text-ouan">{fmt(m.p)}</div>
     <button className="btn2 w-full mt-1" disabled={s!=='AVAILABLE'||!shop.open} onClick={()=>addPlain(m)}>{s==='SOLD_OUT'?'หมดชั่วคราว':s==='COMING_SOON'?'เร็ว ๆ นี้':'เพิ่มลงตะกร้า'}</button></div>})}</div>}
   </section>
   <section className="text-center my-8 px-4 font-semibold text-ouan">กินกับอ้วน ความอร่อยที่อยากแบ่งปัน</section>
  </main>}
  <footer className="text-center text-sm py-6"><img src="/icon-512.png" alt="OUAN" className="w-16 mx-auto rounded-2xl"/>ติดต่อร้าน: <a href={CONTACT.ig} target="_blank" rel="noopener">Instagram {CONTACT.igName}</a></footer>
  {cart.count>0&&!cartOpen&&<div className="fixed bottom-0 inset-x-0 p-3 z-30" style={{paddingBottom:'calc(.75rem + env(safe-area-inset-bottom,0px))'}}><button className="btn w-full max-w-md mx-auto block" onClick={()=>setCartOpen(true)}>ดูตะกร้า ({cart.count}) · {fmt(cart.sub)}</button></div>}
  {cartOpen&&<div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center" onClick={()=>setCartOpen(false)}><div className="card w-full max-w-md max-h-[85vh] overflow-y-auto p-5 space-y-3" onClick={e=>e.stopPropagation()}>
   <b className="text-xl text-ouan">ตะกร้า</b>{!cart.items.length&&<p>ยังไม่มีสินค้า</p>}
   {cart.items.map(x=><div key={x.key} className="flex items-center gap-2 border-b border-line pb-2"><div className="flex-1"><b>{x.n}</b>{x.rc&&<small className="block">{recipeText(x.rc)}</small>}<small>{fmt(x.p)} × {x.q} = {fmt(x.p*x.q)}</small></div>
    <button className="btn2 !px-3" onClick={()=>cart.chg(x.key,-1)} aria-label="ลด">−</button><b>{x.q}</b><button className="btn2 !px-3" onClick={()=>cart.chg(x.key,1)} aria-label="เพิ่ม">+</button><button onClick={()=>cart.del(x.key)} aria-label="ลบ">🗑️</button></div>)}
   <b className="block text-lg">ยอดรวม {fmt(cart.sub)}</b>
   <button className="btn w-full" disabled={!cart.items.length||!shop.open} onClick={()=>{setCartOpen(false);setCo(true)}}>ไปชำระเงิน</button></div></div>}
  {co&&<Checkout cart={cart} onClose={()=>setCo(false)} onDone={o=>{setOrders(p=>[o,...p]);cart.clear();setCo(false);setView('orders');say('สั่งซื้อสำเร็จ! 🎉')}}/>}
  {fly&&<motion.div className="fixed z-50 text-3xl pointer-events-none" style={{left:fly.x,top:fly.y}} initial={{x:0,y:0,scale:1}} animate={{x:fly.dx,y:fly.dy,scale:.3}} transition={{type:'spring',stiffness:90,damping:14}}>🧋</motion.div>}
  <AnimatePresence>{toast&&<motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} exit={{opacity:0}} className="fixed bottom-24 inset-x-0 mx-auto w-max max-w-[90vw] bg-ink text-white rounded-full px-5 py-2 z-50">{toast}</motion.div>}</AnimatePresence>
 </div>}
function Orders({orders}){return <div className="px-4 space-y-3 mt-2">{!orders.length&&<div className="card p-6 text-center">ยังไม่มีออเดอร์</div>}
 {orders.map(o=>{const i=STEPS.indexOf(o.st);return <div key={o.no} className="card p-4"><div className="flex justify-between"><b>#{o.no}</b><small>{o.t}</small></div>
  <div className="inline-block bg-soft rounded-full px-3 my-1 font-semibold">{o.st}</div>
  <div className="flex gap-1 text-xs my-2">{STEPS.map((s,k)=><span key={s} className={'flex-1 text-center rounded-full py-1 '+(k<=i?'bg-ouan text-white':'bg-line')}>{s.replace('รอร้านรับออเดอร์','รอร้านรับ')}</span>)}</div>
  {o.items.map((x,k)=><div key={k} className="flex justify-between text-sm"><span>{x.n} ×{x.q}{x.rc&&<small className="block">{x.rc.split('/').length===3?`ชา ${x.rc.split('/')[0]} / หวาน ${x.rc.split('/')[1]} / จืด ${x.rc.split('/')[2]} ml`:''}</small>}</span><span>{fmt(x.p*x.q)}</span></div>)}
  <b className="block mt-1">รวม {fmt(o.sum)}</b></div>})}</div>}
