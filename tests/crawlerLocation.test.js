import test from 'node:test';
import assert from 'node:assert/strict';
import { planCrawlerBatches, searchCrawlerInBatches } from '../src/services/crawlerSearch.js';

test('postal searches stay in their primary municipality', () => {
  const batches=planCrawlerBatches({city:'Vic',cities:['Vic','Barcelona'],postal_code:'08500',sources:['fotocasa','pisoscom']});
  assert.deepEqual(batches.map(batch=>batch.city),['Vic']);
  assert.equal(batches[0].postal_code,'08500');
});

test('unknown locations stay separate and disappear when a later batch confirms them', async () => {
  let calls=0;
  const snapshots=[];
  const result=await searchCrawlerInBatches({city:'Vic',sources:['a','b','c']},{endpoint:'/search',onProgress:snapshot=>snapshots.push(snapshot),fetchImpl:async()=>({ok:true,json:async()=>++calls===1?{listings:[],unverified_listings:[{url:'https://example.com/ad',location_status:'unknown'}]}:{listings:[{url:'https://example.com/ad',location_status:'confirmed'}],unverified_listings:[{url:'https://example.com/unknown',location_status:'unknown'}]}})});
  assert.equal(snapshots[1].listings.length,0);
  assert.equal(snapshots[1].unverifiedListings.length,1);
  assert.equal(result.listings.length,1);
  assert.deepEqual(result.unverifiedListings.map(item=>item.url),['https://example.com/unknown']);
});
