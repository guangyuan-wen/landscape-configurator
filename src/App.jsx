import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Map as MapIcon, 
  Download, 
  Trash2, 
  Move, 
  Trees, 
  Armchair, 
  Layout, 
  Info,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Settings2, 
  Lock,
  Unlock,
  Waves,
  Zap,
  Plus,
  Minus,
  RotateCw,
  RotateCcw,
  Scaling,
  MousePointer2,
  Focus,
  Link as LinkIcon,
  Unlink as UnlinkIcon,
  Copy,
  Trash,
  X,
  Sun,
  DollarSign,
  Calculator,
  PlusCircle,
  LayoutTemplate,
  FolderOpen,
  Undo2,
  Redo2
} from 'lucide-react';
import Preview3D from './components/Preview3D';

/**
 * Landscape Configurator Pro v0.5.1
 * Features:
 * - Market-Adjusted Pricing: Realistic costs for Singapore landscape projects.
 * - Synchronized Budgeting: Sidebar displays USD/SGD to match Analysis HUD.
 * - Organic Curve Engine: Smooth spline interpolation for natural shapes.
 * - Vertex Manipulation: Irregular polygon support for Grass/Water.
 */

const GRID_SIZE = 40; 
const CANVAS_METERS = 100;
const USD_TO_SGD = 1.35;
const DEFAULT_BASEMAP_PATH = '/default-basemap.png';
const TEMPLATE_CANVAS_METERS_W = 112;
const TEMPLATE_CANVAS_METERS_H = 96;
/** 内置模板 path -> 显示名，用于导出中的 template 信息 */
const BUILTIN_TEMPLATE_NAMES = {
  '/templates/community-park1.json': 'Community Park 1',
  '/templates/community-park2.json': 'Community Park 2',
  '/templates/community-park3.json': 'Community Park 3',
  '/templates/urban-park1.json': 'Urban Park 1',
  '/templates/urban-park2.json': 'Urban Park 2',
  '/templates/urban-park3.json': 'Urban Park 3',
  '/templates/nature-park1.json': 'Nature Park 1',
  '/templates/nature-park2.json': 'Nature Park 2',
  '/templates/nature-park3.json': 'Nature Park 3',
};
const BUILTIN_TEMPLATE_LIST = Object.values(BUILTIN_TEMPLATE_NAMES);
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 0.52;  // 拉满约等于 130% 视野，界面仍显示 10%–100%
const VIEWPORT_PADDING = 800;
const GOOGLE_DRIVE_FOLDER_ID = '1Bfgu-mnON0dfQSEK33-GKOvMrpENx4bl';
// Submit rule: can submit only when budget is between 55k and 80k SGD; below 55k or above 80k cannot submit
const SUBMIT_MIN_SGD = 55000;   // below this cannot submit
const SUBMIT_MAX_SGD = 80000;   // above this cannot submit
// 注意：需要在 Google Cloud Console 配置 OAuth 2.0 凭据
// 请将下面的值替换为您的实际 Google API 凭据
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file'; 

const LIBRARY = {
  VEGETATION: [
    { type: 'tree-small', name: 'Small Tree', width: 3, height: 3, color: '#4ade80', icon: '🌳', shape: 'circle', isShading: true, unitPrice: 220 },
    { type: 'tree-medium', name: 'Medium Tree', width: 5.5, height: 5.5, color: '#22c55e', icon: '🌳', shape: 'circle', isShading: true, unitPrice: 650 },
    { type: 'tree-large', name: 'Large Tree', width: 8.5, height: 8.5, color: '#166534', icon: '🌳', shape: 'circle', isShading: true, unitPrice: 1800 },
    { type: 'shrub-small', name: 'Small Shrub', width: 1.0, height: 1.0, color: '#a3e635', icon: '🌿', shape: 'circle', isShading: false, unitPrice: 25 },
    { type: 'shrub-medium', name: 'Medium Shrub', width: 1.8, height: 1.8, color: '#84cc16', icon: '🌺', shape: 'circle', isShading: false, unitPrice: 55 },
    { type: 'shrub-large', name: 'Large Shrub', width: 2.8, height: 2.8, color: '#65a30d', icon: '🪻', shape: 'circle', isShading: false, unitPrice: 120 },
    { type: 'grass-organic', name: 'Organic Lawn', width: 12, height: 12, color: '#15803d', icon: '🌱', shape: 'organic', isShading: false, areaPrice: 10 },
    { type: 'grass', name: 'Polygon Lawn', width: 10, height: 10, color: '#16a34a', icon: '🌱', shape: 'polygon', isShading: false, areaPrice: 9 },
  ],
  WATER: [
    { type: 'water-organic', name: 'Water Feature', width: 15, height: 15, color: '#0ea5e9', icon: '🌊', shape: 'organic', areaPrice: 150 },
    { type: 'pond-circular', name: 'Pond', width: 10, height: 10, color: '#38bdf8', icon: '💧', shape: 'circle', areaPrice: 130 },
    { type: 'fountain', name: 'Ornamental Fountain', width: 4, height: 4, color: '#7dd3fc', icon: '⛲', shape: 'circle', unitPrice: 3200 },
  ],
  INFRASTRUCTURE: [
    { type: 'bench', name: 'Standard Bench', width: 2, height: 0.8, color: '#fb923c', icon: '🪑', shape: 'rect', unitPrice: 350 },
    { type: 'table', name: 'Picnic Table', width: 2.5, height: 2.5, color: '#d97706', icon: '🍱', shape: 'rect', unitPrice: 850 },
    { type: 'lamp', name: 'Solar Lamp Post', width: 1, height: 1, color: '#fef08a', icon: '💡', shape: 'circle', unitPrice: 450 },
    { type: 'trash', name: 'Waste Bin', width: 0.8, height: 0.8, color: '#94a3b8', icon: '🗑️', shape: 'rect', unitPrice: 120 },
    { type: 'bike', name: 'Bike Rack', width: 3, height: 1, color: '#64748b', icon: '🚲', shape: 'rect', unitPrice: 400 },
  ],
  ACTIVITY: [
    { type: 'plaza-rect', name: 'Entrance Plaza', width: 20, height: 15, color: '#e2e8f0', icon: '🏛️', shape: 'rect', unitPrice: 0 },
    { type: 'plaza-circle', name: 'Central Hub', width: 18, height: 18, color: '#cbd5e1', icon: '⭕', shape: 'circle', unitPrice: 0 },
    { type: 'court-l', name: 'L-Shaped Path', width: 12, height: 12, color: '#94a3b8', icon: '📐', shape: 'l-shape', unitPrice: 0 },
    { type: 'play-area', name: 'Playground', width: 12, height: 12, color: '#fcd34d', icon: '🎡', shape: 'rect', unitPrice: 0 },
    { type: 'fitness', name: 'Outdoor Gym', width: 8, height: 6, color: '#a78bfa', icon: '🏋️', shape: 'rect', unitPrice: 0 },
  ]
};

// --- Utilities ---

const rotatePoint = (px, py, cx, cy, angle) => {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = (cos * (px - cx)) + (sin * (py - cy)) + cx;
  const ny = (cos * (py - cy)) - (sin * (px - cx)) + cy;
  return { x: nx, y: ny };
};

const getOrganicPath = (vertices) => {
  if (!vertices || vertices.length < 3) return "";
  let d = `M ${vertices[0].x * GRID_SIZE} ${vertices[0].y * GRID_SIZE}`;
  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % vertices.length];
    const cpX = (p1.x + p2.x) / 2;
    const cpY = (p1.y + p2.y) / 2;
    d += ` Q ${p1.x * GRID_SIZE} ${p1.y * GRID_SIZE} ${cpX * GRID_SIZE} ${cpY * GRID_SIZE}`;
  }
  d += " Z";
  return d;
};

const flattenOrganic = (vertices) => {
  const flattened = [];
  const segments = 6; 
  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % vertices.length];
    for (let t = 0; t < segments; t++) {
      const step = t / segments;
      const x = (1-step)*(1-step)*p1.x + 2*(1-step)*step*((p1.x+p2.x)/2) + step*step*p2.x;
      const y = (1-step)*(1-step)*p1.y + 2*(1-step)*step*((p1.y+p2.y)/2) + step*step*p2.y;
      flattened.push({ x, y });
    }
  }
  return flattened;
};

