import type {STDLIB} from '@f80975/viz.js';
import {Component, THREE} from '@f80975/viz.js';
import {gsap} from 'gsap';
import * as YUKA from 'yuka';

const boundsConfig = [
  // 主机身
  {
    scale: new THREE.Vector3(5.43, 4.83, 45.65),
    position: new THREE.Vector3(0, -0.3, 11.96),
  },
  // 右引擎
  {
    scale: new THREE.Vector3(3.4, 3.26, 6.16),
    position: new THREE.Vector3(7.18, -2.54, 18.09),
  },

  // 左引擎
  {
    scale: new THREE.Vector3(3.4, 3.26, 6.16),
    position: new THREE.Vector3(-7.18, -2.54, 18.09),
  },
  // 右机翼
  {
    scale: new THREE.Vector3(21.38, 1.09, 5.89),
    position: new THREE.Vector3(11.27, -0.38, 12.27),
    rotation: new THREE.Euler(0, 0.38, 0.1),
  },
  // 左机翼
  {
    scale: new THREE.Vector3(21.38, 1.09, 5.89),
    position: new THREE.Vector3(-11.27, -0.38, 12.27),
    rotation: new THREE.Euler(0, -0.38, -0.1),
  },
  // 右尾翼
  {
    scale: new THREE.Vector3(7.49, 0.55, 2.98),
    position: new THREE.Vector3(-4.63, 1.09, -6.85),
    rotation: new THREE.Euler(0, -0.38, -0.1),
  },
  // 左尾翼
  {
    scale: new THREE.Vector3(7.49, 0.55, 2.98),
    position: new THREE.Vector3(4.63, 1.09, -6.85),
    rotation: new THREE.Euler(0, 0.38, 0.1),
  },
  // 上翼
  {
    scale: new THREE.Vector3(0.62, 6.52, 7.23),
    position: new THREE.Vector3(0, 5.34, -5.52),
    rotation: new THREE.Euler(0, 0, 0),
  },
];

export default class Plane extends Component {
  readonly name = 'Plane';

  targetRotation = {
    x: 0,
    y: 0,
    z: 0,
  };

  obbs: YUKA.OBB[] = [];

  obbHelpers: THREE.Mesh[] = [];

  tween?: gsap.core.Tween;

  get rotating() {
    return this.tween?.isActive() ?? false;
  }

  async create() {
    const {scene} = await this.viz!.assetManager.getAsset<STDLIB.GLTF>('c919');
    console.log('plane', scene);
    scene.scale.multiplyScalar(0.1);
    this.object3D.add(scene);
    this.createOBB();
  }

  // 俯仰角 x轴旋转 传入值为角度
  pitch(x: number) {
    this.targetRotation.x = THREE.MathUtils.degToRad(x);
    this.rotate();
  }

  // 偏航角 y轴旋转 传入值为角度
  heading(y: number) {
    this.targetRotation.y = THREE.MathUtils.degToRad(y);
    this.rotate();
  }

  // 滚转角 z轴旋转 传入值为角度
  roll(z: number) {
    this.targetRotation.z = THREE.MathUtils.degToRad(z);
    this.rotate();
  }

  rotate(posture?: {x?: number; y?: number; z?: number}) {
    if (posture) {
      this.targetRotation = {
        // 攻角抬机头
        x: posture.x !== undefined ? THREE.MathUtils.degToRad(-posture.x) : this.targetRotation.x,
        y: posture.y !== undefined ? THREE.MathUtils.degToRad(posture.y) : this.targetRotation.y,
        z: posture.z !== undefined ? THREE.MathUtils.degToRad(posture.z) : this.targetRotation.z,
      };
    }
    if (this.tween) {
      this.tween.kill();
      this.tween = undefined;
    }
    this.tween = gsap.to(this.object3D.rotation, {
      x: this.targetRotation.x,
      y: this.targetRotation.y,
      z: this.targetRotation.z,
      duration: 1,
      onStart: () => {
        this.viz?.eventManager.emit('rotateStart', {});
      },
      onUpdate: () => {
        this.updateOBB();
      },
      onComplete: () => {
        this.tween = undefined;
        this.viz?.eventManager.emit('rotateEnd', {});
      },
    });
  }

