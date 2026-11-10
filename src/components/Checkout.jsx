import {useState} from 'react';import {sendOrder} from '../utils/api.js';import {fmt,km,SHOP,MAX_KM,shipFee,newNo,shrink,recipeText} from '../utils/order.js';import {load,save} from '../utils/storage.js';import {CONTACT} from '../data/products.js';
export default function Checkout({cart,onClose,onDone}){
 const me=load('ouan-me',{}),[f,setF]=useState({name:me.name||'',tel:me.tel||'',addr:me.addr||'',note:'',way:'จัดส่ง',pay:'โอนเงิน (PromptPay)',rnote:''});
 const [loc,setLoc]=useState(null),[slip,setSlip]=useState(null),[ok,setOk]=useState(false),[busy,setBusy]=useState(false),[err,setErr]=useState('');
 const u=k=>e=>setF({...f,[k]:e.target.value}),ship=shipFee(f.way,loc,cart.sub),sum=cart.sub+ship;
 const gps=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>setLoc({lat:p.coords.latitude,lng:p.coords.longitude,km:km(SHOP.lat,SHOP.lng,p.coords.latitude,p.coords.longitude)}),()=>setErr('ขอตำแหน่งไม่สำเร็จ กรุณาอนุญาตการเข้าถึงตำแหน่ง')):setErr('เบราว์เซอร์ไม่รองรับตำแหน่ง');
 const go=async()=>{setErr('');
  if(!ok)return setErr('กรุณายอมรับประกาศความเป็นส่วนตัว');
  if(!f.name.trim()||f.tel.replace(/\D/g,'').length<8)return setErr('กรอกชื่อและเบอร์โทรให้ครบ');
  if(f.way==='จัดส่ง'&&(!f.addr.trim()||!loc))return setErr('กรอกที่อยู่และแชร์ตำแหน่งเพื่อจัดส่ง');
  if(loc&&f.way==='จัดส่ง'&&loc.km>MAX_KM)return setErr('อยู่นอกพื้นที่จัดส่ง (ไม่เกิน '+MAX_KM+' กม.)');
  const transfer=f.pay.startsWith('โอน');if(transfer&&!slip)return setErr('แนบสลิปโอนเงินก่อน');
  setBusy(true);
  try{
   const rec=cart.items.map(x=>x.rc?`${x.n}: ${recipeText(x.rc)}`:'').filter(Boolean).join(' | ');
   const note=((rec?'['+rec+'] ':'')+f.note).slice(0,300);
   const o={no:newNo(),items:cart.items.map(x=>({id:x.id,n:x.n,q:x.q,p:x.p,rc:x.rc?`${x.rc.tea}/${x.rc.sm}/${x.rc.em}`:undefined})),sum,way:f.way,pay:f.pay,note,rnote:f.rnote,name:f.name,tel:f.tel,addr:f.addr,
    lat:loc?loc.lat:null,lng:loc?loc.lng:null,cv:'web2',ct:new Date().toISOString(),slip:transfer&&slip?await shrink(slip):''};
   const j=await sendOrder(o);
   if(!j.ok){setErr(j.error||'ส่งออเดอร์ไม่สำเร็จ');setBusy(false);return}
   save('ouan-me',{name:f.name,tel:f.tel,addr:f.addr});
   onDone({no:o.no,t:new Date().toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'}),ts:Date.now(),items:o.items,sum,sub:cart.sub,ship,way:f.way,pay:f.pay,st:'รอร้านรับออเดอร์',sent:true,tk:j.tk})
  }catch(e){setErr('เชื่อมต่อร้านไม่ได้ ตะกร้ายังอยู่ ลองใหม่อีกครั้ง')}setBusy(false)};
 return <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
  <div className="card w-full max-w-md max-h-[92vh] overflow-y-auto p-5 space-y-3" onClick={e=>e.stopPropagation()}>
   <b className="text-xl text-ouan">ยืนยันออเดอร์</b>
   <input className="inp" placeholder="ชื่อ" value={f.name} onChange={u('name')}/><input className="inp" inputMode="tel" placeholder="เบอร์โทร" value={f.tel} onChange={u('tel')}/>
   <select className="inp" value={f.way} onChange={e=>setF({...f,way:e.target.value,pay:e.target.value==='จัดส่ง'?'โอนเงิน (PromptPay)':f.pay})}><option>จัดส่ง</option><option>รับที่ร้าน</option></select>
   {f.way==='จัดส่ง'&&<><textarea className="inp" rows="2" placeholder="ที่อยู่จัดส่ง" value={f.addr} onChange={u('addr')}/><button className="btn2" onClick={gps}>{loc?`📍 ห่างร้าน ${loc.km.toFixed(1)} กม.`:'📍 แชร์ตำแหน่งของฉัน'}</button><input className="inp" placeholder="ฝากบอกไรเดอร์ (ไม่บังคับ)" value={f.rnote} onChange={u('rnote')}/></>}
   <input className="inp" placeholder="หมายเหตุ (ไม่บังคับ)" value={f.note} onChange={u('note')}/>
   <select className="inp" value={f.pay} onChange={u('pay')} disabled={f.way==='จัดส่ง'}><option>โอนเงิน (PromptPay)</option>{f.way==='รับที่ร้าน'&&<option>จ่ายที่ร้าน</option>}</select>
   {f.pay.startsWith('โอน')&&<div className="text-sm">โอนมาที่ PromptPay <b>{CONTACT.promptpay}</b> ยอด <b>{fmt(sum)}</b> แล้วแนบสลิป<input className="inp mt-2" type="file" accept="image/*" onChange={e=>setSlip(e.target.files[0])}/></div>}
   <label className="flex gap-2 text-sm"><input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)}/>ฉันยอมรับให้ร้านเก็บและใช้ชื่อ เบอร์ ที่อยู่ ตำแหน่ง เพื่อจัดส่งออเดอร์ (ติดต่อเรื่องข้อมูลที่ <a href={CONTACT.ig} target="_blank" rel="noopener">{CONTACT.igName}</a>)</label>
   <div className="text-sm">ค่าขนม {fmt(cart.sub)} · ค่าส่ง {ship?fmt(ship):'ฟรี'}</div><b className="block text-lg">รวม {fmt(sum)}</b>
   {err&&<p className="text-red-600 text-sm">{err}</p>}
   <button className="btn w-full" disabled={busy} onClick={go}>{busy?'กำลังส่ง...':'สั่งซื้อเลย'}</button>
  </div></div>}