const isPointInPolygon = (px, py, vertices) => {
  let inside = false;
  if (!vertices) return false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
                      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const calculatePolygonArea = (vertices) => {
  if (!vertices || vertices.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const { x: x1, y: y1 } = vertices[i];
    const { x: x2, y: y2 } = vertices[(i + 1) % vertices.length];
    area += (x1 * y2 - x2 * y1);
  }
  return Math.abs(area) / 2;
};

/** L 形路径默认顶点（局部坐标 0..w, 0..h）：左上、右上、右上内、内角、左下内、左上 */
const getLShapeVertices = (w, h) => [
  { x: 0, y: 0 },
  { x: w, y: 0 },
  { x: w, y: h * 0.3 },
  { x: w * 0.3, y: h * 0.3 },
  { x: w * 0.3, y: h },
  { x: 0, y: h },
];

/** 单组件占地面积 (m²)，用于导出 */
const getElementArea = (el) => {
  if (!el) return 0;
  if (el.shape === 'polygon' || el.shape === 'organic') return (el.vertices ? calculatePolygonArea(el.vertices) : 0);
  if (el.shape === 'circle') return Math.PI * (Math.min(el.width || 0, el.height || 0) / 2) ** 2;
  return (el.width || 0) * (el.height || 0);
};

const SidebarSection = ({ title, icon: Icon, children, id, isOpen, onToggle }) => {
  return (
    <div className="mb-4">
      <button 
        onClick={() => onToggle(id)}
        className={`flex items-center justify-between w-full px-4 py-2.5 text-[11px] font-black rounded-lg transition-all uppercase tracking-wider ${
          isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-50/5 text-slate-500 hover:bg-slate-100/5'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className={isOpen ? 'text-emerald-400' : 'text-slate-400'} />
          {title}
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && <div className="p-2 grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
};

const App = () => {
  const [placedElements, setPlacedElements] = useState([]);
  const [baseMap, setBaseMap] = useState(null);
  const [baseMapSize, setBaseMapSize] = useState({ w: 0, h: 0 });
  const [baseMapCanvasMeters, setBaseMapCanvasMeters] = useState(null);
  const [zoom, setZoom] = useState(0.25); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('design'); 
  const [isExporting, setIsExporting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Interaction States
  /** 侧栏展开的区块 id 列表，可多选；点击标题切换该区块的展开/收起 */
  const [openSectionIds, setOpenSectionIds] = useState(['TEMPLATE']);
  const toggleSection = (id) => setOpenSectionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  /** 用户最后选择作为底稿的模板（内置名或 "Loaded from file"），用于导出 */
  const [lastSelectedTemplate, setLastSelectedTemplate] = useState(null);
  /** 每个内置模板被点击加载的次数，用于导出 */
  const [templateClickCounts, setTemplateClickCounts] = useState(() =>
    Object.fromEntries(BUILTIN_TEMPLATE_LIST.map((name) => [name, 0]))
  );
  const [boxSelect, setBoxSelect] = useState(null);
  const [draggingEntity, setDraggingEntity] = useState(null); 
  const [resizingEntity, setResizingEntity] = useState(null); 
  const [draggingVertex, setDraggingVertex] = useState(null); 
  const [draggingMap, setDraggingMap] = useState(false);

  const [mapConfig, setMapConfig] = useState({
    scale: 1.0, offsetX: 0, offsetY: 0, opacity: 0.5, isLocked: true 
  });
  
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const prevZoomRef = useRef(null);
  const skipNextZoomScrollRef = useRef(false);
  const fileInputRef = useRef(null);
  const templateFileInputRef = useRef(null);
  const draggedItemRef = useRef(null);
  const tokenClientRef = useRef(null);
  const pendingAuthResolveRef = useRef(null);

  const HISTORY_MAX = 20;
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const lastPlacedElementsRef = useRef([]);

  const [showOpenLoginBtn, setShowOpenLoginBtn] = useState(false);

  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const selectedElement = placedElements.find(el => el.id === selectedId);
  const selectedElements = placedElements.filter(el => selectedIds.includes(el.id));

  const [undoRedoVersion, setUndoRedoVersion] = useState(0);

  const recordStep = (nextPlacedElements) => {
    const snap = JSON.parse(JSON.stringify(nextPlacedElements));
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    historyRef.current.push(snap);
    if (historyRef.current.length > HISTORY_MAX) {
      historyRef.current = historyRef.current.slice(-HISTORY_MAX);
    }
    historyIndexRef.current = historyRef.current.length - 1;
    setUndoRedoVersion(v => v + 1);
  };

  const undo = () => {
    if (historyRef.current.length === 0 || historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    setPlacedElements(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
    setUndoRedoVersion(v => v + 1);
  };

  const redo = () => {
    if (historyRef.current.length === 0 || historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    setPlacedElements(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
    setUndoRedoVersion(v => v + 1);
  };

  const canUndo = historyRef.current.length > 0 && historyIndexRef.current > 0;
  const canRedo = historyRef.current.length > 0 && historyIndexRef.current < historyRef.current.length - 1;

  useEffect(() => {
    if (historyRef.current.length === 0) {
      historyRef.current = [JSON.parse(JSON.stringify(placedElements))];
      historyIndexRef.current = 0;
    }
  }, []);

  useEffect(() => {
    lastPlacedElementsRef.current = placedElements;
  }, [placedElements]);

  useEffect(() => {
    const needsBackfill = placedElements.some(el => el.type === 'court-l' && el.shape === 'l-shape' && (!el.vertices || el.vertices.length < 3));
    if (!needsBackfill) return;
    setPlacedElements(prev => {
      const next = prev.map(el => el.type === 'court-l' && el.shape === 'l-shape' && (!el.vertices || el.vertices.length < 3) ? { ...el, vertices: getLShapeVertices(el.width || 12, el.height || 12) } : el);
      if (next.every((e, i) => e === prev[i])) return prev;
      recordStep(next);
      return next;
    });
  }, [placedElements]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 仅在需要时动态加载 Google 脚本，避免首屏白屏
  const loadGoogleScript = () => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
    if (document.querySelector('script[src*="gsi/client"]')) {
      return new Promise((resolve) => {
        let n = 0;
        const id = setInterval(() => {
          if (window.google && window.google.accounts && window.google.accounts.oauth2) { clearInterval(id); resolve(); }
          else if (++n > 100) { clearInterval(id); resolve(); }
        }, 50);
      });
    }
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => {
        let n = 0;
        const id = setInterval(() => {
          if (window.google && window.google.accounts && window.google.accounts.oauth2) { clearInterval(id); resolve(); }
          else if (++n > 100) { clearInterval(id); resolve(); }
        }, 50);
      };
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  };

  // 用户点击「打开登录窗口」时同步调用，保留用户手势，避免弹窗被拦截
  const openGoogleLoginPopup = () => {
    setShowOpenLoginBtn(false);
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    }
  };

  // Google Drive 认证 - 加载脚本后显示按钮，由用户点击按钮再打开弹窗
  const authenticateGoogleDrive = async () => {
    setUploadStatus('Loading Google sign-in…');
    setShowOpenLoginBtn(false);
    await loadGoogleScript();

    return new Promise((resolve) => {
      pendingAuthResolveRef.current = resolve;
      try {
        if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
          setUploadStatus('Google sign-in not loaded. Check network or disable ad blocker and try again.');
          setTimeout(() => { setUploadStatus(null); setShowOpenLoginBtn(false); resolve(null); }, 5000);
          return;
        }

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_SCOPES,
          callback: (response) => {
            const done = pendingAuthResolveRef.current;
            pendingAuthResolveRef.current = null;
            setShowOpenLoginBtn(false);
            if (response && response.access_token) {
              setAccessToken(response.access_token);
              setIsAuthenticated(true);
              localStorage.setItem('google_drive_token', response.access_token);
              setUploadStatus('Authenticated. Uploading…');
              setTimeout(() => setUploadStatus(null), 2000);
              if (done) done(response.access_token);
            } else {
              setUploadStatus('Authentication failed or cancelled. Please try again.');
              setTimeout(() => setUploadStatus(null), 4000);
              if (done) done(null);
            }
          },
        });

        tokenClientRef.current = tokenClient;
        setUploadStatus('Click the button below to open Google sign-in.');
        setShowOpenLoginBtn(true);
      } catch (error) {
        console.error('Google Drive auth failed:', error);
        setUploadStatus('Authentication failed: ' + (error.message || 'Please try again.'));
        setTimeout(() => { setUploadStatus(null); setShowOpenLoginBtn(false); resolve(null); }, 5000);
      }
    });
  };

  // 上传文件到 Google Drive（保存到指定文件夹）
  const uploadToGoogleDrive = async (fileName, fileContent, mimeType = 'application/json') => {
    let token = accessToken;

    if (!token) {
      setIsExporting(true);
      token = await authenticateGoogleDrive();
      if (!token) {
        setIsExporting(false);
        return false;
      }
    }

    try {
      setUploadStatus('Uploading to Google Drive…');

      const metadata = {
        name: fileName,
        parents: [GOOGLE_DRIVE_FOLDER_ID]
      };

      // Google Drive API 要求的 multipart/related 格式
      const boundary = '-------landscape_config_' + Date.now();
      const metaPart = [
        `--${boundary}`,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata)
      ].join('\r\n');
      const filePart = [
        `--${boundary}`,
        `Content-Type: ${mimeType}`,
        '',
        fileContent
      ].join('\r\n');
      const body = metaPart + '\r\n' + filePart + '\r\n' + `--${boundary}--`;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || response.statusText);
      }

      const result = JSON.parse(responseText);
      setUploadStatus('Uploaded successfully. Saved to folder.');
      setTimeout(() => {
        setUploadStatus(null);
        setIsExporting(false);
      }, 4000);

      const folderUrl = 'https://drive.google.com/drive/folders/' + GOOGLE_DRIVE_FOLDER_ID;
      if (result.webViewLink) {
        window.open(result.webViewLink, '_blank');
      } else {
        window.open(folderUrl, '_blank');
      }

      return true;
    } catch (error) {
      console.error('Upload to Google Drive failed:', error);
      setUploadStatus('Upload failed: ' + (error.message || 'Please try again.'));
      setTimeout(() => {
        setUploadStatus(null);
        setIsExporting(false);
      }, 4000);
      return false;
    }
  };

  useEffect(() => {
    if (viewportRef.current && viewMode === 'design' && !baseMapCanvasMeters) {
      const v = viewportRef.current;
      v.scrollLeft = (v.scrollWidth - v.clientWidth) / 2;
      v.scrollTop = (v.scrollHeight - v.clientHeight) / 2;
    }
  }, [viewMode, baseMapCanvasMeters]);

  const canvasMetersW = baseMap
    ? (baseMapCanvasMeters ? baseMapCanvasMeters.w : (baseMapSize.w * mapConfig.scale) / GRID_SIZE)
    : CANVAS_METERS;
  const canvasMetersH = baseMap
    ? (baseMapCanvasMeters ? baseMapCanvasMeters.h : (baseMapSize.h * mapConfig.scale) / GRID_SIZE)
    : CANVAS_METERS;
  const canvasPixelWidth = baseMap ? (baseMapCanvasMeters ? baseMapCanvasMeters.w * GRID_SIZE : baseMapSize.w * mapConfig.scale) : CANVAS_METERS * GRID_SIZE;
  const canvasPixelHeight = baseMap ? (baseMapCanvasMeters ? baseMapCanvasMeters.h * GRID_SIZE : baseMapSize.h * mapConfig.scale) : CANVAS_METERS * GRID_SIZE;

  const analysis = useMemo(() => {
    const shadelist = placedElements.filter(el => el.isShading);
    const totalW = canvasMetersW;
    const totalH = canvasMetersH;
    const totalArea = Math.max(1, totalW * totalH);
    // 情况 A：使用系统默认底图时，树覆盖率分母固定为 2025 m²（否则为实际画布面积）
    const areaForCoverage = baseMap === DEFAULT_BASEMAP_PATH ? 2025 : totalArea;

    let shadeArea = 0;
    if (shadelist.length > 0) {
      const step = 1.0;
      let coveredPoints = 0;
      
      const minX = Math.max(0, Math.min(...shadelist.map(el => el.x - 2)));
      const maxX = Math.min(canvasMetersW, Math.max(...shadelist.map(el => el.x + el.width + 2)));
      const minY = Math.max(0, Math.min(...shadelist.map(el => el.y - 2)));
      const maxY = Math.min(canvasMetersH, Math.max(...shadelist.map(el => el.y + el.height + 2)));

      for (let x = minX; x < maxX; x += step) {
        for (let y = minY; y < maxY; y += step) {
          const px = x + step/2;
          const py = y + step/2;
          
          const isCovered = shadelist.some(el => {
            const cx = el.x + el.width / 2;
            const cy = el.y + el.height / 2;
            const lp = rotatePoint(px, py, cx, cy, -el.rotation);
            
            if (el.shape === 'circle') {
              return Math.pow(px - cx, 2) + Math.pow(py - cy, 2) <= Math.pow(el.width / 2, 2);
            } else if ((el.shape === 'polygon' || el.shape === 'organic') && el.vertices) {
              const poly = el.shape === 'organic' ? flattenOrganic(el.vertices) : el.vertices;
              const absVertices = poly.map(v => ({ x: v.x + el.x, y: v.y + el.y }));
              return isPointInPolygon(lp.x, lp.y, absVertices);
            } else {
              return lp.x >= el.x && lp.x <= (el.x + el.width) && lp.y >= el.y && lp.y <= (el.y + el.height);
            }
          });
          if (isCovered) coveredPoints++;
        }
      }
      shadeArea = coveredPoints * (step * step);
    }

    const totalCostUSD = placedElements.reduce((acc, el) => {
      if (el.unitPrice !== undefined) return acc + el.unitPrice;
      if (el.areaPrice !== undefined) {
        const area = (el.shape === 'polygon' || el.shape === 'organic') ? calculatePolygonArea(el.vertices) : (el.width * el.height);
        return acc + (area * el.areaPrice);
      }
      return acc;
    }, 0);

    return { 
      shadeArea, totalArea, 
      shadeRate: (shadeArea / areaForCoverage) * 100, 
      costUSD: totalCostUSD, 
      costSGD: totalCostUSD * USD_TO_SGD 
    };
  }, [placedElements, baseMap, baseMapSize, mapConfig.scale, canvasMetersW, canvasMetersH]);

  // --- Handlers ---

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const img = new Image();
        img.onload = () => { 
          setBaseMapSize({ w: img.width, h: img.height }); 
          setBaseMap(f.target.result);
          setBaseMapCanvasMeters(null);
        };
        img.src = f.target.result;
        setMapConfig({ isLocked: false, offsetX: 0, offsetY: 0, scale: 1.0, opacity: 0.5 });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setBaseMap(DEFAULT_BASEMAP_PATH);
      setBaseMapSize({ w, h });
      const defaultW = TEMPLATE_CANVAS_METERS_W * 0.8;
      const defaultH = TEMPLATE_CANVAS_METERS_H * 0.8;
      setBaseMapCanvasMeters({ w: defaultW, h: defaultH });
      const scaleW = (defaultW * GRID_SIZE) / w;
      const scaleH = (defaultH * GRID_SIZE) / h;
      const initialScale = Math.min(scaleW, scaleH);
      setMapConfig(prev => ({ ...prev, scale: initialScale, offsetX: 0, offsetY: 0, opacity: 0.6, isLocked: true }));
    };
    img.onerror = () => {};
    img.src = DEFAULT_BASEMAP_PATH;
  }, []);

  const centerMapInViewport = useCallback(() => {
    const v = viewportRef.current;
    const canvasEl = canvasRef.current;
    if (!v || viewMode !== 'design') return;
    const cw = canvasEl ? canvasEl.offsetWidth : (baseMap ? (baseMapCanvasMeters ? baseMapCanvasMeters.w * GRID_SIZE : baseMapSize?.w * mapConfig.scale) : CANVAS_METERS * GRID_SIZE) || 0;
    const ch = canvasEl ? canvasEl.offsetHeight : (baseMap ? (baseMapCanvasMeters ? baseMapCanvasMeters.h * GRID_SIZE : baseMapSize?.h * mapConfig.scale) : CANVAS_METERS * GRID_SIZE) || 0;
    const canvasLeft = canvasEl ? canvasEl.offsetLeft : VIEWPORT_PADDING;
    const canvasTop = canvasEl ? canvasEl.offsetTop : VIEWPORT_PADDING;
    if (!v.clientWidth || !v.clientHeight || !cw || !ch) return;
    const maxScrollLeft = Math.max(0, v.scrollWidth - v.clientWidth);
    const maxScrollTop = Math.max(0, v.scrollHeight - v.clientHeight);
    const targetLeft = canvasLeft + (cw - v.clientWidth) / 2;
    const targetTop = canvasTop + (ch - v.clientHeight) / 2;
    v.scrollLeft = Math.max(0, Math.min(maxScrollLeft, targetLeft));
    v.scrollTop = Math.max(0, Math.min(maxScrollTop, targetTop));
  }, [viewMode, baseMap, baseMapCanvasMeters, baseMapSize, mapConfig.scale]);

  useEffect(() => {
    if (!baseMap || !baseMapCanvasMeters || viewMode !== 'design') return;
    const v = viewportRef.current;
    if (!v) return;
    const cw = baseMapCanvasMeters.w * GRID_SIZE;
    const ch = baseMapCanvasMeters.h * GRID_SIZE;
    const fitZoom = Math.min(v.clientWidth / cw, v.clientHeight / ch, 1) * 0.9;
    const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitZoom));
    skipNextZoomScrollRef.current = true;
    setZoom(clampedZoom);
    centerMapInViewport();
    requestAnimationFrame(() => requestAnimationFrame(centerMapInViewport));
    const t = setTimeout(centerMapInViewport, 200);
    return () => clearTimeout(t);
  }, [baseMap, baseMapCanvasMeters, viewMode, centerMapInViewport]);

  useEffect(() => {
    const v = viewportRef.current;
    if (!v) return;
    if (prevZoomRef.current === null) { prevZoomRef.current = zoom; return; }
    if (skipNextZoomScrollRef.current) { skipNextZoomScrollRef.current = false; prevZoomRef.current = zoom; return; }
    const oldZ = prevZoomRef.current;
    prevZoomRef.current = zoom;
    if (Math.abs(zoom - oldZ) < 0.005) return;
    // 缩放时自动保持画布居中，避免缩到 40% 等时界面跑到屏幕下方
    centerMapInViewport();
    requestAnimationFrame(() => requestAnimationFrame(centerMapInViewport));
  }, [zoom, centerMapInViewport]);

  const handleMapMouseDown = (e) => {
    if (e.button !== 0) return;
    if (mapConfig.isLocked || !baseMap) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setBoxSelect({ startX: x, startY: y, currentX: x, currentY: y });
      } else {
        setSelectedIds([]);
      }
      return;
    }
    setDraggingMap({ startX: e.clientX, startY: e.clientY, initialOffsetX: mapConfig.offsetX, initialOffsetY: mapConfig.offsetY });
  };

  const onDragStartSidebar = (e, element) => {
    draggedItemRef.current = element;
    e.dataTransfer.setData('application/json', JSON.stringify(element));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDropSidebarToCanvas = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    let data;
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      data = jsonData ? JSON.parse(jsonData) : draggedItemRef.current;
    } catch (err) { data = draggedItemRef.current; }
    if (!data) return;

    const x = Math.round((((e.clientX - rect.left) / zoom) / GRID_SIZE) * 10) / 10;
    const y = Math.round((((e.clientY - rect.top) / zoom) / GRID_SIZE) * 10) / 10;

    const newElement = {
      ...data,
      id: `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x, y, rotation: 0, aspectLocked: true,
      timestamp: new Date().toISOString(),
      session_id: 'session_' + Math.random().toString(36).substr(2, 9)
    };

    if (data.shape === 'polygon' || data.shape === 'organic') {
      newElement.vertices = [
        { x: 0, y: 0 }, { x: data.width, y: 0 }, { x: data.width, y: data.height }, { x: 0, y: data.height }
      ];
    }
    if (data.type === 'court-l' && data.shape === 'l-shape') {
      newElement.vertices = getLShapeVertices(data.width || 12, data.height || 12);
    }

    setPlacedElements(prev => {
      const next = [...prev, newElement];
      recordStep(next);
      return next;
    });
    setSelectedIds([newElement.id]);
    draggedItemRef.current = null;
  };

  const handleEntityMouseDown = (e, el) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const idsToDrag = selectedIds.includes(el.id) ? selectedIds : [el.id];
    setSelectedIds(idsToDrag);
    const initialPositions = idsToDrag.reduce((acc, id) => {
      const o = placedElements.find(elem => elem.id === id);
      if (o) acc[id] = { x: o.x, y: o.y };
      return acc;
    }, {});
    setDraggingEntity({ ids: idsToDrag, startX: e.clientX, startY: e.clientY, initialPositions });
  };

  const handleResizeMouseDown = (e, el, handle) => {
    e.stopPropagation(); e.preventDefault();
    setResizingEntity({ id: el.id, handle, startX: e.clientX, startY: e.clientY, initialW: el.width, initialH: el.height, initialX: el.x, initialY: el.y });
  };

  const handleVertexMouseDown = (e, elementId, index) => {
    e.stopPropagation(); e.preventDefault();
    setSelectedIds([elementId]);
    setDraggingVertex({ elementId, index, startX: e.clientX, startY: e.clientY });
  };

  const handleGlobalMouseMove = (e) => {
    if (boxSelect) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setBoxSelect(prev => prev ? { ...prev, currentX: (e.clientX - rect.left) / zoom, currentY: (e.clientY - rect.top) / zoom } : null);
      }
    }
    if (draggingEntity && draggingEntity.ids) {
      const dx = (e.clientX - draggingEntity.startX) / (zoom * GRID_SIZE);
      const dy = (e.clientY - draggingEntity.startY) / (zoom * GRID_SIZE);
      setPlacedElements(prev => {
        const next = prev.map(item => {
          const pos = draggingEntity.initialPositions[item.id];
          if (!pos) return item;
          return { ...item, x: Math.round((pos.x + dx) * 10) / 10, y: Math.round((pos.y + dy) * 10) / 10 };
        });
        lastPlacedElementsRef.current = next;
        return next;
      });
    }
    if (draggingVertex) {
      const dx = (e.clientX - draggingVertex.startX) / (zoom * GRID_SIZE);
      const dy = (e.clientY - draggingVertex.startY) / (zoom * GRID_SIZE);
      setPlacedElements(prev => {
        const next = prev.map(item => {
          if (item.id !== draggingVertex.elementId) return item;
          const newVertices = [...item.vertices];
          newVertices[draggingVertex.index] = {
            x: Math.round((item.vertices[draggingVertex.index].x + dx) * 10) / 10,
            y: Math.round((item.vertices[draggingVertex.index].y + dy) * 10) / 10
          };
          const xs = newVertices.map(v => v.x);
          const ys = newVertices.map(v => v.y);
          const newW = Math.round((Math.max(...xs) - Math.min(...xs)) * 10) / 10;
          const newH = Math.round((Math.max(...ys) - Math.min(...ys)) * 10) / 10;
          return { ...item, vertices: newVertices, width: newW, height: newH };
        });
        lastPlacedElementsRef.current = next;
        return next;
      });
      setDraggingVertex(prev => ({ ...prev, startX: e.clientX, startY: e.clientY }));
    }
    if (resizingEntity) {
      const dx = (e.clientX - resizingEntity.startX) / (zoom * GRID_SIZE);
      const dy = (e.clientY - resizingEntity.startY) / (zoom * GRID_SIZE);
      const el = placedElements.find(p => p.id === resizingEntity.id);
      if (!el) return;
      
      let newW = resizingEntity.initialW;
      let newH = resizingEntity.initialH;
      let newX = resizingEntity.initialX ?? el.x;
      let newY = resizingEntity.initialY ?? el.y;

      if (resizingEntity.handle.includes('l')) {
        newW = Math.max(0.2, resizingEntity.initialW - dx);
        newX = (resizingEntity.initialX ?? el.x) + resizingEntity.initialW - newW;
      }
      if (resizingEntity.handle.includes('r')) newW = Math.max(0.2, resizingEntity.initialW + dx);
      if (resizingEntity.handle.includes('t')) {
        newH = Math.max(0.2, resizingEntity.initialH - dy);
        newY = (resizingEntity.initialY ?? el.y) + resizingEntity.initialH - newH;
      }
      if (resizingEntity.handle.includes('b')) newH = Math.max(0.2, resizingEntity.initialH + dy);

      if (el.aspectLocked && resizingEntity.handle === 'rb') {
        const ratio = resizingEntity.initialW / resizingEntity.initialH;
        if (Math.abs(dx) > Math.abs(dy)) newH = newW / ratio;
        else newW = newH * ratio;
      }

      setPlacedElements(prev => {
        const next = prev.map(item => {
          if (item.id !== resizingEntity.id) return item;
          const updatedItem = { ...item, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10, width: Math.round(newW * 10) / 10, height: Math.round(newH * 10) / 10 };
          if (item.vertices && item.vertices.length) {
            const scaleX = updatedItem.width / item.width;
            const scaleY = updatedItem.height / item.height;
            const minX = Math.min(...item.vertices.map(v => v.x));
            const minY = Math.min(...item.vertices.map(v => v.y));
            const maxX = Math.max(...item.vertices.map(v => v.x));
            const maxY = Math.max(...item.vertices.map(v => v.y));
            if (resizingEntity.handle.includes('l') || resizingEntity.handle.includes('r') || resizingEntity.handle.includes('b') || resizingEntity.handle.includes('t')) {
              const pivotX = resizingEntity.handle.includes('l') ? maxX : minX;
              const pivotY = resizingEntity.handle.includes('t') ? maxY : minY;
              updatedItem.vertices = item.vertices.map(v => ({
                x: Math.round((pivotX + (v.x - pivotX) * scaleX) * 10) / 10,
                y: Math.round((pivotY + (v.y - pivotY) * scaleY) * 10) / 10
              }));
            }
          }
          return updatedItem;
        });
        lastPlacedElementsRef.current = next;
        return next;
      });
    }
    if (draggingMap) {
      const dx = (e.clientX - draggingMap.startX) / zoom;
      const dy = (e.clientY - draggingMap.startY) / zoom;
      setMapConfig(prev => ({ ...prev, offsetX: draggingMap.initialOffsetX + dx, offsetY: draggingMap.initialOffsetY + dy }));
    }
  };

  const handleGlobalMouseUp = () => {
    const hadEdit = draggingEntity || resizingEntity || draggingVertex;
    const hadVertexDrag = !!draggingVertex;
    if (boxSelect && canvasRef.current) {
      const r = boxSelect;
      const x1 = Math.min(r.startX, r.currentX);
      const y1 = Math.min(r.startY, r.currentY);
      const x2 = Math.max(r.startX, r.currentX);
      const y2 = Math.max(r.startY, r.currentY);
      const inBox = placedElements.filter(el => {
        const elLeft = el.x * GRID_SIZE;
        const elTop = el.y * GRID_SIZE;
        const elRight = elLeft + el.width * GRID_SIZE;
        const elBottom = elTop + el.height * GRID_SIZE;
        return !(elRight < x1 || elLeft > x2 || elBottom < y1 || elTop > y2);
      });
      setSelectedIds(inBox.map(el => el.id));
      setBoxSelect(null);
    }
    setDraggingEntity(null); setResizingEntity(null); setDraggingVertex(null); setDraggingMap(false);
    if (hadEdit && lastPlacedElementsRef.current.length >= 0) {
      recordStep(lastPlacedElementsRef.current);
    }
    if (hadVertexDrag && draggingVertex) {
      const elId = draggingVertex.elementId;
      setPlacedElements(prev => prev.map(item => {
        if (item.id !== elId || !item.vertices?.length) return item;
        const minX = Math.min(...item.vertices.map(v => v.x));
        const minY = Math.min(...item.vertices.map(v => v.y));
        const newVertices = item.vertices.map(v => ({ x: v.x - minX, y: v.y - minY }));
        const maxX = Math.max(...newVertices.map(v => v.x));
        const maxY = Math.max(...newVertices.map(v => v.y));
        return {
          ...item,
          x: item.x + minX,
          y: item.y + minY,
          width: Math.round(maxX * 10) / 10,
          height: Math.round(maxY * 10) / 10,
          vertices: newVertices
        };
      }));
    }
  };

  const clearInteractionState = () => {
    setBoxSelect(null);
    setDraggingEntity(null);
    setResizingEntity(null);
    setDraggingVertex(null);
    setDraggingMap(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [boxSelect, draggingEntity, draggingMap, resizingEntity, draggingVertex, zoom, placedElements]);

  const updateElementProp = (id, prop, value) => {
    setPlacedElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      const newEl = { ...el, [prop]: value };
      if (el.aspectLocked) {
        if (prop === 'width') newEl.height = Math.round((value * (el.height / el.width)) * 10) / 10;
        if (prop === 'height') newEl.width = Math.round((value * (el.width / el.height)) * 10) / 10;
      }
      if (el.vertices && el.vertices.length && (prop === 'width' || prop === 'height')) {
        const scaleX = prop === 'width' ? value / el.width : 1;
        const scaleY = prop === 'height' ? value / el.height : 1;
        const minX = Math.min(...el.vertices.map(v => v.x));
        const minY = Math.min(...el.vertices.map(v => v.y));
        newEl.vertices = el.vertices.map(v => ({
          x: Math.round((minX + (v.x - minX) * scaleX) * 10) / 10,
          y: Math.round((minY + (v.y - minY) * scaleY) * 10) / 10
        }));
      }
      return newEl;
    }));
  };

  const rotateElement = (id, delta) => {
    setPlacedElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, rotation: (el.rotation + delta + 360) % 360 } : el);
      recordStep(next);
      return next;
    });
  };

  const duplicateElement = (id) => {
    const original = placedElements.find(el => el.id === id);
    if (!original) return;
    const copy = { ...original, id: `elem-${Date.now() + Math.random()}`, x: original.x + 1, y: original.y + 1 };
    setPlacedElements(prev => {
      const next = [...prev, copy];
      recordStep(next);
      return next;
    });
    setSelectedIds([copy.id]);
  };

  const addVertex = (id) => {
    setPlacedElements(prev => {
      const next = prev.map(el => {
        if (el.id !== id || !el.vertices) return el;
        const v = el.vertices;
        const newV = { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2 };
        return { ...el, vertices: [v[0], newV, ...v.slice(1)] };
      });
      recordStep(next);
      return next;
    });
  };

  const loadTemplateFromJson = (data) => {
    clearInteractionState();
    // 支持新导出格式（templateInfo + summary + components）或旧格式（elements 或数组）
    let elements = Array.isArray(data) ? data : (data && data.components) ? data.components : (data && data.elements) ? data.elements : [];
    const base = Date.now();
    elements = elements.map((el, i) => {
      const out = {
        ...el,
        id: `elem-${base}-${i}-${Math.random().toString(36).slice(2, 11)}`,
        timestamp: new Date().toISOString(),
        session_id: 'session_' + Math.random().toString(36).substr(2, 9)
      };
      if (out.type === 'court-l' && out.shape === 'l-shape' && (!out.vertices || out.vertices.length < 3)) {
        out.vertices = getLShapeVertices(out.width || 12, out.height || 12);
      }
      return out;
    });
    setPlacedElements(elements);
    recordStep(elements);
    setSelectedIds([]);
  };

  const loadBuiltInTemplate = async (templatePath) => {
    try {
      const templateName = BUILTIN_TEMPLATE_NAMES[templatePath] || templatePath;
      setLastSelectedTemplate(templateName);
      setTemplateClickCounts((prev) => ({ ...prev, [templateName]: (prev[templateName] || 0) + 1 }));
      const res = await fetch(templatePath);
      if (!res.ok) throw new Error('Template not found');
      const data = await res.json();
      loadTemplateFromJson(data);
    } catch (e) {
      console.error('Load template failed', e);
    }
  };

  const handleTemplateFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setLastSelectedTemplate('Loaded from file');
        loadTemplateFromJson(data);
      } catch (err) {
        console.error('Invalid template JSON', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getExportFileName = () => `landscape_config_v051_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

  /** 导出用：为每个组件附加 area (m²)，保留两位小数 */
  const getExportElementsWithArea = () =>
    placedElements.map((el) => ({ ...el, area: Math.round(getElementArea(el) * 100) / 100 }));

  /** 水体只导出三种：water-organic(Water Feature)、pond-circular(Pond)、fountain；不导出 water-area、reflecting-pool */
  const EXPORT_EXCLUDED_WATER_TYPES = ['water-area', 'reflecting-pool'];

  /** 导出用：三层结构 templateInfo + summary + components */
  const getExportPayload = () => {
    const withArea = getExportElementsWithArea();
    const components = withArea.filter((el) => !EXPORT_EXCLUDED_WATER_TYPES.includes(el.type));
    const componentCounts = components.reduce((acc, el) => {
      const t = el.type || 'unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    return {
      templateInfo: {
        selectedTemplate: lastSelectedTemplate ?? null,
        clickCounts: { ...templateClickCounts },
      },
      summary: {
        totalCostSGD: Math.round(analysis.costSGD * 100) / 100,
        treeCoveragePercent: Math.round(analysis.shadeRate * 10) / 10,
        componentCounts,
      },
      components,
    };
  };

  const downloadJson = () => {
    const dataStr = JSON.stringify(getExportPayload(), null, 2);
    const fileName = getExportFileName();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setUploadStatus('Downloaded to device.');
    setTimeout(() => setUploadStatus(null), 2000);
  };

  const underMin = analysis.costSGD < SUBMIT_MIN_SGD;
  const overCap = analysis.costSGD > SUBMIT_MAX_SGD;
  const canSubmit = analysis.costSGD >= SUBMIT_MIN_SGD && analysis.costSGD <= SUBMIT_MAX_SGD;

  const submitToTeacher = async () => {
    if (!canSubmit) {
      if (underMin) {
        setUploadStatus(`Cannot submit. Budget must be at least ${(SUBMIT_MIN_SGD / 1000).toFixed(0)}k SGD (yours: $${Math.round(analysis.costSGD).toLocaleString()} SGD). Submit allowed only between 55k and 80k SGD.`);
      } else if (overCap) {
        setUploadStatus(`Cannot submit. Total budget must not exceed ${(SUBMIT_MAX_SGD / 1000).toFixed(0)}k SGD. Your total: $${Math.round(analysis.costSGD).toLocaleString()} SGD. Submit allowed only between 55k and 80k SGD.`);
      }
      setTimeout(() => setUploadStatus(null), 6000);
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const isProduction = origin && !origin.startsWith('http://localhost');
    const apiUrl = isProduction ? origin + '/api/submit' : (import.meta.env.VITE_SUBMIT_API_URL || origin + '/api/submit');
    if (!apiUrl) {
      setUploadStatus('Submit URL not configured. Use Download JSON and send the file yourself.');
      setTimeout(() => setUploadStatus(null), 4000);
      return;
    }
    try {
      setIsExporting(true);
      setUploadStatus('Submitting…');
      const dataStr = JSON.stringify(getExportPayload(), null, 2);
      const fileName = getExportFileName();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, data: dataStr }),
      });
      if (!res.ok) throw new Error(await res.text() || res.statusText);
      setUploadStatus('Submitted successfully. Sent to email.');
      setTimeout(() => { setUploadStatus(null); setIsExporting(false); }, 4000);
    } catch (err) {
      console.error('submitToTeacher error', err);
      setUploadStatus('Submit failed: ' + (err && err.message ? err.message : 'Please try again.'));
      setTimeout(() => { setUploadStatus(null); setIsExporting(false); }, 4000);
    }
  };

  const exportData = async () => {
    try {
      setUploadStatus('Preparing upload…');
      const dataStr = JSON.stringify(getExportPayload(), null, 2);
      const fileName = getExportFileName();
      await uploadToGoogleDrive(fileName, dataStr, 'application/json');
    } catch (err) {
      console.error('exportData error', err);
      setUploadStatus('Error: ' + (err && err.message ? err.message : 'Please try again.'));
      setTimeout(() => setUploadStatus(null), 6000);
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 font-sans overflow-hidden text-slate-200 select-none">
      {/* 上传状态：中央醒目提示，确保用户能看到 */}
      {uploadStatus && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 border-2 border-emerald-500/60 text-white px-8 py-6 rounded-2xl shadow-2xl text-center max-w-md animate-in fade-in zoom-in duration-200 relative">
            <button
              type="button"
              onClick={() => { setUploadStatus(null); setShowOpenLoginBtn(false); setIsExporting(false); }}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="text-emerald-400 mb-2 text-sm font-black uppercase tracking-wider">Status</div>
            <div className="text-lg font-bold">{uploadStatus}</div>
            {showOpenLoginBtn && (
              <button
                type="button"
                onClick={openGoogleLoginPopup}
                className="mt-4 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase rounded-xl transition-all"
              >
                Open Google sign-in window
              </button>
            )}
            {isExporting && !showOpenLoginBtn && <div className="mt-3 h-1 w-32 bg-slate-700 rounded-full overflow-hidden mx-auto"><div className="h-full bg-emerald-500 animate-pulse w-2/3 rounded-full" /></div>}
          </div>
        </div>
      )}
      <aside className="w-80 h-full bg-slate-800 border-r border-slate-700 shadow-2xl z-20 overflow-y-auto flex flex-col min-w-[20rem]" style={{ scrollbarGutter: 'stable' }}>
        <div className="p-6 border-b border-slate-700 bg-slate-900/50">
          <h1 className="text-lg font-black flex items-center gap-2 text-emerald-400 uppercase tracking-tighter">
            <MapIcon size={20} />
            LandscapePro <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">0.5.1</span>
          </h1>
        </div>

        <div className="p-4 flex-1">
          {selectedIds.length > 1 ? (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><MousePointer2 size={12} /> {selectedIds.length} selected</h3>
                <button onClick={() => setSelectedIds([])} className="text-slate-500 hover:text-white bg-slate-900 p-1 rounded-full"><X size={14} /></button>
              </div>
              <p className="text-[10px] text-slate-400 mb-3">Drag any selected component to move all together.</p>
              <button onClick={() => { setPlacedElements(prev => { const next = prev.filter(p => !selectedIds.includes(p.id)); recordStep(next); return next; }); setSelectedIds([]); }} className="w-full py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20">Delete selected</button>
            </div>
          ) : selectedElement ? (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><MousePointer2 size={12} /> Tech Specs</h3>
                <button onClick={() => setSelectedIds([])} className="text-slate-500 hover:text-white bg-slate-900 p-1 rounded-full"><X size={14} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className="text-[8px] font-bold text-slate-500 uppercase italic">X Position</label><input type="number" step="0.1" value={selectedElement.x} onChange={(e) => updateElementProp(selectedId, 'x', parseFloat(e.target.value))} className="w-full bg-slate-900 text-xs font-mono p-2 rounded border border-slate-700 text-emerald-400 outline-none" /></div>
                  <div className="space-y-1"><label className="text-[8px] font-bold text-slate-500 uppercase italic">Y Position</label><input type="number" step="0.1" value={selectedElement.y} onChange={(e) => updateElementProp(selectedId, 'y', parseFloat(e.target.value))} className="w-full bg-slate-900 text-xs font-mono p-2 rounded border border-slate-700 text-emerald-400 outline-none" /></div>
                </div>
                
                <div className="relative pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[8px] font-bold text-slate-500 uppercase">Width (m)</label><input type="number" step="0.1" value={selectedElement.width} onChange={(e) => updateElementProp(selectedId, 'width', parseFloat(e.target.value))} className="w-full bg-slate-900 text-xs font-mono p-2 rounded border border-slate-700 outline-none" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-bold text-slate-500 uppercase">Height (m)</label><input type="number" step="0.1" value={selectedElement.height} onChange={(e) => updateElementProp(selectedId, 'height', parseFloat(e.target.value))} className="w-full bg-slate-900 text-xs font-mono p-2 rounded border border-slate-700 outline-none" /></div>
                  </div>
                  <button onClick={() => updateElementProp(selectedId, 'aspectLocked', !selectedElement.aspectLocked)} className={`absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[2px] p-1.5 rounded-full z-10 border transition-all ${selectedElement.aspectLocked ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><LinkIcon size={10} /></button>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1.5 items-center text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    <label>Rotation</label>
                    <span className="text-emerald-400 font-mono">{selectedElement.rotation}°</span>
                  </div>
                  <input type="range" min="0" max="360" value={selectedElement.rotation} onChange={(e) => updateElementProp(selectedId, 'rotation', parseInt(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <button onClick={() => { setPlacedElements(prev => { const next = prev.filter(p => !selectedIds.includes(p.id)); recordStep(next); return next; }); setSelectedIds([]); }} className="w-full py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20">Delete Component</button>
              </div>
            </div>
          ) : (
            <div className="mb-6"><button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-600 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/10 transition-all text-slate-400 hover:text-emerald-400 uppercase font-bold text-xs tracking-tighter"><ImageIcon size={16} /> {baseMap ? 'Replace base map' : 'Load Site Plan'}</button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} /></div>
          )}

          {baseMap && (
            <SidebarSection title="Calibration" icon={Settings2} id="MAP" isOpen={openSectionIds.includes('MAP')} onToggle={toggleSection}>
              <div className="space-y-4 px-1 py-1">
                <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Scale (x)</label><input type="range" min="0.1" max="5" step="0.01" value={mapConfig.scale} onChange={(e) => setMapConfig({...mapConfig, scale: parseFloat(e.target.value)})} className="w-full h-1 bg-slate-700 rounded-lg accent-emerald-500" disabled={mapConfig.isLocked} /></div>
                <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Opacity</label><input type="range" min="0" max="1" step="0.1" value={mapConfig.opacity} onChange={(e) => setMapConfig({...mapConfig, opacity: parseFloat(e.target.value)})} className="w-full h-1 bg-slate-700 rounded-lg accent-slate-500" /></div>
                <button onClick={() => setMapConfig({...mapConfig, isLocked: !mapConfig.isLocked})} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase shadow-xl transition-all ${mapConfig.isLocked ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>{mapConfig.isLocked ? "Unlock Map Edit" : "Lock Map Position"}</button>
                <button onClick={() => { centerMapInViewport(); requestAnimationFrame(centerMapInViewport); }} className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase shadow-xl transition-all bg-sky-500/20 text-sky-400 border border-sky-500/50 hover:bg-sky-500/30">Center Map in View</button>
                <button onClick={() => { clearInteractionState(); recordStep([]); setPlacedElements([]); setSelectedIds([]); }} disabled={placedElements.length === 0} className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase shadow-xl transition-all bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500/20">Clear All Components</button>
              </div>
            </SidebarSection>
          )}

          <SidebarSection title="Template" icon={LayoutTemplate} id="TEMPLATE" isOpen={openSectionIds.includes('TEMPLATE')} onToggle={toggleSection}>
            <p className="text-[9px] text-slate-500 mb-3 px-1">Load a pre-designed layout. You can then drag more components on top.</p>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/community-park1.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🏘️</span> Community Park 1</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/community-park2.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🏘️</span> Community Park 2</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/community-park3.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🏘️</span> Community Park 3</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/urban-park1.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🏛️</span> Urban Park 1</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/urban-park2.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🏛️</span> Urban Park 2</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/urban-park3.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🏛️</span> Urban Park 3</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/nature-park1.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🌲</span> Nature Park 1</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/nature-park2.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🌲</span> Nature Park 2</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => loadBuiltInTemplate('/templates/nature-park3.json')} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><span>🌲</span> Nature Park 3</span>
              <LayoutTemplate size={14} className="text-slate-500" />
            </button>
            <button type="button" onClick={() => templateFileInputRef.current?.click()} className="w-full flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:border-emerald-500 transition-all text-left mt-2">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-2"><FolderOpen size={14} /> Load from file…</span>
            </button>
            <input ref={templateFileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleTemplateFileSelect} />
          </SidebarSection>

          <SidebarSection title="Vegetation" icon={Trees} id="VEGETATION" isOpen={openSectionIds.includes('VEGETATION')} onToggle={toggleSection}>
            {LIBRARY.VEGETATION.map(item => (
              <div key={item.type} draggable onDragStart={(e) => onDragStartSidebar(e, item)} className="flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl cursor-grab hover:border-emerald-500 transition-all group shadow-sm">
                <div className="flex items-center gap-3"><span className="text-xl drop-shadow-md">{item.icon}</span><div><div className="text-[11px] font-black text-slate-200">{item.name}</div><div className="text-[9px] text-slate-500 font-bold italic">${item.unitPrice ? item.unitPrice + ' USD' : item.areaPrice + ' USD/m²'}</div><div className="text-[8px] text-emerald-400 font-bold uppercase italic">${item.unitPrice ? Math.round(item.unitPrice * USD_TO_SGD) + ' SGD' : Math.round(item.areaPrice * USD_TO_SGD) + ' SGD/m²'}</div></div></div>
                <Move size={12} className="text-slate-600" />
              </div>
            ))}
          </SidebarSection>

          <SidebarSection title="Water Features" icon={Waves} id="WATER" isOpen={openSectionIds.includes('WATER')} onToggle={toggleSection}>
            {LIBRARY.WATER.map(item => (
              <div key={item.type} draggable onDragStart={(e) => onDragStartSidebar(e, item)} className="flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl cursor-grab hover:border-sky-500 transition-all group shadow-sm"><div className="flex items-center gap-3 text-[11px] font-bold text-slate-200 uppercase tracking-tighter"><span className="text-lg">{item.icon}</span> {item.name}</div><Move size={12} className="text-slate-600" /></div>
            ))}
          </SidebarSection>

          <SidebarSection title="Infrastructure" icon={Armchair} id="INFRASTRUCTURE" isOpen={openSectionIds.includes('INFRASTRUCTURE')} onToggle={toggleSection}>
            {LIBRARY.INFRASTRUCTURE.map(item => (
              <div key={item.type} draggable onDragStart={(e) => onDragStartSidebar(e, item)} className="flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl cursor-grab hover:border-orange-500 transition-all group shadow-sm"><div className="flex items-center gap-3 text-[11px] font-bold text-slate-200 uppercase tracking-tighter"><span className="text-lg">{item.icon}</span> {item.name}</div><Move size={12} className="text-slate-600" /></div>
            ))}
          </SidebarSection>

          <SidebarSection title="Activity Frames" icon={Layout} id="ACTIVITY" isOpen={openSectionIds.includes('ACTIVITY')} onToggle={toggleSection}>
            {LIBRARY.ACTIVITY.map(item => (
              <div key={item.type} draggable onDragStart={(e) => onDragStartSidebar(e, item)} className="flex items-center justify-between p-2.5 bg-slate-700/30 border border-slate-600/50 rounded-xl cursor-grab hover:border-indigo-500 transition-all group shadow-sm"><div className="flex items-center gap-3 text-[11px] font-bold text-slate-200 uppercase tracking-tighter"><span className="text-lg">{item.icon}</span> {item.name}</div><Move size={12} className="text-slate-600" /></div>
            ))}
          </SidebarSection>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 rounded-xl p-1 shadow-inner">
              <button onClick={() => setViewMode('design')} className={`px-6 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-tighter ${viewMode === 'design' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Spatial Design</button>
              <button onClick={() => setViewMode('data')} className={`px-6 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-tighter ${viewMode === 'data' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Costing/Technical Data</button>
            </div>
            <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" className={`p-2 rounded-lg transition-all ${canUndo ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 cursor-not-allowed'}`}><Undo2 size={18} /></button>
              <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)" className={`p-2 rounded-lg transition-all ${canRedo ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 cursor-not-allowed'}`}><Redo2 size={18} /></button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zoom</span>
              <input type="range" min={ZOOM_MIN} max={ZOOM_MAX} step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-48 h-1 accent-emerald-500" />
              <span className="text-xs font-mono font-bold w-12 text-emerald-400">{Math.round((zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN) * 90 + 10)}%</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={downloadJson}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase transition-all shadow-xl active:scale-95 bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <Download size={16} /> Download JSON
              </button>
              <button
                onClick={submitToTeacher}
                disabled={isExporting || !canSubmit}
                title={!canSubmit ? (overCap ? 'Budget must not exceed 80,000 SGD' : underMin ? 'Budget must be at least 55,000 SGD' : 'Submit allowed only when budget is between 55k and 80k SGD') : ''}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase transition-all shadow-xl active:scale-95 ${
                  isExporting ? 'bg-sky-600/50 text-white/50 cursor-not-allowed' : !canSubmit ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-500'
                }`}
              >
                <Download size={16} /> {isExporting ? 'Submitting…' : canSubmit ? 'Submit' : 'Cannot submit'}
              </button>
              <button
                onClick={exportData}
                disabled={isExporting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase transition-all shadow-xl active:scale-95 border border-slate-600 ${
                  isExporting ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Download size={16} /> Upload to Google Drive
              </button>
              {uploadStatus && (
                <div className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  (uploadStatus.includes('success') || uploadStatus.includes('Successfully') || uploadStatus.includes('Downloaded') || uploadStatus.includes('Uploaded'))
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : (uploadStatus.includes('fail') || uploadStatus.includes('Error'))
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {uploadStatus}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <div ref={viewportRef} className="flex-1 overflow-auto bg-[#0a0a0a] relative scrollbar-hide">
          {viewMode === 'design' ? (
            <div className="flex items-center justify-center min-w-full min-h-full" style={{ padding: '800px' }}>
              <div 
                ref={canvasRef} onDrop={onDropSidebarToCanvas} onDragOver={(e) => e.preventDefault()} onMouseDown={handleMapMouseDown}
                className={`relative shadow-[0_0_150px_rgba(0,0,0,0.8)] transition-transform origin-center flex-shrink-0 ${!mapConfig.isLocked && baseMap ? 'cursor-move ring-2 ring-emerald-500/50' : ''}`}
                style={{
                  width: canvasPixelWidth, height: canvasPixelHeight, transform: `scale(${zoom})`,
                  backgroundColor: '#111827', backgroundImage: `linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)`,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`, border: '1px solid #374151'
                }}
              >
                {baseMap && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: mapConfig.opacity }}>
                    <img
                      src={baseMap}
                      alt="Base"
                      className="absolute max-w-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${mapConfig.offsetX}px, ${mapConfig.offsetY}px) scale(${mapConfig.scale})`,
                        transformOrigin: 'center center',
                      }}
                    />
                  </div>
                )}
                
                {boxSelect && (
                  <div
                    className="absolute border-2 border-emerald-400 bg-emerald-500/10 pointer-events-none z-[25]"
                    style={{
                      left: Math.min(boxSelect.startX, boxSelect.currentX),
                      top: Math.min(boxSelect.startY, boxSelect.currentY),
                      width: Math.abs(boxSelect.currentX - boxSelect.startX),
                      height: Math.abs(boxSelect.currentY - boxSelect.startY),
                    }}
                  />
                )}
                {placedElements.map((el) => {
                  const isSelected = selectedIds.includes(el.id);
                  const lShapeVertices = el.type === 'court-l' && el.shape === 'l-shape' ? (el.vertices && el.vertices.length >= 3 ? el.vertices : getLShapeVertices(el.width || 12, el.height || 12)) : null;
                  const isPoly = el.shape === 'polygon' || el.shape === 'organic' || (el.shape === 'l-shape' && (el.vertices?.length >= 3 || lShapeVertices));
                  const displayVertices = isPoly && (el.shape === 'l-shape' ? (el.vertices?.length >= 3 ? el.vertices : lShapeVertices) : el.vertices);
                  const isDragging = draggingEntity?.ids?.includes(el.id);
                  const polyMin = displayVertices && displayVertices.length
                    ? { x: Math.min(...displayVertices.map(v => v.x)), y: Math.min(...displayVertices.map(v => v.y)) }
                    : { x: 0, y: 0 };
                  // 多边形/有机形/L 形：div 按形状左上角定位，不设 clipPath 以便工具栏可见
                  const renderX = isPoly ? el.x + polyMin.x : el.x;
                  const renderY = isPoly ? el.y + polyMin.y : el.y;
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleEntityMouseDown(e, el)}
                      className={`absolute flex items-center justify-center group pointer-events-auto ${isSelected ? 'z-50 ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-950 scale-[1.01]' : 'z-30 hover:brightness-125'} ${isDragging ? 'cursor-grabbing opacity-70' : 'cursor-grab'}`}
                      style={{
                        left: renderX * GRID_SIZE, top: renderY * GRID_SIZE, 
                        width: el.width * GRID_SIZE, height: el.height * GRID_SIZE,
                        backgroundColor: isPoly ? 'transparent' : el.color + (isSelected ? '99' : '55'), 
                        border: isPoly ? 'none' : `2px solid ${el.color}`,
                        borderRadius: el.shape === 'circle' ? '50%' : '6px', 
                        transform: `rotate(${el.rotation}deg)`, transformOrigin: 'center center',
                      }}
                    >
                      {isPoly && displayVertices && (
                        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{ transform: `translate(${-polyMin.x * GRID_SIZE}px, ${-polyMin.y * GRID_SIZE}px)` }}>
                          {el.shape === 'organic' ? (
                            <path d={getOrganicPath(el.vertices)} fill={el.color + (isSelected ? '99' : '55')} stroke={el.color} strokeWidth="2" />
                          ) : (
                            <polygon points={displayVertices.map(v => `${v.x * GRID_SIZE},${v.y * GRID_SIZE}`).join(' ')} fill={el.color + (isSelected ? '99' : '55')} stroke={el.color} strokeWidth="2" />
                          )}
                        </svg>
                      )}

                      {isSelected && selectedIds.length === 1 && (
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-800 shadow-2xl rounded-2xl p-1 border border-slate-600 ring-1 ring-white/10 z-[70]" style={{ transform: `rotate(${-el.rotation}deg)` }} onMouseDown={e => e.stopPropagation()}>
                          <button onClick={() => duplicateElement(el.id)} className="p-2 hover:bg-emerald-600 rounded-xl text-white transition-all" title="Duplicate"><Copy size={14} /></button>
                          {isPoly && <button onClick={() => addVertex(el.id)} className="p-2 hover:bg-emerald-600 rounded-xl text-white transition-all" title="Add Vertex"><PlusCircle size={14} /></button>}
                          <button onClick={() => rotateElement(el.id, -15)} className="p-2 hover:bg-emerald-600 rounded-xl text-white transition-all" title="Rotate Left"><RotateCcw size={14} /></button>
                          <button onClick={() => rotateElement(el.id, 15)} className="p-2 hover:bg-emerald-600 rounded-xl text-white transition-all" title="Rotate Right"><RotateCw size={14} /></button>
                          <button onClick={() => { setPlacedElements(prev => { const next = prev.filter(p => !selectedIds.includes(p.id)); recordStep(next); return next; }); setSelectedIds([]); }} className="p-2 hover:bg-red-500 rounded-xl text-red-400 hover:text-white transition-all" title="Delete"><Trash size={14} /></button>
                        </div>
                      )}

                      {isSelected && selectedIds.length === 1 && isPoly && el.vertices && el.vertices.map((v, idx) => (
                        <div key={idx} onMouseDown={(e) => handleVertexMouseDown(e, el.id, idx)} className="absolute w-3 h-3 bg-white border-2 border-emerald-500 rounded-full cursor-crosshair z-[80] shadow-lg hover:scale-125 transition-transform" style={{ left: (v.x - polyMin.x) * GRID_SIZE, top: (v.y - polyMin.y) * GRID_SIZE, transform: 'translate(-50%, -50%)' }} />
                      ))}

                      {isSelected && selectedIds.length === 1 && (
                        <>
                          <div onMouseDown={(e) => handleResizeMouseDown(e, el, 'rb')} className="absolute -right-2 -bottom-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full cursor-nwse-resize z-[60] shadow-md hover:scale-125 transition-transform" />
                          {!el.aspectLocked && (
                            <>
                              <div onMouseDown={(e) => handleResizeMouseDown(e, el, 'l')} className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-6 bg-emerald-500 border border-white rounded cursor-ew-resize z-[60] opacity-80 hover:opacity-100" />
                              <div onMouseDown={(e) => handleResizeMouseDown(e, el, 'r')} className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-6 bg-emerald-500 border border-white rounded cursor-ew-resize z-[60] opacity-80 hover:opacity-100" />
                              <div onMouseDown={(e) => handleResizeMouseDown(e, el, 't')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-emerald-500 border border-white rounded cursor-ns-resize z-[60] opacity-80 hover:opacity-100" />
                              <div onMouseDown={(e) => handleResizeMouseDown(e, el, 'b')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-emerald-500 border border-white rounded cursor-ns-resize z-[60] opacity-80 hover:opacity-100" />
                            </>
                          )}
                        </>
                      )}
                      
                      <span className="drop-shadow-md pointer-events-none" style={{ fontSize: `${Math.min(24, Math.max(12, Math.min(el.width, el.height) * 3))}px` }}>{el.icon}</span>
                    </div>
                  );
                })}

                {/* Analysis Box */}
                <div className="absolute bottom-6 right-6 z-[100] bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 shadow-2xl pointer-events-none w-72" style={{ transform: `scale(${1/zoom})`, transformOrigin: 'bottom right' }}>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50"><Calculator className="text-emerald-400" size={18} /><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis</h4></div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 mb-1"><Sun size={12} className="text-amber-400" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Tree coverage percentage</span></div>
                      <div className="flex justify-between items-end"><span className="text-lg font-mono font-black text-white">{analysis.shadeRate.toFixed(1)}%</span></div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.min(100, analysis.shadeRate)}%` }} /></div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-700/30">
                      <div className="flex items-center gap-1.5 mb-1"><DollarSign size={12} className="text-emerald-500" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Budget (SGD)</span></div>
                      <div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                        <span className="text-lg font-mono font-black text-emerald-400">${analysis.costSGD.toLocaleString()}</span>
                      </div>
                      <div className="text-[9px] text-slate-500">
                        Submit allowed: {(SUBMIT_MIN_SGD / 1000).toFixed(0)}k–{(SUBMIT_MAX_SGD / 1000).toFixed(0)}k SGD only (below 55k or above 80k = cannot submit)
                      </div>
                      <div className={`text-[10px] font-bold ${canSubmit ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {canSubmit ? 'Within 55k–80k — submit enabled' : overCap ? 'Over 80k — cannot submit' : 'Below 55k — cannot submit'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-950 overflow-y-auto p-12 flex justify-center">
              <div className="w-full max-w-7xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 h-fit">
                <div className="p-10 border-b border-slate-800 flex bg-slate-900/50 justify-between items-center">
                  <h3 className="font-black text-emerald-400 text-2xl uppercase tracking-tighter">Costing/Technical Data</h3>
                  <div className="text-2xl font-black text-emerald-500">${analysis.costSGD.toLocaleString()} SGD Total</div>
                </div>
                <div className="p-0">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-800 z-10 shadow-lg">
                      <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">
                        <th className="px-10 py-5">Object</th>
                        <th className="px-10 py-5">X/Y Coord (m)</th>
                        <th className="px-10 py-5">Area/Dim (m)</th>
                        <th className="px-10 py-5">Rotation</th>
                        <th className="px-10 py-5 text-emerald-400">Est. Cost (SGD)</th>
                        <th className="px-10 py-5 text-slate-600">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {placedElements.map(el => {
                        const area = (el.shape === 'polygon' || el.shape === 'organic') ? calculatePolygonArea(el.vertices) : (el.width * el.height);
                        const cost = (el.unitPrice || (el.areaPrice * area)) * USD_TO_SGD;
                        return (
                          <tr key={el.id} className="text-sm border-slate-800/50 hover:bg-emerald-500/5 transition-colors">
                            <td className="px-10 py-6 font-black flex items-center gap-4 text-slate-200"><span className="text-2xl drop-shadow-sm">{el.icon}</span> {el.name}</td>
                            <td className="px-10 py-6 font-mono text-emerald-400">{el.x.toFixed(1)} / {el.y.toFixed(1)}</td>
                            <td className="px-10 py-6 font-mono text-slate-50">{el.shape === 'polygon' || el.shape === 'organic' ? `${area.toFixed(1)}m²` : `${el.width.toFixed(1)} × ${el.height.toFixed(1)}`}</td>
                            <td className="px-10 py-6 font-mono text-amber-500 font-bold">{el.rotation}°</td>
                            <td className="px-10 py-6 font-mono text-emerald-400 font-bold">${cost.toLocaleString()}</td>
                            <td className="px-10 py-6 font-mono text-[9px] text-slate-600 uppercase italic font-bold">...{el.id.slice(-6)}</td>
                          </tr>
                        );
                      })}
                      {placedElements.length === 0 && (
                        <tr><td colSpan="6" className="px-10 py-32 text-center text-slate-500 italic uppercase font-black tracking-widest opacity-30">Register is empty. Placement required.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        {viewMode === 'design' && (
          <aside className="w-[26rem] flex-shrink-0 border-l border-slate-800 bg-slate-900/80 flex flex-col p-3">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">3D Preview</div>
            <div className="flex-1 min-h-0 min-w-0">
              <Preview3D elements={placedElements} canvasMetersW={canvasMetersW} canvasMetersH={canvasMetersH} />
            </div>
          </aside>
        )}
        </div>

        <footer className="h-12 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest">
          <div className="flex gap-8 items-center">
            <span className="flex items-center gap-2 font-bold text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Engine v0.5.1</span>
            <span className="text-slate-400">Fixed: Market-Adjusted Prices & Budget Sync</span>
          </div>
          <div className="flex gap-6 items-center text-slate-400 italic">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400"><Calculator size={12}/> Calculations Unified</div>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="text-emerald-500/50 font-bold uppercase tracking-tighter">100m² Perspective</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
