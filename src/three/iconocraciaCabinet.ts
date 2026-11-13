import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { AtlasAxis, DeckId } from '../types';

export type CabinetArtifactId = 'venda' | 'moeda' | 'escada';
export type CabinetCameraPreset = 'overview' | CabinetArtifactId;
export type CabinetFinishPreset = 'patina' | 'gesso' | 'numismatica';

export interface CabinetArtifactSpec {
  id: CabinetArtifactId;
  accessionCode: string;
  yearRange: string;
  axis: AtlasAxis;
  title: string;
  subtitle: string;
  juridicalNote: string;
  linkedDeck: DeckId;
  linkedSlideIndex: number;
  atlasEntryId: string;
}

export const CABINET_ARTIFACTS: Record<CabinetArtifactId, CabinetArtifactSpec> = {
  venda: {
    id: 'venda',
    accessionCode: 'GAB. 3D · 01',
    yearRange: '1494–1603',
    axis: 'venda',
    title: 'Alegoria, Venda & Balança da Iustitia',
    subtitle: 'De Brant (1494) e Gieng (1543) à codificação de Cesare Ripa (1603)',
    juridicalNote:
      'Inversão semântica da venda: de escárnio da cegueira forense à insígnia moderna de imparcialidade sob cúpula museológica.',
    linkedDeck: 'representacao',
    linkedSlideIndex: 2,
    atlasEntryId: 'ripa-1603',
  },
  moeda: {
    id: 'moeda',
    accessionCode: 'GAB. 3D · 02',
    yearRange: '1889–1890',
    axis: 'republica',
    title: 'Cunho Monetário & Efígie Republicana',
    subtitle: 'Curso legal cotidiano, serrilha de 72 estrias e barrete frígio',
    juridicalNote:
      'Autenticação material da soberania fiduciária: a alegoria feminina circula de mão em mão como selo de validade estatal.',
    linkedDeck: 'representacao',
    linkedSlideIndex: 9,
    atlasEntryId: 'numismatica-1890',
  },
  escada: {
    id: 'escada',
    accessionCode: 'GAB. 3D · 03',
    yearRange: '1906',
    axis: 'republica',
    title: 'Escadaria & Pórtico Forense Monumental',
    subtitle: '24 degraus de cantaria, colunata clássica e limiar jurisdicional',
    juridicalNote:
      'Coreografia espacial de deferência: a elevação arquitetônica separa a rua profana do espaço autenticado da jurisdição.',
    linkedDeck: 'representacao',
    linkedSlideIndex: 10,
    atlasEntryId: 'escada-1906',
  },
};

// Module-scope reusable math scratchpad (Zero GC inside render loop)
const _camTargetPos = new THREE.Vector3();
const _orbitTargetPos = new THREE.Vector3();
const _partTargetPos = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

interface ExplodablePart {
  object: THREE.Object3D;
  basePos: THREE.Vector3;
  explodeDelta: THREE.Vector3;
}

interface SwappableMaterialSet {
  metals: THREE.MeshPhysicalMaterial[];
  stones: THREE.MeshStandardMaterial[];
  accents: THREE.MeshPhysicalMaterial[];
}

export interface CabinetSceneController {
  isSoftwareGl: boolean;
  setCameraPreset: (preset: CabinetCameraPreset) => void;
  setExplodeFactor: (value: number) => void;
  setFinishPreset: (finish: CabinetFinishPreset) => void;
  captureSnapshotDataUrl: () => string;
  dispose: () => void;
}