  createOBB() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    this.obbs = boundsConfig.map((config) => {
      const cube = new THREE.Mesh(geometry);
      cube.scale.copy(config.scale);
      cube.position.copy(config.position);
      if (config.rotation) {
        cube.rotation.copy(config.rotation);
      }
      cube.visible = false;
      this.object3D.add(cube);
      cube.updateMatrixWorld();
      const geo = cube.geometry.toNonIndexed();
      geo.applyMatrix4(cube.matrixWorld);
      const position = geo.getAttribute('position');
      const points = [];
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);
        points.push(new YUKA.Vector3(x, y, z));
      }
      const obb = new YUKA.OBB().fromPoints(points);
      // @ts-expect-error bind mesh to obb
      obb.object = cube;
      return obb;
    });
    // if (this.viz?.option.dev) {
    //   this.createOBBHelper();
    // }
  }

  updateOBB() {
    this.obbs.forEach((obb) => {
      // @ts-expect-error get mesh from obb
      const object = obb.object as THREE.Mesh;
      object.updateMatrixWorld();
      const geo = object.geometry.toNonIndexed();
      geo.applyMatrix4(object.matrixWorld);
      const position = geo.getAttribute('position');
      const points = [];
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);
        points.push(new YUKA.Vector3(x, y, z));
      }
      const newObb = new YUKA.OBB().fromPoints(points);
      obb.copy(newObb);
    });
    if (this.viz?.option.dev) {
      this.updateOBBHelper();
    }
  }

  createOBBHelper() {
    this.obbHelpers = this.obbs.map((obb) => {
      const center = obb.center;
      const size = new YUKA.Vector3().copy(obb.halfSizes).multiplyScalar(2);
      const rotation = new YUKA.Quaternion().fromMatrix3(obb.rotation);
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const material = new THREE.MeshBasicMaterial({color: 0xFFFF00, wireframe: true});
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(center);
      mesh.quaternion.copy(rotation);
      this.viz?.scene?.add(mesh);
      return mesh;
    });
  }

  updateOBBHelper() {
    this.obbHelpers.forEach((mesh, index) => {
      const obb = this.obbs[index];
      const center = obb.center;
      const rotation = new YUKA.Quaternion().fromMatrix3(obb.rotation);
      mesh.position.copy(center);
      mesh.quaternion.copy(rotation);
    });
  }

  createBoundGui(mesh: THREE.Mesh, index: number) {
    const gui = this.viz?.guiManager;
    if (!gui)
      return;
    gui.addFolder(`Bound-${index}`, {
      width: {
        value: mesh.scale.x,
        min: 0,
        max: 50,
        step: 0.01,
        onChange: (v) => {
          mesh.scale.x = v;
        },
      },
      height: {
        value: mesh.scale.y,
        min: 0,
        max: 50,
        step: 0.01,
        onChange: (v) => {
          mesh.scale.y = v;
        },
      },
      depth: {
        value: mesh.scale.z,
        min: 0,
        max: 50,
        step: 0.01,
        onChange: (v) => {
          mesh.scale.z = v;
        },
      },
      x: {
        value: mesh.position.x,
        min: -50,
        max: 50,
        step: 0.01,
        onChange: (v) => {
          mesh.position.x = v;
        },
      },
      y: {
        value: mesh.position.y,
        min: -50,
        max: 50,
        step: 0.01,
        onChange: (v) => {
          mesh.position.y = v;
        },
      },
      z: {
        value: mesh.position.z,
        min: -50,
        max: 50,
        step: 0.01,
        onChange: (v) => {
          mesh.position.z = v;
        },
      },
      ry: {
        value: mesh.rotation.y,
        min: -Math.PI / 2,
        max: Math.PI / 2,
        step: 0.01,
        onChange: (v) => {
          mesh.rotation.y = v;
        },
      },
      rz: {
        value: mesh.rotation.z,
        min: -Math.PI / 2,
        max: Math.PI / 2,
        step: 0.01,
        onChange: (v) => {
          mesh.rotation.z = v;
        },
      },
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
    gui.addButton('姿态模拟', () => {
      this.rotate({
        x: -20,
        y: -10,
        z: 0,
      });
    });
    gui.addButton('复原', () => {
      this.rotate({
        x: 0,
        y: 0,
        z: 0,
      });
    });
  }

  dispose() {
    this.tween?.kill();
    this.tween = undefined;
    if (this.obbHelpers.length) {
      this.obbHelpers.length = 0;
    }
    this.obbs.length = 0;
    super.dispose();
  }
}
