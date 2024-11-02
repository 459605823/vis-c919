import {THREE, Viz} from '@f80975/viz.js';
import * as YUKA from 'yuka';
import {componentManager} from './components';

const isDev = import.meta.env.DEV || window.location.search.includes('dev');

function createLineTexture(lineColor: string, lightColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 256, 1);
  gradient.addColorStop(0, lineColor);
  gradient.addColorStop(0.5, lightColor);
  gradient.addColorStop(1, lineColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const texture = createLineTexture('rgba(255,255,255,0)', 'rgba(255,255,255,128)');

const parabola = (x: number, k: number) => (4 * x * (1 - x)) ** k;

export default class {
  viz: Viz;

  get Plane() {
    return componentManager.getInstance('Plane')!;
  }

  constructor(container: HTMLElement) {
    const viz = new Viz({
      container,
      dev: isDev,
      grid: false,
      scene: {
        fog: new THREE.FogExp2('#141b23', 0.01),
        background: new THREE.Color('#141b23'),
      },
      camera: {
        position: new THREE.Vector3(37, 16.5, 52),
      },
    }, {
      componentManager,
    });
    viz.assetManager.setAsset([
      {
        url: '/vis/c919.glb',
        name: 'c919',
        type: 'gltf',
        version: '0.0.1',
      },
      {
        url: '/vis/ground.glb',
        name: 'ground',
        type: 'gltf',
        version: '0.0.2',
      },
      {
        url: '/vis/env.jpg',
        name: 'envMap',
        type: 'texture',
      },
    ]);
    viz.cameraControl!.maxPolarAngle = Math.PI / 2;
    viz.cameraControl!.minDistance = 10;
    viz.cameraControl!.maxDistance = 100;
    this.viz = viz;
    if (isDev) {
      // @ts-expect-error bind viz to window
      window.viz = viz;
      // @ts-expect-error bind componentManager to window
      window.cm = componentManager;
    }
  }

  async init() {
    await this.viz.assetManager.load();
    await this.loadEnvMap();
    await Promise.all([
      componentManager.draw('Plane'),
      componentManager.draw('Ground'),
    ]);
    await this.drawFlyline();
    this.setGui();
    this.start();
    this.viz.eventManager.on('rotateEnd', () => {
      console.log('rotateEnd');
      this.drawFlyline();
    });
  }

  start() {
    this.viz.start({frameRate: 30, fn: () => {
      this.update();
    }});
  }

  stop() {
    this.viz.stop();
  }

  update() {
    if (this.Plane.rotating) {
      this.updateFlyline();
    }
  }

  handlePlanePostureChange(posture: {x?: number; y?: number; z?: number}) {
    const plane = componentManager.getInstance('Plane')!;
    plane.rotate(posture);
  }

  buildFlylinePath(from: THREE.Vector3, to: THREE.Vector3) {
    const c1 = from.clone().lerp(to, 0.25);
    let points = new THREE.QuadraticBezierCurve3(from, c1, to).getPoints(10).map(p => new YUKA.Vector3(p.x, p.y, p.z));
    const c1Dir = Math.random() > 0.5 ? 1 : -1;
    while (this.checkFlylineIntersection(points)) {
      c1.y += c1Dir * 0.1;
      c1.x += c1Dir * 0.1;
      points = new THREE.QuadraticBezierCurve3(from, c1, to).getPoints(10).map(p => new YUKA.Vector3(p.x, p.y, p.z));
    }
    return points.map(p => new THREE.Vector3(p.x, p.y, p.z));
  }

  checkFlylineIntersection(points: YUKA.Vector3[]) {
    const obbs = this.Plane.obbs;
    return obbs.some((obb) => {
      for (let i = 0; i < points.length; i++) {
        if (obb.containsPoint(points[i])) {
          return true;
        }
      }
      return false;
    });
  }

  async drawFlyline(count = 20) {
    const path = [];
    const interval = 50 / count;
    for (let i = 0; i < count; i++) {
      path.push(this.buildFlylinePath(new THREE.Vector3(-24 + i * interval, THREE.MathUtils.randFloat(-2, 2), 50), new THREE.Vector3(-24 + i * interval, THREE.MathUtils.randFloat(-2, 2), -50)));
    }
    await Promise.all([
      path.map(p => componentManager.draw('Line', {
        points: p,
        wcb: p => parabola(p, 1),
        material: {
          color: 0xFFFFFF,
          map: texture,
          useMap: 1,
          sizeAttenuation: 1,
          lineWidth: 0.2,
        },
        speed: Math.random() * 0.03 + 0.05,
        visibleLength: 1,
        animation: 'dash',
      }).then((line) => {
        line.userData.points = p.map(p => new YUKA.Vector3(p.x, p.y, p.z));
      })),
    ]);
  }

  updateFlyline() {
    const flylines = componentManager.getInstances('Line');
    flylines.forEach((line) => {
      if (this.checkFlylineIntersection(line.userData.points)) {
        componentManager.erase(line);
      }
    });
  }

  async loadEnvMap() {
    const pmremGenerator = new THREE.PMREMGenerator(this.viz.renderer!);
    pmremGenerator.compileEquirectangularShader();
    const texture = await this.viz.assetManager.getAsset<THREE.Texture>('envMap');
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    this.viz.scene!.environment = envMap;
    pmremGenerator.dispose();
  }

  setGui() {
    const guiManager = this.viz.guiManager;
    if (!guiManager)
      return;
    guiManager.addFolder('环境贴图', {
      environmentIntensity: {
        label: '环境光强度',
        value: this.viz.scene!.environmentIntensity,
        min: 0,
        max: 6,
        step: 0.1,
        onChange: (value: number) => {
          this.viz.scene!.environmentIntensity = value;
        },
      },
    });
  }

  dispose() {
    texture.dispose();
    this.viz.dispose();
  }
}
