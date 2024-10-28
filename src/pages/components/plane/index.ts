import type {STDLIB} from '@f80975/viz.js';
import {Component} from '@f80975/viz.js';

export default class Plane extends Component {
  readonly name = 'plane';

  async create() {
    const {scene} = await this.viz!.assetManager.getAsset<STDLIB.GLTF>('c919');
    scene.scale.multiplyScalar(0.001);
    console.log(scene);
    this.object3D.add(scene);
  }
}
