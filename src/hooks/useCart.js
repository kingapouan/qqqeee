import {useState,useEffect} from 'react';import {load,save} from '../utils/storage.js';
export function useCart(){
 const [items,setItems]=useState(()=>load('ouan2-cart',[]));
 useEffect(()=>save('ouan2-cart',items),[items]);
 const add=it=>setItems(p=>p.some(x=>x.key===it.key)?p.map(x=>x.key===it.key?{...x,q:Math.min(50,x.q+1)}:x):[...p,{...it,q:1}]);
 const chg=(key,d)=>setItems(p=>p.map(x=>x.key===key?{...x,q:Math.min(50,x.q+d)}:x).filter(x=>x.q>0));
 const del=key=>setItems(p=>p.filter(x=>x.key!==key));
 const sync=menu=>setItems(p=>p.filter(x=>menu.some(m=>m.id===x.id&&m.st!=='เร็วๆนี้'&&m.st!=='หมด')).map(x=>({...x,p:menu.find(m=>m.id===x.id).p})));
 return {items,add,chg,del,sync,clear:()=>setItems([]),sub:items.reduce((a,x)=>a+x.p*x.q,0),count:items.reduce((a,x)=>a+x.q,0)};
}
