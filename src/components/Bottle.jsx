import {motion,useReducedMotion} from 'framer-motion';import {bottleConfig as C} from '../data/bottleConfig.js';
const RGB={tea:[196,106,28],sm:[246,232,200],em:[252,250,244]},POUR={tea:'#c46a1c',sm:'#f6e8c8',em:'#fcfaf4'};
const mix=v=>{const t=v.tea+v.sm+v.em||1;return 'rgb('+[0,1,2].map(i=>Math.round((RGB.tea[i]*v.tea+RGB.sm[i]*v.sm+RGB.em[i]*v.em)/t))+')'};
const BODY='M82 36H118V68C118 82 160 84 160 112V262Q160 288 134 288H66Q40 288 40 262V112C40 84 82 82 82 68Z';
export default function Bottle({v,pour,done}){
 const rm=useReducedMotion(),total=v.tea+v.sm+v.em,top=288-(total/C.capacity)*200,milk=Math.min(.7,(v.sm+v.em)/C.capacity*4);
 const loop=(d,x)=>rm?{}:{animate:x,transition:{repeat:Infinity,duration:d,ease:'linear'}};
 return <svg viewBox="0 0 200 300" className="w-full max-w-[260px] mx-auto" role="img" aria-label={`ขวด ${total} จาก ${C.capacity} ml`}>
  <defs><clipPath id="bc"><path d={BODY}/></clipPath></defs>
  <path d={BODY} fill="#eaf3fa" fillOpacity=".55"/>
  <g clipPath="url(#bc)">
   <motion.g initial={false} animate={{y:total?top:300}} transition={{type:'spring',stiffness:60,damping:16}}>
    <motion.path d="M0 0q17.5-6 35 0t35 0 35 0 35 0 35 0 35 0 35 0 35 0V320H0Z" fill={mix(v)} style={{transition:'fill .6s'}} initial={{x:-40}} {...loop(2.4,{x:[-40,-110]})}/>
    <motion.ellipse cx="100" cy="60" rx="46" ry="14" fill="#fff" style={{opacity:milk,originX:'100px',originY:'60px'}} {...loop(5,{rotate:360})}/>
    {total>0&&[60,95,130,80,115].map((x,i)=><motion.circle key={i} cx={x} cy={150} r={2+i%3} fill="#fff" fillOpacity=".55" {...loop(2+i*.4,{cy:[150,10],opacity:[0,.8,0]})}/>)}
   </motion.g>
  </g>
  {pour&&<motion.rect x="96" y="0" width="8" rx="4" fill={POUR[pour]} initial={{height:0}} animate={{height:Math.max(60,top)}} transition={{duration:.35}} key={pour+total}/>}
  <path d={BODY} fill="none" stroke="#bcd3e4" strokeWidth="3"/><path d="M52 118V255" stroke="#fff" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round"/>
  <motion.g initial={false} animate={{y:done?0:-34,opacity:done?1:0}} transition={{type:'spring',stiffness:220,damping:12}}>
   <rect x="78" y="14" width="44" height="24" rx="5" fill="#5a3a2a"/><path d="M84 20V34M92 20V34M100 20V34M108 20V34M116 20V34" stroke="#7a5238" strokeWidth="2"/></motion.g>
 </svg>}
