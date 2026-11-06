import test from 'node:test';
import assert from 'node:assert/strict';
import {fitCameraDistance} from '../src/math/camera.js';
import {buildGeometry} from '../src/geometry/extrude.js';
import {createState} from '../src/state.js';
import {computeIdentPose} from '../src/animation/ident.js';
import {createRotationXMatrix,createRotationYMatrix,createScaleMatrix,createTranslationMatrix,multiplyMatrices} from '../src/math/mat4.js';
test('all bounds corners stay inside the camera throughout motion and repeats',()=>{
  for(const word of ['I','LOGO','WQ0D']) for(const depth of [0.1,1.2]) {
    const {bounds}=buildGeometry({...createState(),word,depth});
    for(const aspect of [0.25,390/422,1,2,4]) {
      const distance=fitCameraDistance(bounds,aspect);
      for(const motion of ['hover','spin','orbit']) for(let time=0;time<40;time+=0.13) {
        const p=computeIdentPose(time,{motion,autoLoop:true});
        const m=multiplyMatrices(createTranslationMatrix(p.tx,p.ty,0),multiplyMatrices(createRotationYMatrix(p.rotY),multiplyMatrices(createRotationXMatrix(p.rotX),createScaleMatrix(p.scale))));
        for(let bits=0;bits<8;bits++) {
          const v=[0,1,2].map(i=>(bits&(1<<i)?bounds.max:bounds.min)[i]);
          const q=[0,1,2].map(i=>m[i]*v[0]+m[4+i]*v[1]+m[8+i]*v[2]+m[12+i]);
          const z=distance-q[2];
          assert.ok(Math.abs(q[0])/(z*Math.tan(Math.PI/6)*aspect)<0.91);
          assert.ok(Math.abs(q[1])/(z*Math.tan(Math.PI/6))<0.91);
        }
      }
    }
  }
});
