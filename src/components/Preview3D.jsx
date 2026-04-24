import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Outlines } from '@react-three/drei';
import * as THREE from 'three';

// Lightweight 3D preview: map 2D canvas elements to simple meshes.
// 2D: x right, y down (meters). 3D: X = x - cx, Z = y - cy (so 2D top = 3D -Z, 2D bottom = 3D +Z; no vertical mirror).
// Scene centered with cx, cy.

// Layer Y 分层：从低到高 grass → 广场 → playground → fitness → 路径 → 水体（水体最高）
const LAYER_GRASS = 0.02;
const LAYER_PLAZA = 0.045;
const LAYER_PLAY = 0.07;
const LAYER_FITNESS = 0.10;
const LAYER_PATH = 0.13;
const LAYER_WATER = 0.16;
const COMMUNITY_HUB_HEIGHT = 2.5;

/**
 * 手绘水彩色——与 App.jsx 中 DISPLAY_COLORS 保持视觉统一。
 * 注：不改 LIBRARY.color（JSON 导出字段仍维持原值），仅 3D / 2D 显示使用这里。
 */
const DISPLAY_COLORS = {
  'tree-small':    '#b9d59a',
  'tree-medium':   '#8bb36a',
  'tree-large':    '#5c8a49',
  'shrub-small':   '#c5d89b',
  'shrub-medium':  '#a7c17d',
  'shrub-large':   '#8fa95e',
  'grass-organic': '#c9dcac',
  'grass':         '#d0dfb3',
  'water-organic': '#a7c7d6',
  'pond-circular': '#b9d3df',
  'fountain':      '#9dbfce',
  'bench':         '#d4a373',
  'table':         '#c58e57',
  'lamp':          '#e6cf87',
  'trash':         '#bfb7a8',
  'bike':          '#a8a192',
  'plaza-rect':    '#e8dfc6',
  'plaza-circle':  '#d8c9a7',
  'court-l':       '#c9b892',
  'play-area':     '#e6c285',
  'fitness':       '#c7a7d1',
};
const getDisplayColor = (el) => (el && DISPLAY_COLORS[el.type]) || el?.color || '#b9d59a';

const OUTLINE_COLOR = '#2a2824';
const OUTLINE_THICKNESS = 0.04; // 相对 toon 外壳的厚度（单位 ≈ 米，足以形成明显黑线但不堵塞小物件）
/** 开关：用户可在 .env 设 VITE_3D_OUTLINE=false 关掉描边，兜底低端显卡 */
const OUTLINE_ENABLED = import.meta.env?.VITE_3D_OUTLINE !== 'false';

function getLayerY(el) {
  const t = el.type;
  if (['water-organic', 'water-area', 'pond-circular', 'reflecting-pool'].includes(t)) return LAYER_WATER;
  if (['court-l'].includes(t)) return LAYER_PATH;
  if (t === 'play-area') return LAYER_PLAY;
  if (t === 'fitness') return LAYER_FITNESS;
  if (['plaza-rect', 'plaza-circle'].includes(t)) return LAYER_PLAZA;
  return LAYER_GRASS;
}

function hexToThreeColor(hex) {
  return new THREE.Color(hex);
}

// 将 organic 的贝塞尔顶点展平为多边形点（与 App.jsx 中逻辑一致）
function flattenOrganic(vertices) {
  if (!vertices || vertices.length < 3) return [];
  const flattened = [];
  const segments = 6;
  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % vertices.length];
    for (let t = 0; t < segments; t++) {
      const step = t / segments;
      const x = (1 - step) * (1 - step) * p1.x + 2 * (1 - step) * step * ((p1.x + p2.x) / 2) + step * step * p2.x;
      const y = (1 - step) * (1 - step) * p1.y + 2 * (1 - step) * step * ((p1.y + p2.y) / 2) + step * step * p2.y;
      flattened.push({ x, y });
    }
  }
  return flattened;
}

