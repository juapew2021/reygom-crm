import test from 'node:test';
import assert from 'node:assert/strict';
import {validDay,localInput,dayKey,coversDay,monthDays,monthRange,eventForm,savePayload} from '../src/services/agendaDates.js';
test('Colombia and Spain show the same instant on the correct local day',()=>{
 assert.equal(localInput('2026-10-17T02:00:00Z','America/Bogota'),'2026-10-16T21:00');
 assert.equal(localInput('2026-10-17T02:00:00Z','Europe/Madrid'),'2026-10-17T04:00');
 assert.equal(dayKey('2026-10-17T02:00:00Z','America/Bogota'),'2026-10-16');
});
test('Spain DST and Canary Islands do not use the browser timezone',()=>{
 assert.equal(localInput('2026-10-25T00:30:00Z','Europe/Madrid'),'2026-10-25T02:30');
 assert.equal(localInput('2026-10-25T02:30:00Z','Europe/Madrid'),'2026-10-25T03:30');
 assert.equal(localInput('2026-07-01T10:00:00Z','Atlantic/Canary'),'2026-07-01T11:00');
});
test('a visit crossing midnight occupies both days, but its midnight endpoint is exclusive',()=>{
 const event={starts_at:'2026-10-17T03:00:00Z',ends_at:'2026-10-17T05:00:00Z'};
 assert(coversDay(event,'2026-10-16','America/Bogota'));assert(!coversDay(event,'2026-10-17','America/Bogota'));
 assert(coversDay({...event,ends_at:'2026-10-17T05:01:00Z'},'2026-10-17','America/Bogota'));
});
test('month grids start on Monday and their query covers all displayed days',()=>{
 for(const month of ['2026-02','2026-10','2026-12','2027-01']){
  const days=monthDays(month),range=monthRange(month);assert.equal(days.length,42);assert.equal(new Date(days[0]+'T12:00:00Z').getUTCDay(),1);
  assert(range.from.slice(0,10)<days[0]);assert(range.to.slice(0,10)>days[41]);
 }
});
test('editing converts to the event timezone and strips identity fields from saves',()=>{
 const form=eventForm({id:'event',owner_id:'owner',organization_id:'office',title:'Visita',starts_at:'2026-10-17T15:00:00Z',ends_at:'2026-10-17T16:00:00Z',timezone:'America/Bogota',kind:'visit',status:'scheduled',notes:'',location:'',property_id:null});
 assert.equal(form.starts_at,'2026-10-17T10:00');const payload=savePayload(form);assert(!('owner_id'in payload));assert(!('organization_id'in payload));assert(!('id'in payload));
});

test('invalid shared day parameters do not crash the calendar',()=>{assert.equal(validDay('2026-02-31'),null);assert.equal(validDay('bad'),null);assert.equal(validDay('2026-10-18'),'2026-10-18');});
