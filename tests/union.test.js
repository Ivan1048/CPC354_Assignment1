import test from 'node:test';
import assert from 'node:assert/strict';
import { unionStrokes } from '../src/geometry/union.js';
import { createRectanglePolygon as rect } from '../src/geometry/glyphs.js';
test('overlapping strokes have union area and no internal walls',()=>{
  const {faces,edges}=unionStrokes([rect(0,0,2,1),rect(1,0,3,1)]);
  const area=faces.reduce((sum,poly)=>sum+poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-p[1]*q[0];},0)/2,0);
  assert.ok(Math.abs(area-3)<1e-8);
  const perimeter=edges.reduce((s,[a,b])=>s+Math.hypot(b[0]-a[0],b[1]-a[1]),0);
  assert.ok(Math.abs(perimeter-8)<1e-8);
  for(const [a,b] of edges) assert.ok(a[1]===b[1] || a[0]===0 || a[0]===3);
});

test('union preserves a ring hole, handles containment and removes duplicate strokes',()=>{
  const area=faces=>faces.reduce((sum,poly)=>sum+poly.reduce((s,p,i)=>{
    const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-p[1]*q[0];
  },0)/2,0);
  const perimeter=edges=>edges.reduce((s,[a,b])=>s+Math.hypot(b[0]-a[0],b[1]-a[1]),0);
  const ring=unionStrokes([rect(0,0,3,1),rect(0,2,3,3),rect(0,0,1,3),rect(2,0,3,3)]);
  assert.ok(Math.abs(area(ring.faces)-8)<1e-8);
  assert.ok(Math.abs(perimeter(ring.edges)-16)<1e-8);
  const contained=unionStrokes([rect(0,0,3,3),rect(1,1,2,2),rect(0,0,3,3)]);
  assert.ok(Math.abs(area(contained.faces)-9)<1e-8);
  assert.ok(Math.abs(perimeter(contained.edges)-12)<1e-8);
});