// 根据顶点构建 Three.js Shape（局部坐标：原点为元素中心，2D y 向下 = 3D 中 shape 的 y 取反后为 Z）
function shapeFromVertices(vertices, w, h, isOrganic) {
  const points = isOrganic ? flattenOrganic(vertices) : (vertices || []);
  if (points.length < 3) return null;
  const cx = w / 2;
  const cy = h / 2;
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x - cx, cy - points[0].y);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x - cx, cy - points[i].y);
  }
  shape.closePath();
  return shape;
}

/** L 形路径默认 6 顶点（与 App.jsx getLShapeVertices 一致） */
function getLShapeDefaultVertices(w, h) {
  return [
    { x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h * 0.3 }, { x: w * 0.3, y: h * 0.3 }, { x: w * 0.3, y: h }, { x: 0, y: h },
  ];
}

/** 小工具：根据厚度渲染黑色描边（低端显卡可关闭） */
const ToonOutline = ({ thickness = OUTLINE_THICKNESS }) => (
  OUTLINE_ENABLED ? <Outlines thickness={thickness} color={OUTLINE_COLOR} angle={0} /> : null
);

function ElementMesh({ el, cx, cy }) {
  const w = el.width || 1;
  const h = el.height || 1;
  const x = (el.x + w / 2) - cx;
  const z = (el.y + h / 2) - cy;
  const rotY = (-el.rotation * Math.PI) / 180;
  const color = hexToThreeColor(getDisplayColor(el));
  const isTree = /^tree-/.test(el.type);
  const isShrub = /^shrub-/.test(el.type);
  const isFountain = el.type === 'fountain';
  const isLamp = el.type === 'lamp';
  const isCommunityHub = el.type === 'plaza-circle';
  const isFlat = ['grass', 'grass-organic', 'water-organic', 'water-area', 'pond-circular', 'reflecting-pool', 'plaza-rect', 'plaza-circle', 'court-l', 'play-area', 'fitness'].includes(el.type) || el.shape === 'organic' || el.shape === 'polygon';

  if (isCommunityHub) {
    const r = Math.max(w, h) / 2;
    const layerY = getLayerY(el);
    return (
      <group position={[x, layerY + COMMUNITY_HUB_HEIGHT / 2, z]} rotation={[0, rotY, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[r, r, COMMUNITY_HUB_HEIGHT, 16]} />
          <meshToonMaterial color={color} />
          <ToonOutline thickness={0.06} />
        </mesh>
      </group>
    );
  }

  if (isTree) {
    const trunkH = Math.max(1.2, h * 0.45);
    const foliageR = Math.max(0.8, Math.min(w, h) * 0.4);
    return (
      <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
        <mesh position={[0, trunkH / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.08, w * 0.12, trunkH, 6]} />
          <meshToonMaterial color="#6b4f2f" />
          <ToonOutline thickness={0.03} />
        </mesh>
        <mesh position={[0, trunkH + foliageR * 0.6, 0]} castShadow>
          <sphereGeometry args={[foliageR, 6, 5]} />
          <meshToonMaterial color={color} />
          <ToonOutline thickness={0.05} />
        </mesh>
      </group>
    );
  }

  if (isShrub) {
    const r = Math.max(0.4, (w + h) / 4);
    return (
      <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
        <mesh position={[0, r * 0.6, 0]} castShadow>
          <sphereGeometry args={[r, 6, 5]} />
          <meshToonMaterial color={color} />
          <ToonOutline thickness={0.03} />
        </mesh>
      </group>
    );
  }

  if (isFountain) {
    return (
      <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.4, w * 0.45, 0.4, 12]} />
          <meshToonMaterial color={color} />
          <ToonOutline thickness={0.03} />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[w * 0.2, 6, 5]} />
          <meshToonMaterial color="#d6e8ef" />
          <ToonOutline thickness={0.03} />
        </mesh>
      </group>
    );
  }

  if (isLamp) {
    return (
      <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 1, 8]} />
          <meshToonMaterial color="#78716c" />
          <ToonOutline thickness={0.02} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.2, 6, 5]} />
          <meshToonMaterial color="#e6cf87" emissive="#e6cf87" emissiveIntensity={0.25} />
          <ToonOutline thickness={0.02} />
        </mesh>
      </group>
    );
  }

  if (isFlat) {
    const layerY = getLayerY(el);
    const isPolyOrOrganic = (el.shape === 'polygon' || el.shape === 'organic') && el.vertices && el.vertices.length >= 3;
    const isLShape = el.type === 'court-l' && el.shape === 'l-shape';
    const lShapeVertices = isLShape ? (el.vertices && el.vertices.length >= 3 ? el.vertices : getLShapeDefaultVertices(w, h)) : null;
    const shape = isPolyOrOrganic ? shapeFromVertices(el.vertices, w, h, el.shape === 'organic') : (isLShape && lShapeVertices ? shapeFromVertices(lShapeVertices, w, h, false) : null);
    const size = el.shape === 'circle' ? Math.max(w, h) : 1;
    const sx = el.shape === 'circle' ? size : w;
    const sz = el.shape === 'circle' ? size : h;
    return (
      <group position={[x, layerY, z]} rotation={[0, rotY, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          {shape ? (
            <shapeGeometry args={[shape]} />
          ) : el.shape === 'circle' ? (
            <circleGeometry args={[sx / 2, 16]} />
          ) : (
            <planeGeometry args={[sx, sz]} />
          )}
          <meshToonMaterial color={color} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-2} />
        </mesh>
      </group>
    );
  }

  // Default: bench, table, trash, bike, etc. — simple box
  const boxH = Math.min(1.2, h * 0.5) || 0.4;
  return (
    <group position={[x, boxH / 2, z]} rotation={[0, rotY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, boxH, h]} />
        <meshToonMaterial color={color} />
        <ToonOutline thickness={0.03} />
      </mesh>
    </group>
  );
}

