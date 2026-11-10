// Compatibility layer: Apps Script ตัวเดิม รูปแบบ request เดิม
export const ENDPOINT='https://script.google.com/macros/s/AKfycbyo0n2Ouuxr7sYgd0JRvicz23kgxOUJj4mtdD6RDTiWKG82FPZPBAnaCZ7iQaSxcGgD/exec';
const sig=()=>AbortSignal.timeout?AbortSignal.timeout(10000):undefined;
export async function getMenu(){const r=await fetch(ENDPOINT+'?action=menu&t='+Date.now(),{signal:sig()});const j=await r.json();if(!j.ok)throw new Error('menu');return j}
export async function getStatus(nos){const r=await fetch(ENDPOINT+'?action=status&nos='+nos.join(',')+'&t='+Date.now(),{signal:sig()});const j=await r.json();return j.ok?j.st:{}}
export async function sendOrder(o){const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(o)});return r.json()}
