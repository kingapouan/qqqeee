export const SHOP={lat:13.6518192,lng:100.485199},FREE_KM=5,FEE=25,FREE_OVER=200,MAX_KM=15;
export const STEPS=['รอร้านรับออเดอร์','กำลังทำ','กำลังจัดส่ง','เสร็จสิ้น'];
export const fmt=n=>'฿'+Number(n).toLocaleString('th-TH');
export const statusOf=m=>m.st==='หมด'||(m.stock!==''&&m.stock!=null&&Number(m.stock)<=0)?'SOLD_OUT':m.st==='เร็วๆนี้'?'COMING_SOON':'AVAILABLE';
export const findThaiTea=(menu,id)=>menu.find(m=>id!=null?m.id===id:String(m.n).includes('ชาไทย'));
export const recipeText=r=>`ชา ${r.tea} / หวาน ${r.sm} / จืด ${r.em} ml`;
export function km(a,b,c,d){const r=x=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 12742*Math.asin(Math.sqrt(h))}
export function shipFee(way,loc,sub){if(way!=='จัดส่ง')return 0;return loc?(loc.km<=FREE_KM?0:FEE):(sub>=FREE_OVER?0:FEE)}
export const newNo=()=>'OU'+String(Date.now()).slice(-6)+(10+Math.floor(Math.random()*90));
export function shrink(f){return new Promise((ok,no)=>{const im=new Image();im.onload=()=>{const k=Math.min(1,1000/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.8))};im.onerror=no;im.src=URL.createObjectURL(f)})}