function Scene({ elements, canvasMetersW, canvasMetersH }) {
  const cx = canvasMetersW / 2;
  const cy = canvasMetersH / 2;
  const ext = Math.max(canvasMetersW, canvasMetersH) * 0.6;

  const sorted = useMemo(() => {
    const order = (el) => {
      const t = el.type;
      if (['water-organic', 'water-area', 'pond-circular', 'reflecting-pool'].includes(t)) return 5;
      if (t === 'court-l') return 4;
      if (t === 'fitness') return 3;
      if (t === 'play-area') return 2;
      if (['plaza-rect', 'plaza-circle'].includes(t)) return 1;
      return 0;
    };
    return [...elements].sort((a, b) => order(a) - order(b));
  }, [elements]);

  return (
    <>
      {/* 柔和环境光 + 暖色主光，保留 toon 层次不被强光洗掉 */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[ext, ext * 1.2, ext]} intensity={0.55} castShadow shadow-mapSize={[512, 512]} shadow-camera-far={500} shadow-camera-left={-80} shadow-camera-right={80} shadow-camera-top={80} shadow-camera-bottom={-80} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[canvasMetersW + 20, canvasMetersH + 20]} />
        <meshToonMaterial color="#e8dfc6" />
      </mesh>
      {sorted.map((el) => (
        <ElementMesh key={el.id} el={el} cx={cx} cy={cy} />
      ))}
      <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={20} maxDistance={180} maxPolarAngle={Math.PI / 2 - 0.1} />
    </>
  );
}

export default function Preview3D({ elements, canvasMetersW, canvasMetersH }) {
  const w = canvasMetersW || 100;
  const h = canvasMetersH || 100;
  const cameraPos = useMemo(() => [w * 0.4, h * 0.5, h * 0.6], [w, h]);

  return (
    <div
      className="w-full h-full min-h-[280px] rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#faf6ec',
        border: '1.5px solid #2a2824',
        boxShadow: '2px 3px 0 rgba(42,40,36,0.15)',
      }}
    >
      <Canvas
        camera={{ position: cameraPos, fov: 45, near: 0.5, far: 800 }}
        shadows
        gl={{ antialias: true, powerPreference: 'low-power', stencil: false, depth: true }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ background: '#faf6ec' }}
      >
        <Scene elements={elements} canvasMetersW={w} canvasMetersH={h} />
      </Canvas>
    </div>
  );
}
