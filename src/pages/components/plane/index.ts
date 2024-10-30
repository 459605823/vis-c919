import type {STDLIB, THREE} from '@f80975/viz.js';
import {Component} from '@f80975/viz.js';

export default class Plane extends Component {
  readonly name = 'plane';

  plane?: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

  async create() {
    const {scene} = await this.viz!.assetManager.getAsset<STDLIB.GLTF>('c919');
    scene.scale.multiplyScalar(0.01);
    const plane = scene.children[0].children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    this.object3D.add(scene);
    this.plane = plane;
  }

  tilt() {}
}
