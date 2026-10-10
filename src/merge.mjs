import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const [targetArg,...sourceArgs]=process.argv.slice(2);
if(!targetArg||!sourceArgs.length) throw new Error('Usage: node src/merge.mjs output source...');
const target=resolve(targetArg); await mkdir(target,{recursive:true});
const sources=await Promise.all(sourceArgs.map(p=>readFile(join(p,'results.json'),'utf8').then(JSON.parse)));
const metadata={...sources[0].metadata,engines:[...new Set(sources.flatMap(s=>s.metadata.engines))],phases:sources.map(s=>s.metadata)};
for(const s of sources) for(const k of ['node','cpu','sizes','profiles','repeats','batchSize','dependencies'])
 if(JSON.stringify(s.metadata[k])!==JSON.stringify(sources[0].metadata[k])) throw new Error(`Incompatible phase ${k}`);
const results=sources.flatMap(s=>s.results),failures=sources.flatMap(s=>s.failures);
const ids=new Set();
for(const r of results){ const id=`${r.engine}-${r.profile}-${r.rows}-${r.repeat}`; if(ids.has(id)) throw new Error(`Duplicate ${id}`); ids.add(id); }
await writeFile(join(target,'results.json'),JSON.stringify({metadata,results,failures},null,2)+'\n');
await writeFile(join(target,'environment.json'),JSON.stringify(metadata,null,2)+'\n');
for(let i=0;i<sources.length;i++) for(const r of sources[i].results){const name=`${r.engine}-${r.profile}-${r.rows}-${r.repeat}.json`; await cp(join(sourceArgs[i],name),join(target,name));}
