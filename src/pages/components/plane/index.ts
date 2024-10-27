import {Component} from '@f80975/viz.js';

export default class Plane extends Component {
  readonly name = 'plane';

  async create() {
    const {scene} = await this.viz!.assetManager.getAsset('plane.glb');
    this.object3D.add(scene);
  }
}
