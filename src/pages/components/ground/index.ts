import type {STDLIB} from '@f80975/viz.js';
import {Component} from '@f80975/viz.js';

export default class Ground extends Component {
  readonly name = 'Ground';

  async create() {
    const {scene} = await this.viz!.assetManager.getAsset<STDLIB.GLTF>('ground');
    scene.scale.multiplyScalar(0.1);
    this.object3D.add(scene);
  }
}
