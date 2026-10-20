import test from 'node:test';
import assert from 'node:assert/strict';
import {contrast,readableInk,themeStyle} from '../src/utils/brandTheme.js';
test('black and white contrast is 21:1',()=>{assert.equal(contrast('#000000','#ffffff'),21);assert.equal(readableInk('#ffffff'),'#000000');assert.equal(readableInk('#000000'),'#ffffff');});
test('both buttons and navigation remain legible across the color gamut',()=>{for(let r=0;r<256;r+=17)for(let g=0;g<256;g+=17)for(let b=0;b<256;b+=17){const c='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');assert.ok(contrast(c,readableInk(c))>=4.5,`${c} needs readable text`);}});
test('invalid CSS input cannot become a theme declaration',()=>{const theme=themeStyle({primary_color:'red;display:none',sidebar_color:'url(https://invalid.example)'});assert.equal(theme['--office-primary'],'#e02424');assert.equal(theme['--office-sidebar'],'#000000');});
test('low contrast brand color uses readable navigation text',()=>{const theme=themeStyle({primary_color:'#000001',sidebar_color:'#000000'});assert.equal(theme['--office-nav-active'],'#ffffff');assert.ok(contrast(theme['--office-sidebar'],theme['--office-nav-active'])>=4.5);});
test('a clear accent is retained on the navigation',()=>{assert.equal(themeStyle({primary_color:'#ffffff',sidebar_color:'#000000'})['--office-nav-active'],'#ffffff');});

test('light accent stays legible on white content cards',()=>{const theme=themeStyle({primary_color:'#ffffff',sidebar_color:'#ffffff'});assert.ok(contrast(theme['--office-content-accent'],'#ffffff')>=4.5);assert.ok(contrast(theme['--office-nav-active'],'#ffffff')>=4.5);});
