import test from 'node:test';import assert from 'node:assert/strict';
import {canSearchRentals} from '../src/services/rentalAccess.js';
test('Office administrator rental search is disabled',()=>assert.equal(canSearchRentals({role:'admin'}),false));
test('Super admin and agents retain access',()=>{assert.equal(canSearchRentals({role:'superadmin'}),true);assert.equal(canSearchRentals({role:'agent'}),true);});
test('Unverified and unknown identities never unlock the search',()=>{for(const user of [null,undefined,{}, {role:'unknown'}])assert.equal(canSearchRentals(user),false);});
