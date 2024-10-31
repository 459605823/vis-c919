import type {STDLIB} from '@f80975/viz.js';
import {Component, THREE} from '@f80975/viz.js';
import {gsap} from 'gsap';

export default class Plane extends Component {
  readonly name = 'Plane';

  targetRotation = {
    x: 0,
    y: 0,
    z: 0,
  };

  tween?: gsap.core.Tween;

  async create() {
    const {scene} = await this.viz!.assetManager.getAsset<STDLIB.GLTF>('c919');
    console.log('plane', scene);
    scene.scale.multiplyScalar(0.1);
    this.object3D = scene;
  }

  // 俯仰角 x轴旋转 传入值为角度
  pitch(x: number) {
    this.targetRotation.x = THREE.MathUtils.degToRad(x);
  }

  // 偏航角 y轴旋转 传入值为角度
  heading(y: number) {
    this.targetRotation.y = THREE.MathUtils.degToRad(y);
  }

  // 滚转角 z轴旋转 传入值为角度
  roll(z: number) {
    this.targetRotation.z = THREE.MathUtils.degToRad(z);
  }

  rotate(posture?: {x: number; y: number; z: number}) {
    if (posture) {
      this.targetRotation = {
        x: THREE.MathUtils.degToRad(posture.x),
        y: THREE.MathUtils.degToRad(posture.y),
        z: THREE.MathUtils.degToRad(posture.z),
      };
    }
    if (this.tween) {
      this.tween.kill();
    }
    this.tween = gsap.to(this.object3D.rotation, {
      x: this.targetRotation.x,
      y: this.targetRotation.y,
      z: this.targetRotation.z,
      duration: 1,
    });
  }

  render() {
    const gui = this.viz?.guiManager;
    if (!gui)
      return;
    gui.addFolder('Plane', {
      x: {
        value: this.object3D.rotation.x,
        min: -Math.PI / 2,
        max: Math.PI / 2,
        step: 0.01,
        onChange: (v) => {
          this.object3D.rotation.x = v;
        },
      },
      y: {
        value: this.object3D.rotation.y,
        min: -Math.PI / 2,
        max: Math.PI / 2,
        step: 0.01,
        onChange: (v) => {
          this.object3D.rotation.y = v;
        },
      },
      z: {
        value: this.object3D.rotation.z,
        min: -Math.PI / 2,
        max: Math.PI / 2,
        step: 0.01,
        onChange: (v) => {
          this.object3D.rotation.z = v;
        },
      },
    });
  }

  dispose() {
    this.tween?.kill();
    this.tween = undefined;
    super.dispose();
  }
}
