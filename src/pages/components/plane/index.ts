import type {STDLIB, THREE} from '@f80975/viz.js';
import {Component} from '@f80975/viz.js';

export default class Plane extends Component {
  readonly name = 'plane';

  plane?: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

  async create() {
    const {scene} = await this.viz!.assetManager.getAsset<STDLIB.GLTF>('c919');
    scene.scale.multiplyScalar(0.01);
    this.plane = scene.children[1] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    console.log(this.plane);
    this.object3D.add(scene);
  }
}
