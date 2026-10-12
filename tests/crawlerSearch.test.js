import test from "node:test";
import assert from "node:assert/strict";
import {planCrawlerBatches,searchCrawlerInBatches} from "../src/services/crawlerSearch.js";
const response = (data,status=200) => ({ok:status===200,status,json:async()=>data,headers:{get:()=>"1"}});
test("plans every portal-city pair once in batches of at most two",()=>{
 const batches=planCrawlerBatches({city:"A",cities:["A","B","A"],sources:["x","y","z","x"],price_max:1100});
 assert.equal(batches.length,4);assert.equal(batches.reduce((n,b)=>n+b.sources.length,0),6);
 assert.ok(batches.every(b=>b.sources.length<=2&&b.cities.length===1&&b.price_max===1100));
});
test("empty selection cannot accidentally query all portals",()=>{assert.throws(()=>planCrawlerBatches({sources:[]}),/Selecciona/)});
test("keeps results and per-city errors across batches without duplicate URLs",async()=>{
 const progress=[];let requests=0;
 const result=await searchCrawlerInBatches({city:"A",cities:["A","B"],sources:["x","y","z"]},{endpoint:"/crawler/search",onProgress:p=>progress.push(p.completed),fetchImpl:async()=>{requests++;return response({listings:[{url:"https://example.invalid/one"}],errors:{x:"403 Forbidden"}})}});
 assert.equal(requests,4);assert.equal(result.completed,6);assert.equal(result.total,6);assert.equal(result.listings.length,1);assert.equal(Object.keys(result.errors).length,2);assert.deepEqual(progress,[0,2,3,5,6]);
});
test("stopping after first batch sends no further query",async()=>{
 const controller=new AbortController();let requests=0;
 await assert.rejects(searchCrawlerInBatches({city:"A",sources:["x","y","z"]},{endpoint:"/crawler/search",signal:controller.signal,onProgress:p=>{if(p.completed===2)controller.abort()},fetchImpl:async()=>{requests++;return response({listings:[]})}}),{name:"AbortError"});assert.equal(requests,1);
});
test("busy response is retried without duplicating progress",async()=>{
 let calls=0,waits=0;const r=await searchCrawlerInBatches({sources:["x"]},{endpoint:"/crawler/search",wait:async()=>waits++,fetchImpl:async()=>response({listings:[]},++calls===1?429:200)});
 assert.equal(calls,2);assert.equal(waits,1);assert.equal(r.completed,1);
});
