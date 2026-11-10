import {useState,useRef} from 'react';import {bottleConfig as C} from '../data/bottleConfig.js';
const STEP={tea:C.tea,sm:C.sweetenedMilk,em:C.evaporatedMilk},K=['tea','sm','em'];
export function useBottle(){
 const [v,setV]=useState({tea:0,sm:0,em:0}),[done,setDone]=useState(false),[pour,setPour]=useState(null),tm=useRef();
 const total=v.tea+v.sm+v.em;
 const set=(k,n)=>setV(p=>{const o=K.reduce((a,x)=>x===k?a:a+p[x],0);return {...p,[k]:Math.max(0,Math.min(Math.round(Number(n)||0),C.capacity-o))}});
 const add=k=>{if(done)return;set(k,v[k]+STEP[k]);setPour(k);clearTimeout(tm.current);tm.current=setTimeout(()=>setPour(null),1000)};
 const reset=()=>{setV({tea:0,sm:0,em:0});setDone(false);setPour(null)};
 return {v,total,done,pour,add,set,reset,canFinish:v.tea>0&&!done,finish:()=>{if(v.tea>0)setDone(true)}};
}