const CAMERA_PRESETS: Record<
  CabinetCameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  overview: { pos: [0, 3.85, 8.9], target: [0, 1.15, 0] },
  venda: { pos: [-3.4, 2.35, 3.75], target: [-3.4, 1.35, 0] },
  moeda: { pos: [0, 2.15, 3.55], target: [0, 1.18, 0] },
  escada: { pos: [3.45, 2.5, 4.05], target: [3.45, 1.15, 0] },
};

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.06,
      size / 2,
      size / 2,
      size * 0.48
    );
    grad.addColorStop(0, 'rgba(22, 18, 15, 0.52)');
    grad.addColorStop(0.55, 'rgba(22, 18, 15, 0.22)');
    grad.addColorStop(1, 'rgba(22, 18, 15, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createArchivalFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ece7de';
    ctx.fillRect(0, 0, size, size);

    // Subtle stone grain speckles
    for (let i = 0; i < 3600; i++) {
      const x = (i * 173) % size;
      const y = (i * 293) % size;
      const alpha = (i % 5) * 0.008 + 0.01;
      ctx.fillStyle = i % 2 === 0 ? `rgba(28,28,28,${alpha})` : `rgba(255,255,255,${alpha * 1.4})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Architectural grid & coordinate ticks matching Variation 8 archival paper
    ctx.strokeStyle = 'rgba(28, 28, 28, 0.13)';
    ctx.lineWidth = 1.5;
    const step = size / 8;
    for (let g = 0; g <= size; g += step) {
      ctx.beginPath();
      ctx.moveTo(g, 0);
      ctx.lineTo(g, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, g);
      ctx.lineTo(size, g);
      ctx.stroke();
    }

    // Oxblood crosshair registration marks at intersections
    ctx.strokeStyle = 'rgba(126, 42, 31, 0.34)';
    ctx.lineWidth = 2;
    for (let gx = step; gx < size; gx += step * 2) {
      for (let gy = step; gy < size; gy += step * 2) {
        ctx.beginPath();
        ctx.moveTo(gx - 8, gy);
        ctx.lineTo(gx + 8, gy);
        ctx.moveTo(gx, gy - 8);
        ctx.lineTo(gx, gy + 8);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createNumismaticCoinTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = size / 2;
    const cy = size / 2;
    const grad = ctx.createRadialGradient(cx * 0.85, cy * 0.82, 40, cx, cy, size * 0.5);
    grad.addColorStop(0, '#e3c788');
    grad.addColorStop(0.65, '#b89047');
    grad.addColorStop(1, '#7c5b24');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Concentric beaded numismatic border
    ctx.strokeStyle = '#4a3310';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f5dfb0';
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const px = cx + Math.cos(a) * (size * 0.41);
      const py = cy + Math.sin(a) * (size * 0.41);
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Engraved motto ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#3b270b';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    const inscription = 'REPUBLICA DOS ESTADOS UNIDOS DO BRAZIL · 1889 · ';
    for (let i = 0; i < inscription.length; i++) {
      const angle = (i / inscription.length) * Math.PI * 2 - Math.PI / 2;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillText(inscription[i], 0, -size * 0.34);
      ctx.restore();
    }
    ctx.restore();

    // Stylized profile bust & Phrygian cap emblem in center
    ctx.strokeStyle = '#3b270b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#efd59d';
    ctx.beginPath();
    ctx.moveTo(cx - 85, cy + 95);
    ctx.quadraticCurveTo(cx - 95, cy - 35, cx - 15, cy - 110);
    ctx.quadraticCurveTo(cx + 68, cy - 130, cx + 92, cy - 48);
    ctx.quadraticCurveTo(cx + 52, cy - 12, cx + 78, cy + 40);
    ctx.quadraticCurveTo(cx + 35, cy + 105, cx - 85, cy + 95);
    ctx.fill();
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createFriezeInscriptionTexture(
  text: string,
  subtext: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#dfd9ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#7e2a1f';
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    ctx.fillStyle = '#1c1c1c';
    ctx.font = '600 54px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, 122);

    ctx.fillStyle = '#7e2a1f';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(subtext, canvas.width / 2, 182);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createBeveledRectShape(width: number, depth: number, chamfer = 0.08): THREE.Shape {
  const hw = width / 2;
  const hd = depth / 2;
  const c = Math.min(chamfer, hw * 0.3, hd * 0.3);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + c, -hd);
  shape.lineTo(hw - c, -hd);
  shape.lineTo(hw, -hd + c);
  shape.lineTo(hw, hd - c);
  shape.lineTo(hw - c, hd);
  shape.lineTo(-hw + c, hd);
  shape.lineTo(-hw, hd - c);
  shape.lineTo(-hw, -hd + c);
  shape.closePath();
  return shape;
}

export function mountIconocraciaCabinetScene(options: {
  container: HTMLElement;
  onSelectArtifact: (id: CabinetArtifactId) => void;
  onCameraPresetSettled?: (preset: CabinetCameraPreset) => void;
  onContextStatusChange?: (lost: boolean) => void;
}): CabinetSceneController {
  const { container, onSelectArtifact, onContextStatusChange } = options;
  const isSoftwareGl = detectSoftwareWebGL();

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(res: T): T => {
    disposables.push(res);
    return res;
  };

  const width = Math.max(container.clientWidth, 320);
  const height = Math.max(container.clientHeight, 240);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const bgHex = 0xe9e4db;
  scene.background = new THREE.Color(bgHex);
  scene.fog = new THREE.FogExp2(bgHex, 0.032);

  // Mandatory Studio Environment Map on EVERY device
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  track(envRT);
  pmremGenerator.dispose();

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 80);
  camera.position.set(...CAMERA_PRESETS.overview.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.06;
  controls.autoRotate = false;
  controls.minDistance = 2.1;
  controls.maxDistance = 15.5;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI * 0.485;
  controls.target.set(...CAMERA_PRESETS.overview.target);
  controls.update();

  // Balanced Warm/Cool 3-Point Studio Lighting Rig (<= 3 shadow casters: only 1 caster used)
  const hemiLight = new THREE.HemisphereLight(0xdce6f2, 0x8f7e6a, 0.85);
  hemiLight.position.set(0, 14, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.15);
  keyLight.position.set(6.5, 9.5, 6.2);
  keyLight.castShadow = !isSoftwareGl;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  const shadowBounds = 7.2;
  keyLight.shadow.camera.left = -shadowBounds;
  keyLight.shadow.camera.right = shadowBounds;
  keyLight.shadow.camera.top = shadowBounds;
  keyLight.shadow.camera.bottom = -shadowBounds;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 24;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xf3d4b0, 1.05);
  rimLight.position.set(-6.0, 5.5, -5.8);
  scene.add(rimLight);

  if (!isSoftwareGl) {
    RectAreaLightUniformsLib.init();
    const softboxLeft = new THREE.RectAreaLight(0xfffaf0, 2.8, 4.5, 2.4);
    softboxLeft.position.set(-4.8, 4.8, 3.8);
    softboxLeft.lookAt(-1.5, 1.2, 0);
    scene.add(softboxLeft);

    const softboxRight = new THREE.RectAreaLight(0xeef4ff, 2.2, 4.5, 2.4);
    softboxRight.position.set(4.8, 4.8, 3.8);
    softboxRight.lookAt(1.5, 1.2, 0);
    scene.add(softboxRight);
  }

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const floorTex = track(createArchivalFloorTexture(maxAniso));
  const shadowTex = track(createContactShadowTexture());
  const coinTex = track(createNumismaticCoinTexture(maxAniso));
  const pedimentTex = track(
    createFriezeInscriptionTexture('LEX · IUSTITIA · AUCTORITAS', '1822 — 1906', maxAniso)
  );

  // Ground Plane at y = 0
  const floorGeo = track(new THREE.PlaneGeometry(38, 38));
  const floorMat = track(
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.88,
      metalness: 0.04,
    })
  );
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = 0;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // Shared PBR Materials Palette (tracked for finish presets & disposal)
  const swappable: SwappableMaterialSet = {
    metals: [],
    stones: [],
    accents: [],
  };

  const stoneMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xe3ddd2,
      roughness: 0.82,
      metalness: 0.05,
    })
  );
  const darkStoneMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x383431,
      roughness: 0.68,
      metalness: 0.12,
    })
  );
  swappable.stones.push(stoneMat, darkStoneMat);

  const brushedBronzeMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xb98d48,
      metalness: 0.92,
      roughness: 0.22,
      anisotropy: 0.75,
      clearcoat: 0.25,
    })
  );
  const brushedSteelMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xcfd5dc,
      metalness: 0.95,
      roughness: 0.16,
      anisotropy: 0.85,
      anisotropyRotation: Math.PI / 4,
    })
  );
  swappable.metals.push(brushedBronzeMat, brushedSteelMat);

  const oxbloodVelvetMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x7e2a1f,
      metalness: 0.04,
      roughness: 0.86,
      sheen: 0.95,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0xd06a5c),
    })
  );
  const matteLinenMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf4f0e6,
      metalness: 0.0,
      roughness: 0.9,
      sheen: 0.8,
      sheenRoughness: 0.75,
      sheenColor: new THREE.Color(0xffffff),
    })
  );
  swappable.accents.push(oxbloodVelvetMat, matteLinenMat);

  const vitrineGlassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf7fafc,
      metalness: 0,
      roughness: 0.06,
      transmission: isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: isSoftwareGl ? 0.28 : 1,
      ior: 1.52,
      thickness: 0.7,
      attenuationColor: new THREE.Color(0xeef4f6),
      attenuationDistance: 3.0,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );

  const contactShadowMat = track(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );

  const explodableParts: ExplodablePart[] = [];
  const registerExplodable = (
    object: THREE.Object3D,
    dx: number,
    dy: number,
    dz: number
  ) => {
    explodableParts.push({
      object,
      basePos: object.position.clone(),
      explodeDelta: new THREE.Vector3(dx, dy, dz),
    });
  };

  const pickProxies: THREE.Mesh[] = [];
  const proxyMat = track(new THREE.MeshBasicMaterial({ visible: false }));

  const addContactShadowAndProxy = (
    parentGroup: THREE.Group,
    artifactId: CabinetArtifactId,
    shadowRadius: number,
    proxySize: [number, number, number]
  ) => {
    const shGeo = track(new THREE.PlaneGeometry(shadowRadius * 2, shadowRadius * 2));
    const shMesh = new THREE.Mesh(shGeo, contactShadowMat);
    shMesh.rotation.x = -Math.PI / 2;
    shMesh.position.y = 0.02; // >= 0.02 offset above floor to prevent coplanar Z-fighting
    parentGroup.add(shMesh);

    const proxyGeo = track(new THREE.BoxGeometry(...proxySize));
    const proxy = new THREE.Mesh(proxyGeo, proxyMat);
    proxy.position.set(0, proxySize[1] / 2, 0);
    proxy.layers.set(1);
    proxy.userData.artifactId = artifactId;
    parentGroup.add(proxy);
    pickProxies.push(proxy);
  };

  // ============================================================================
  // ARTIFACT 01: Alegoria, Venda & Balança da Iustitia (1494–1603) — 9 Parts
  // Bottom-center pivot at (-3.4, 0, 0)
  // ============================================================================
  const vendaGroup = new THREE.Group();
  vendaGroup.position.set(-3.4, 0, 0);
  scene.add(vendaGroup);
  addContactShadowAndProxy(vendaGroup, 'venda', 1.45, [2.1, 3.0, 2.1]);

  // Part 1: Beveled Travertine Plinth (ExtrudeGeometry)
  const plinthShape = createBeveledRectShape(1.65, 1.65, 0.12);
  const plinthGeo = track(
    new THREE.ExtrudeGeometry(plinthShape, {
      depth: 0.34,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    })
  );
  plinthGeo.rotateX(-Math.PI / 2);
  const vendaPlinth = new THREE.Mesh(plinthGeo, stoneMat);
  vendaPlinth.position.set(0, 0.03, 0);
  vendaPlinth.castShadow = true;
  vendaPlinth.receiveShadow = true;
  vendaGroup.add(vendaPlinth);

  // Part 2: Molded Pedestal Column (LatheGeometry)
  const pedestalPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.56, 0),
    new THREE.Vector2(0.54, 0.1),
    new THREE.Vector2(0.42, 0.18),
    new THREE.Vector2(0.38, 0.78),
    new THREE.Vector2(0.48, 0.88),
    new THREE.Vector2(0.52, 0.96),
    new THREE.Vector2(0, 0.96),
  ];
  const pedestalGeo = track(new THREE.LatheGeometry(pedestalPts, 36));
  const vendaPedestal = new THREE.Mesh(pedestalGeo, stoneMat);
  vendaPedestal.position.set(0, 0.38, 0);
  vendaPedestal.castShadow = true;
  vendaPedestal.receiveShadow = true;
  vendaGroup.add(vendaPedestal);
  registerExplodable(vendaPedestal, 0, 0.14, 0);

  // Part 3: Classical Allegorical Bust & Torso Column (LatheGeometry)
  const bustPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.24, 0),
    new THREE.Vector2(0.2, 0.25),
    new THREE.Vector2(0.31, 0.55),
    new THREE.Vector2(0.14, 0.72),
    new THREE.Vector2(0.21, 0.96),
    new THREE.Vector2(0.18, 1.14),
    new THREE.Vector2(0, 1.2),
  ];
  const bustGeo = track(new THREE.LatheGeometry(bustPts, 36));
  const allegoricBust = new THREE.Mesh(bustGeo, stoneMat);
  allegoricBust.position.set(0, 1.34, 0);
  allegoricBust.castShadow = true;
  vendaGroup.add(allegoricBust);
  registerExplodable(allegoricBust, 0, 0.38, 0);

  // Part 4: Matte Linen Blindfold Ribbon ("A Venda" — high roughness contrast vs metal)
  const blindfoldCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.22, 0.98, -0.05),
    new THREE.Vector3(-0.18, 1.0, 0.19),
    new THREE.Vector3(0, 1.01, 0.235),
    new THREE.Vector3(0.18, 1.0, 0.19),
    new THREE.Vector3(0.22, 0.98, -0.05),
  ]);
  const blindfoldGeo = track(new THREE.TubeGeometry(blindfoldCurve, 32, 0.036, 10, false));
  const blindfoldMesh = new THREE.Mesh(blindfoldGeo, oxbloodVelvetMat);
  blindfoldMesh.position.set(0, 1.34, 0);
  blindfoldMesh.castShadow = true;
  vendaGroup.add(blindfoldMesh);
  registerExplodable(blindfoldMesh, 0, 0.56, 0.36);

  // Part 5: Brushed Steel Upright Gladius Sword (Blade + Crossguard Group)
  const swordGroup = new THREE.Group();
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.lineTo(0.045, 0.12);
  bladeShape.lineTo(0.032, 0.98);
  bladeShape.lineTo(0, 1.12);
  bladeShape.lineTo(-0.032, 0.98);
  bladeShape.lineTo(-0.045, 0.12);
  bladeShape.closePath();
  const bladeGeo = track(
    new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 2,
    })
  );
  const bladeMesh = new THREE.Mesh(bladeGeo, brushedSteelMat);
  bladeMesh.castShadow = true;
  swordGroup.add(bladeMesh);

  const guardGeo = track(new THREE.CylinderGeometry(0.022, 0.022, 0.32, 16));
  guardGeo.rotateZ(Math.PI / 2);
  const guardMesh = new THREE.Mesh(guardGeo, brushedBronzeMat);
  guardMesh.position.set(0, 0.1, 0.009);
  swordGroup.add(guardMesh);

  swordGroup.position.set(-0.42, 1.36, 0.14);
  swordGroup.rotation.z = -0.08;
  vendaGroup.add(swordGroup);
  registerExplodable(swordGroup, -0.38, 0.45, 0.2);

  // Part 6 & 7: Equilibrium Balance Standard, Beveled Beam & Suspended Brass Pans
  const scalesGroup = new THREE.Group();
  const standardGeo = track(new THREE.CylinderGeometry(0.022, 0.03, 0.85, 20));
  const standardMesh = new THREE.Mesh(standardGeo, brushedBronzeMat);
  standardMesh.position.set(0, 0.42, 0);
  standardMesh.castShadow = true;
  scalesGroup.add(standardMesh);

  const beamShape = createBeveledRectShape(0.76, 0.05, 0.015);
  const beamGeo = track(
    new THREE.ExtrudeGeometry(beamShape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      bevelSegments: 2,
    })
  );
  const beamMesh = new THREE.Mesh(beamGeo, brushedBronzeMat);
  beamMesh.position.set(0, 0.82, -0.015);
  scalesGroup.add(beamMesh);

  const panPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.12, 0.015),
    new THREE.Vector2(0.17, 0.06),
    new THREE.Vector2(0.15, 0.065),
    new THREE.Vector2(0, 0.02),
  ];
  const panGeo = track(new THREE.LatheGeometry(panPts, 28));

  [-0.34, 0.34].forEach((xOff) => {
    const pan = new THREE.Mesh(panGeo, brushedBronzeMat);
    pan.position.set(xOff, 0.48, 0);
    pan.castShadow = true;
    scalesGroup.add(pan);

    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xOff, 0.82, 0),
      new THREE.Vector3(xOff * 0.98, 0.65, 0),
      new THREE.Vector3(xOff, 0.52, 0),
    ]);
    const cordGeo = track(new THREE.TubeGeometry(cordCurve, 12, 0.007, 6, false));
    scalesGroup.add(new THREE.Mesh(cordGeo, brushedSteelMat));
  });

  scalesGroup.position.set(0.44, 1.36, 0.16);
  vendaGroup.add(scalesGroup);
  registerExplodable(scalesGroup, 0.42, 0.48, 0.22);

  // Part 8: Optical Glass Bell Vitrine Dome (depthWrite: false, renderOrder: 8)
  const domePts = [
    new THREE.Vector2(0.74, 0),
    new THREE.Vector2(0.74, 1.18),
    new THREE.Vector2(0.68, 1.42),
    new THREE.Vector2(0.48, 1.62),
    new THREE.Vector2(0.2, 1.72),
    new THREE.Vector2(0, 1.75),
  ];
  const domeGeo = track(new THREE.LatheGeometry(domePts, 42));
  const vitrineDome = new THREE.Mesh(domeGeo, vitrineGlassMat);
  vitrineDome.position.set(0, 1.28, 0);
  vitrineDome.renderOrder = 8;
  vendaGroup.add(vitrineDome);
  registerExplodable(vitrineDome, 0, 0.95, 0);

  // ============================================================================
  // ARTIFACT 02: Moeda Republicana & Curso Legal (1889–1890) — 7 Parts + 72-Reed InstancedMesh
  // Bottom-center pivot at (0, 0, 0)
  // ============================================================================
  const moedaGroup = new THREE.Group();
  moedaGroup.position.set(0, 0, 0);
  scene.add(moedaGroup);
  addContactShadowAndProxy(moedaGroup, 'moeda', 1.45, [2.1, 2.7, 2.1]);

  // Part 1: Dark Stone Museum Plinth
  const coinBaseShape = createBeveledRectShape(1.7, 1.5, 0.12);
  const coinBaseGeo = track(
    new THREE.ExtrudeGeometry(coinBaseShape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    })
  );
  coinBaseGeo.rotateX(-Math.PI / 2);
  const coinPlinth = new THREE.Mesh(coinBaseGeo, darkStoneMat);
  coinPlinth.position.set(0, 0.03, 0);
  coinPlinth.castShadow = true;
  coinPlinth.receiveShadow = true;
  moedaGroup.add(coinPlinth);

  // Part 2: Oxblood Velvet Display Cushion
  const cushionShape = createBeveledRectShape(1.32, 1.05, 0.14);
  const cushionGeo = track(
    new THREE.ExtrudeGeometry(cushionShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
    })
  );
  cushionGeo.rotateX(-Math.PI / 2);
  const cushionMesh = new THREE.Mesh(cushionGeo, oxbloodVelvetMat);
  cushionMesh.position.set(0, 0.47, 0);
  cushionMesh.castShadow = true;
  cushionMesh.receiveShadow = true;
  moedaGroup.add(cushionMesh);
  registerExplodable(cushionMesh, 0, 0.16, 0);

  // Coin Assembly tilted at museum viewing angle (18 degrees)
  const coinAssembly = new THREE.Group();
  coinAssembly.position.set(0, 1.48, 0);
  coinAssembly.rotation.x = -0.22;
  moedaGroup.add(coinAssembly);

  // Part 3: Struck Planchet Disc with Procedural Numismatic Relief Map
  const coinFaceMat = track(
    new THREE.MeshPhysicalMaterial({
      map: coinTex,
      metalness: 0.88,
      roughness: 0.24,
      anisotropy: 0.7,
      clearcoat: 0.2,
    })
  );
  const planchetGeo = track(new THREE.CylinderGeometry(0.76, 0.76, 0.11, 64));
  planchetGeo.rotateX(Math.PI / 2);
  const planchetMesh = new THREE.Mesh(planchetGeo, [
    brushedBronzeMat,
    coinFaceMat,
    coinFaceMat,
  ]);
  planchetMesh.castShadow = true;
  planchetMesh.receiveShadow = true;
  coinAssembly.add(planchetMesh);
  registerExplodable(planchetMesh, 0, 0.34, 0);

  // Part 4: Raised Protective Collar Rim (TorusGeometry)
  const collarGeo = track(new THREE.TorusGeometry(0.76, 0.038, 20, 64));
  const collarFront = new THREE.Mesh(collarGeo, brushedBronzeMat);
  collarFront.position.set(0, 0, 0.055);
  coinAssembly.add(collarFront);
  registerExplodable(collarFront, 0, 0.38, 0.34);

  // Part 5: Raised Central Medallion Boss (LatheGeometry)
  const bossPts = [
    new THREE.Vector2(0, 0.045),
    new THREE.Vector2(0.18, 0.042),
    new THREE.Vector2(0.32, 0.022),
    new THREE.Vector2(0.36, 0),
  ];
  const bossGeo = track(new THREE.LatheGeometry(bossPts, 40));
  bossGeo.rotateX(Math.PI / 2);
  const bossMesh = new THREE.Mesh(bossGeo, brushedBronzeMat);
  bossMesh.position.set(0, 0, 0.056);
  coinAssembly.add(bossMesh);
  registerExplodable(bossMesh, 0, 0.44, 0.56);

  // Part 6: InstancedMesh of 72 Milled Reed Edge Serrations (>20 repeated elements)
  const reedCount = 72;
  const reedGeo = track(new THREE.BoxGeometry(0.018, 0.024, 0.125));
  const reedInstanced = new THREE.InstancedMesh(reedGeo, brushedBronzeMat, reedCount);
  reedInstanced.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(reedCount * 3),
    3
  );
  for (let i = 0; i < reedCount; i++) {
    const theta = (i / reedCount) * Math.PI * 2;
    const r = 0.772;
    _dummy.position.set(Math.cos(theta) * r, Math.sin(theta) * r, 0);
    _dummy.rotation.set(0, 0, theta);
    const scaleJitter = 0.92 + ((i * 7) % 17) * 0.01;
    _dummy.scale.set(1, scaleJitter, 1);
    _dummy.updateMatrix();
    reedInstanced.setMatrixAt(i, _dummy.matrix);

    const shade = 0.92 + ((i * 13) % 10) * 0.015;
    _color.setRGB(shade, shade * 0.96, shade * 0.88);
    reedInstanced.setColorAt(i, _color);
  }
  reedInstanced.instanceMatrix.needsUpdate = true;
  reedInstanced.instanceColor.needsUpdate = true;
  reedInstanced.computeBoundingSphere();
  coinAssembly.add(reedInstanced);
  registerExplodable(reedInstanced, 0, 0.42, -0.32);

  // Part 7: Cradle Support Yoke & Brass Accession Plaque
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.56, 0.92, 0.04),
    new THREE.Vector3(-0.36, 0.64, 0.02),
    new THREE.Vector3(0, 0.58, 0),
    new THREE.Vector3(0.36, 0.64, 0.02),
    new THREE.Vector3(0.56, 0.92, 0.04),
  ]);
  const yokeGeo = track(new THREE.TubeGeometry(yokeCurve, 32, 0.032, 12, false));
  const yokeMesh = new THREE.Mesh(yokeGeo, brushedSteelMat);
  yokeMesh.castShadow = true;
  moedaGroup.add(yokeMesh);
  registerExplodable(yokeMesh, 0, 0.22, -0.18);

  // ============================================================================
  // ARTIFACT 03: Escadaria & Pórtico Forense (1906) — 8 Parts + 24-Step InstancedMesh
  // Bottom-center pivot at (3.45, 0, 0)
  // ============================================================================
  const escadaGroup = new THREE.Group();
  escadaGroup.position.set(3.45, 0, 0);
  scene.add(escadaGroup);
  addContactShadowAndProxy(escadaGroup, 'escada', 1.65, [2.35, 2.8, 2.35]);

  // Part 1: Granite Stereobate Foundation
  const stereoShape = createBeveledRectShape(2.05, 2.15, 0.1);
  const stereoGeo = track(
    new THREE.ExtrudeGeometry(stereoShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 2,
    })
  );
  stereoGeo.rotateX(-Math.PI / 2);
  const stereoMesh = new THREE.Mesh(stereoGeo, darkStoneMat);
  stereoMesh.position.set(0, 0.025, 0);
  stereoMesh.castShadow = true;
  stereoMesh.receiveShadow = true;
  escadaGroup.add(stereoMesh);

  // Part 2: InstancedMesh of 24 Ashlar Stone Steps (12 tiers x 2 split ashlar blocks)
  const stepTiers = 12;
  const stepBlocksCount = stepTiers * 2;
  const stepBlockGeo = track(new THREE.BoxGeometry(0.68, 0.082, 0.16));
  const stepsInstanced = new THREE.InstancedMesh(stepBlockGeo, stoneMat, stepBlocksCount);
  stepsInstanced.castShadow = true;
  stepsInstanced.receiveShadow = true;
  stepsInstanced.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(stepBlocksCount * 3),
    3
  );

  let instanceIdx = 0;
  for (let tier = 0; tier < stepTiers; tier++) {
    const y = 0.29 + tier * 0.078;
    const z = 0.86 - tier * 0.115;
    for (let side = 0; side < 2; side++) {
      const x = side === 0 ? -0.35 : 0.35;
      _dummy.position.set(x, y, z);
      _dummy.rotation.set(0, 0, 0);
      const widthScale = 0.98 + ((tier + side) % 3) * 0.015;
      _dummy.scale.set(widthScale, 1, 1);
      _dummy.updateMatrix();
      stepsInstanced.setMatrixAt(instanceIdx, _dummy.matrix);

      const tone = 0.94 + ((tier * 5 + side * 3) % 9) * 0.012;
      _color.setRGB(tone, tone * 0.99, tone * 0.96);
      stepsInstanced.setColorAt(instanceIdx, _color);
      instanceIdx++;
    }
  }
  stepsInstanced.instanceMatrix.needsUpdate = true;
  stepsInstanced.instanceColor.needsUpdate = true;
  stepsInstanced.computeBoundingSphere();
  escadaGroup.add(stepsInstanced);
  registerExplodable(stepsInstanced, 0, 0.22, 0.34);

  // Part 3: Stepped Cheek-Walls / Parapets (Beveled ExtrudeGeometry)
  const cheekShape = new THREE.Shape();
  cheekShape.moveTo(-0.95, 0);
  cheekShape.lineTo(0.95, 0);
  cheekShape.lineTo(0.95, 0.28);
  cheekShape.lineTo(-0.22, 1.08);
  cheekShape.lineTo(-0.95, 1.08);
  cheekShape.closePath();
  const cheekGeo = track(
    new THREE.ExtrudeGeometry(cheekShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    })
  );
  cheekGeo.rotateY(Math.PI / 2);

  const leftCheek = new THREE.Mesh(cheekGeo, stoneMat);
  leftCheek.position.set(-0.86, 0.25, 0);
  leftCheek.castShadow = true;
  leftCheek.receiveShadow = true;
  escadaGroup.add(leftCheek);
  registerExplodable(leftCheek, -0.32, 0.16, 0);

  const rightCheek = new THREE.Mesh(cheekGeo, stoneMat);
  rightCheek.position.set(0.72, 0.25, 0);
  rightCheek.castShadow = true;
  rightCheek.receiveShadow = true;
  escadaGroup.add(rightCheek);
  registerExplodable(rightCheek, 0.32, 0.16, 0);

  // Part 4: Upper Stylobate & Recessed Bronze Portal Doors
  const upperDeckGeo = track(new THREE.BoxGeometry(1.72, 0.96, 0.68));
  const upperDeck = new THREE.Mesh(upperDeckGeo, stoneMat);
  upperDeck.position.set(0, 0.73, -0.62);
  upperDeck.castShadow = true;
  upperDeck.receiveShadow = true;
  escadaGroup.add(upperDeck);

  const portalGroup = new THREE.Group();
  const cellaWallGeo = track(new THREE.BoxGeometry(1.52, 1.08, 0.28));
  const cellaWall = new THREE.Mesh(cellaWallGeo, stoneMat);
  cellaWall.position.set(0, 1.75, -0.76);
  cellaWall.castShadow = true;
  portalGroup.add(cellaWall);

  const bronzeDoorGeo = track(new THREE.BoxGeometry(0.56, 0.88, 0.06));
  const bronzeDoors = new THREE.Mesh(bronzeDoorGeo, brushedBronzeMat);
  bronzeDoors.position.set(0, 1.65, -0.6);
  portalGroup.add(bronzeDoorGeo ? bronzeDoors : cellaWall);
  escadaGroup.add(portalGroup);
  registerExplodable(portalGroup, 0, 0.36, -0.34);

  // Part 5: Four Classical Columns (LatheGeometry)
  const colPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.11, 0),
    new THREE.Vector2(0.1, 0.08),
    new THREE.Vector2(0.078, 0.12),
    new THREE.Vector2(0.068, 0.96),
    new THREE.Vector2(0.105, 1.02),
    new THREE.Vector2(0.115, 1.08),
    new THREE.Vector2(0, 1.08),
  ];
  const colGeo = track(new THREE.LatheGeometry(colPts, 28));
  const colonnadeGroup = new THREE.Group();
  [-0.66, -0.24, 0.24, 0.66].forEach((cx) => {
    const col = new THREE.Mesh(colGeo, stoneMat);
    col.position.set(cx, 1.21, -0.38);
    col.castShadow = true;
    col.receiveShadow = true;
    colonnadeGroup.add(col);
  });
  escadaGroup.add(colonnadeGroup);
  registerExplodable(colonnadeGroup, 0, 0.5, 0.12);

  // Part 6: Inscribed Entablature & Classical Triangular Pediment
  const pedimentGroup = new THREE.Group();
  const friezeMat = track(
    new THREE.MeshStandardMaterial({
      map: pedimentTex,
      roughness: 0.72,
      metalness: 0.06,
    })
  );
  const architraveGeo = track(new THREE.BoxGeometry(1.68, 0.18, 0.58));
  const architraveMesh = new THREE.Mesh(architraveGeo, [
    stoneMat,
    stoneMat,
    stoneMat,
    stoneMat,
    friezeMat,
    stoneMat,
  ]);
  architraveMesh.position.set(0, 2.38, -0.56);
  architraveMesh.castShadow = true;
  pedimentGroup.add(architraveMesh);

  const tympanumShape = new THREE.Shape();
  tympanumShape.moveTo(-0.92, 0);
  tympanumShape.lineTo(0.92, 0);
  tympanumShape.lineTo(0, 0.44);
  tympanumShape.closePath();
  const tympanumGeo = track(
    new THREE.ExtrudeGeometry(tympanumShape, {
      depth: 0.56,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    })
  );
  const tympanumMesh = new THREE.Mesh(tympanumGeo, stoneMat);
  tympanumMesh.position.set(0, 2.47, -0.84);
  tympanumMesh.castShadow = true;
  pedimentGroup.add(tympanumMesh);
  escadaGroup.add(pedimentGroup);
  registerExplodable(pedimentGroup, 0, 0.82, 0);

  // Part 7: Analytical Oxblood Threshold Axis (Ascent Curve)
  const ascentCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.28, 0.96),
    new THREE.Vector3(0, 0.76, 0.28),
    new THREE.Vector3(0, 1.26, -0.34),
  ]);
  const ascentGeo = track(new THREE.TubeGeometry(ascentCurve, 28, 0.018, 10, false));
  const ascentMesh = new THREE.Mesh(ascentGeo, oxbloodVelvetMat);
  escadaGroup.add(ascentMesh);
  registerExplodable(ascentMesh, 0, 0.62, 0.42);

  // Pre-warm shaders once on hardware GPUs
  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }

  // ============================================================================
  // Smooth Damped Transitions & On-Demand Render Pacing
  // ============================================================================
  let currentExplode = 0;
  let targetExplode = 0;
  let cameraFlightActive = false;
  let desiredCamPos = new THREE.Vector3(...CAMERA_PRESETS.overview.pos);
  let desiredTargetPos = new THREE.Vector3(...CAMERA_PRESETS.overview.target);

  let frameId = 0;
  let renderBusy = false;
  let renderDirty = false;
  let disposed = false;
  let lastTickMs = performance.now();

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function' || gl.isContextLost()) {
      frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 80);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  function advanceTransitions(dt: number): boolean {
    let stillMoving = false;

    // 1. Exploded-view exponential damping
    if (Math.abs(targetExplode - currentExplode) > 0.001) {
      currentExplode = isSoftwareGl
        ? targetExplode
        : THREE.MathUtils.damp(currentExplode, targetExplode, 7.5, dt);
      for (let i = 0; i < explodableParts.length; i++) {
        const item = explodableParts[i];
        _partTargetPos
          .copy(item.basePos)
          .addScaledVector(item.explodeDelta, currentExplode);
        item.object.position.copy(_partTargetPos);
      }
      stillMoving = !isSoftwareGl && Math.abs(targetExplode - currentExplode) > 0.002;
    }

    // 2. Smooth camera flight damping
    if (cameraFlightActive) {
      if (isSoftwareGl) {
        camera.position.copy(desiredCamPos);
        controls.target.copy(desiredTargetPos);
        cameraFlightActive = false;
      } else {
        const lambda = 6.2;
        _camTargetPos.set(
          THREE.MathUtils.damp(camera.position.x, desiredCamPos.x, lambda, dt),
          THREE.MathUtils.damp(camera.position.y, desiredCamPos.y, lambda, dt),
          THREE.MathUtils.damp(camera.position.z, desiredCamPos.z, lambda, dt)
        );
        _orbitTargetPos.set(
          THREE.MathUtils.damp(controls.target.x, desiredTargetPos.x, lambda, dt),
          THREE.MathUtils.damp(controls.target.y, desiredTargetPos.y, lambda, dt),
          THREE.MathUtils.damp(controls.target.z, desiredTargetPos.z, lambda, dt)
        );
        camera.position.copy(_camTargetPos);
        controls.target.copy(_orbitTargetPos);

        if (
          camera.position.distanceToSquared(desiredCamPos) < 0.0004 &&
          controls.target.distanceToSquared(desiredTargetPos) < 0.0004
        ) {
          camera.position.copy(desiredCamPos);
          controls.target.copy(desiredTargetPos);
          cameraFlightActive = false;
        } else {
          stillMoving = true;
        }
      }
    }

    const controlsChanged = controls.update();
    return stillMoving || Boolean(controlsChanged && !isSoftwareGl);
  }

  function requestRender() {
    if (disposed) return;
    if (renderBusy) {
      renderDirty = true;
      return;
    }
    renderBusy = true;
    frameId = requestAnimationFrame(() => {
      if (disposed) return;
      renderDirty = false;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTickMs) / 1000));
      lastTickMs = now;

      const keepAnimating = advanceTransitions(dt);
      renderer.render(scene, camera);

      const done = () => {
        renderBusy = false;
        if (renderDirty || keepAnimating) {
          requestRender();
        }
      };

      if (isSoftwareGl) {
        afterDraw(done);
      } else {
        done();
      }
    });
  }

  // Cancel scripted camera flight immediately when user grabs OrbitControls
  const onControlsStart = () => {
    cameraFlightActive = false;
  };
  const onControlsChange = () => {
    requestRender();
  };
  controls.addEventListener('start', onControlsStart);
  controls.addEventListener('change', onControlsChange);

  // Layer-1 Raycasting for Hover Cursor & Click-to-Inspect
  const raycaster = new THREE.Raycaster();
  raycaster.layers.set(1);
  const pointer = new THREE.Vector2();
  let pointerDownX = 0;
  let pointerDownY = 0;
  let lastHoverCheck = 0;

  const updatePointerNdc = (ev: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
  };

  const onPointerDown = (ev: PointerEvent) => {
    pointerDownX = ev.clientX;
    pointerDownY = ev.clientY;
  };

  const onPointerMove = (ev: PointerEvent) => {
    const now = performance.now();
    if (now - lastHoverCheck < 55) return;
    lastHoverCheck = now;
    updatePointerNdc(ev);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickProxies, false);
    renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
  };

  const onPointerUp = (ev: PointerEvent) => {
    const moved = Math.hypot(ev.clientX - pointerDownX, ev.clientY - pointerDownY);
    if (moved > 6) return;
    updatePointerNdc(ev);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickProxies, false);
    if (hits.length > 0) {
      const id = hits[0].object.userData.artifactId as CabinetArtifactId | undefined;
      if (id) {
        onSelectArtifact(id);
        setCameraPreset(id);
      }
    }
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);

  // WebGL Context Loss & Restoration Safety
  const onContextLost = (e: Event) => {
    e.preventDefault();
    onContextStatusChange?.(true);
  };
  const onContextRestored = () => {
    onContextStatusChange?.(false);
    requestRender();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  // Responsive ResizeObserver
  const handleResize = () => {
    if (disposed) return;
    const w = Math.max(container.clientWidth, 320);
    const h = Math.max(container.clientHeight, 240);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    requestRender();
  };
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  function setCameraPreset(preset: CabinetCameraPreset) {
    const cfg = CAMERA_PRESETS[preset];
    desiredCamPos.set(...cfg.pos);
    desiredTargetPos.set(...cfg.target);
    cameraFlightActive = true;
    lastTickMs = performance.now();
    requestRender();
    options.onCameraPresetSettled?.(preset);
  }

  function setExplodeFactor(value: number) {
    targetExplode = THREE.MathUtils.clamp(value, 0, 1);
    lastTickMs = performance.now();
    requestRender();
  }

  function setFinishPreset(finish: CabinetFinishPreset) {
    if (finish === 'patina') {
      stoneMat.color.setHex(0xe3ddd2);
      stoneMat.roughness = 0.82;
      darkStoneMat.color.setHex(0x383431);
      brushedBronzeMat.color.setHex(0xb98d48);
      brushedBronzeMat.roughness = 0.22;
      brushedSteelMat.color.setHex(0xcfd5dc);
      oxbloodVelvetMat.color.setHex(0x7e2a1f);
    } else if (finish === 'gesso') {
      stoneMat.color.setHex(0xf4f1ec);
      stoneMat.roughness = 0.92;
      darkStoneMat.color.setHex(0xd4cec4);
      brushedBronzeMat.color.setHex(0x9da3aa);
      brushedBronzeMat.roughness = 0.32;
      brushedSteelMat.color.setHex(0xe2e6eb);
      oxbloodVelvetMat.color.setHex(0x524c46);
    } else {
      stoneMat.color.setHex(0xd8d0c3);
      stoneMat.roughness = 0.74;
      darkStoneMat.color.setHex(0x231f1d);
      brushedBronzeMat.color.setHex(0xd4a853);
      brushedBronzeMat.roughness = 0.15;
      brushedSteelMat.color.setHex(0xb89c64);
      oxbloodVelvetMat.color.setHex(0x88291d);
    }
    requestRender();
  }

  function captureSnapshotDataUrl(): string {
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  }

  // Initial Draw
  requestRender();

  return {
    isSoftwareGl,
    setCameraPreset,
    setExplodeFactor,
    setFinishPreset,
    captureSnapshotDataUrl,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('change', onControlsChange);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      for (const item of disposables) {
        item.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
