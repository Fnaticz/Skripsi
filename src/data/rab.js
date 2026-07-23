export const RAB_CATEGORIES = [
  { id: 'A', name: 'A. Pekerjaan Persiapan', color: '#64748b' },
  { id: 'B', name: 'B. Pekerjaan Tanah & Pondasi', color: '#78716c' },
  { id: 'C', name: 'C. Pekerjaan Struktur', color: '#3b82f6' },
  { id: 'D', name: 'D. Pekerjaan Arsitektur', color: '#8b5cf6' },
  { id: 'E', name: 'E. Pekerjaan MEP (Mekanikal-Elektrik-Plumbing)', color: '#f59e0b' },
  { id: 'F', name: 'F. Pekerjaan Finishing & Exterior', color: '#22c55e' },
  { id: 'G', name: 'G. Pekerjaan Lanskap & External Work', color: '#14b8a6' },
  { id: 'H', name: 'H. Peralatan & Furnishing', color: '#ec4899' },
];

export const SATUAN_OPTIONS = ['m', 'm2', 'm3', 'kg', 'ltr', 'bh', 'ls', 'unit', 'set', 'hr', 'org', 'zak', 'ton'];

export const DEFAULT_RAB_SETTINGS = {
  ppnPercent: 11,
  contingencyPercent: 5,
  overheadPercent: 10,
  profitPercent: 6,
};

/** Template item: volumeFormula = 'luasBangunan' | 'luasBangunan*2' | 'luasTapak' | null (manual) */
export const RAB_TEMPLATES = {
  perumahan: [
    { category: 'A', pekerjaan: 'Pembersihan dan pelurusan lahan', volumeFormula: 'luasTapak', satuan: 'm2', hargaSatuan: 35000 },
    { category: 'A', pekerjaan: 'Pemasangan bouwplank', volumeFormula: 'perimeter', satuan: 'm', hargaSatuan: 85000 },
    { category: 'B', pekerjaan: 'Galian tanah pondasi', volumeFormula: 'luasBangunan*0.3', satuan: 'm3', hargaSatuan: 95000 },
    { category: 'B', pekerjaan: 'Pondasi foot plat beton bertulang', volumeFormula: 'luasBangunan*0.15', satuan: 'm3', hargaSatuan: 1850000 },
    { category: 'C', pekerjaan: 'Sloof beton bertulang', volumeFormula: 'perimeter*0.2', satuan: 'm3', hargaSatuan: 2100000 },
    { category: 'C', pekerjaan: 'Kolom beton bertulang', volumeFormula: 'jumlahLantai*12', satuan: 'm3', hargaSatuan: 2200000 },
    { category: 'C', pekerjaan: 'Balok beton bertulang', volumeFormula: 'luasBangunan*0.12', satuan: 'm3', hargaSatuan: 2150000 },
    { category: 'C', pekerjaan: 'Plat lantai beton bertulang', volumeFormula: 'luasBangunan*0.12', satuan: 'm3', hargaSatuan: 1950000 },
    { category: 'D', pekerjaan: 'Dinding bata ringan', volumeFormula: 'luasBangunan*2.8', satuan: 'm2', hargaSatuan: 285000 },
    { category: 'D', pekerjaan: 'Plesteran dinding', volumeFormula: 'luasBangunan*5.6', satuan: 'm2', hargaSatuan: 95000 },
    { category: 'D', pekerjaan: 'Acian dinding', volumeFormula: 'luasBangunan*5.6', satuan: 'm2', hargaSatuan: 65000 },
    { category: 'D', pekerjaan: 'Rangka atap baja ringan', volumeFormula: 'luasBangunan*1.2', satuan: 'm2', hargaSatuan: 185000 },
    { category: 'D', pekerjaan: 'Penutup atap genteng metal', volumeFormula: 'luasBangunan*1.2', satuan: 'm2', hargaSatuan: 165000 },
    { category: 'D', pekerjaan: 'Kusen aluminium + daun pintu/jendela', volumeFormula: 'luasBangunan*0.25', satuan: 'm2', hargaSatuan: 850000 },
    { category: 'E', pekerjaan: 'Instalasi listrik (titik + panel)', volumeFormula: 'luasBangunan', satuan: 'm2', hargaSatuan: 185000 },
    { category: 'E', pekerjaan: 'Instalasi plumbing & sanitair', volumeFormula: 'luasBangunan', satuan: 'm2', hargaSatuan: 165000 },
    { category: 'F', pekerjaan: 'Keramik lantai', volumeFormula: 'luasBangunan*0.85', satuan: 'm2', hargaSatuan: 225000 },
    { category: 'F', pekerjaan: 'Keramik dinding kamar mandi', volumeFormula: 'luasBangunan*0.15', satuan: 'm2', hargaSatuan: 245000 },
    { category: 'F', pekerjaan: 'Cat tembok interior', volumeFormula: 'luasBangunan*5.6', satuan: 'm2', hargaSatuan: 45000 },
    { category: 'F', pekerjaan: 'Cat tembok exterior', volumeFormula: 'luasBangunan*1.4', satuan: 'm2', hargaSatuan: 55000 },
    { category: 'G', pekerjaan: 'Paving carport & jalan setapak', volumeFormula: 'luasTapak*0.2', satuan: 'm2', hargaSatuan: 195000 },
  ],
  komersial: [
    { category: 'A', pekerjaan: 'Mobilisasi & demobilisasi alat', volumeFormula: null, satuan: 'ls', hargaSatuan: 15000000, defaultVolume: 1 },
    { category: 'A', pekerjaan: 'Pembersihan lahan proyek', volumeFormula: 'luasTapak', satuan: 'm2', hargaSatuan: 45000 },
    { category: 'B', pekerjaan: 'Pondasi bored pile / foot plat', volumeFormula: 'luasBangunan*0.2', satuan: 'm3', hargaSatuan: 2450000 },
    { category: 'C', pekerjaan: 'Struktur beton bertulang gedung', volumeFormula: 'luasBangunan*0.18', satuan: 'm3', hargaSatuan: 2350000 },
    { category: 'D', pekerjaan: 'Dinding partisi & fasad', volumeFormula: 'luasBangunan*3.5', satuan: 'm2', hargaSatuan: 650000 },
    { category: 'D', pekerjaan: 'Curtain wall / kaca fasad', volumeFormula: 'luasBangunan*0.4', satuan: 'm2', hargaSatuan: 1850000 },
    { category: 'E', pekerjaan: 'Instalasi AC central / split duct', volumeFormula: 'luasBangunan', satuan: 'm2', hargaSatuan: 385000 },
    { category: 'E', pekerjaan: 'Instalasi listrik & genset', volumeFormula: 'luasBangunan', satuan: 'm2', hargaSatuan: 295000 },
    { category: 'E', pekerjaan: 'Plumbing & fire protection', volumeFormula: 'luasBangunan', satuan: 'm2', hargaSatuan: 225000 },
    { category: 'F', pekerjaan: 'Lantai raised floor / granite', volumeFormula: 'luasBangunan*0.9', satuan: 'm2', hargaSatuan: 485000 },
    { category: 'F', pekerjaan: 'Plafon gypsum + acoustic', volumeFormula: 'luasBangunan*0.9', satuan: 'm2', hargaSatuan: 285000 },
    { category: 'H', pekerjaan: 'Furniture & fixture (estimasi)', volumeFormula: 'luasBangunan', satuan: 'm2', hargaSatuan: 450000 },
  ],
  urban: [
    { category: 'A', pekerjaan: 'Survey & staking layout', volumeFormula: 'luasTapak', satuan: 'm2', hargaSatuan: 15000 },
    { category: 'B', pekerjaan: 'Galian & timbunan tanah', volumeFormula: 'luasTapak*0.3', satuan: 'm3', hargaSatuan: 85000 },
    { category: 'G', pekerjaan: 'Hardscape paving block', volumeFormula: 'luasTapak*0.45', satuan: 'm2', hargaSatuan: 285000 },
    { category: 'G', pekerjaan: 'Softscape tanaman & rumput', volumeFormula: 'luasTapak*0.35', satuan: 'm2', hargaSatuan: 125000 },
    { category: 'G', pekerjaan: 'Sistem drainase & saluran air', volumeFormula: 'perimeter', satuan: 'm', hargaSatuan: 385000 },
    { category: 'G', pekerjaan: 'Furniture taman & street furniture', volumeFormula: null, satuan: 'ls', hargaSatuan: 45000000, defaultVolume: 1 },
    { category: 'G', pekerjaan: 'Penerangan landscape', volumeFormula: 'luasTapak*0.05', satuan: 'titik', hargaSatuan: 850000 },
  ],
  konservasi: [
    { category: 'A', pekerjaan: 'Dokumentasi kondisi existing', volumeFormula: null, satuan: 'ls', hargaSatuan: 25000000, defaultVolume: 1 },
    { category: 'A', pekerjaan: 'Scaffolding & proteksi struktur', volumeFormula: 'luasBangunan*2', satuan: 'm2', hargaSatuan: 125000 },
    { category: 'D', pekerjaan: 'Restorasi ornamen & detail arsitektur', volumeFormula: 'luasBangunan*0.3', satuan: 'm2', hargaSatuan: 850000 },
    { category: 'D', pekerjaan: 'Perbaikan struktur kayu/beton existing', volumeFormula: 'luasBangunan*0.1', satuan: 'm3', hargaSatuan: 3200000 },
    { category: 'F', pekerjaan: 'Conservation-grade finishing', volumeFormula: 'luasBangunan*2', satuan: 'm2', hargaSatuan: 385000 },
  ],
  interior: [
    { category: 'D', pekerjaan: 'Partisi gypsum / glass partition', volumeFormula: 'luasBangunan*0.4', satuan: 'm2', hargaSatuan: 385000 },
    { category: 'F', pekerjaan: 'Plafon gypsum + lighting slot', volumeFormula: 'luasBangunan', satuan: 'm2', hargaSatuan: 295000 },
    { category: 'F', pekerjaan: 'Floor finishing (vinyl/SPC/carpet)', volumeFormula: 'luasBangunan*0.95', satuan: 'm2', hargaSatuan: 385000 },
    { category: 'F', pekerjaan: 'Wall covering & wallpaper', volumeFormula: 'luasBangunan*1.5', satuan: 'm2', hargaSatuan: 225000 },
    { category: 'E', pekerjaan: 'Lighting design & instalasi', volumeFormula: 'luasBangunan', satuan: 'm2', hargaSatuan: 185000 },
    { category: 'H', pekerjaan: 'Custom furniture & built-in', volumeFormula: 'luasBangunan*0.2', satuan: 'm2', hargaSatuan: 1850000 },
    { category: 'H', pekerjaan: 'Loose furniture', volumeFormula: null, satuan: 'ls', hargaSatuan: 35000000, defaultVolume: 1 },
  ],
};

export function createEmptyRab() {
  return {
    items: [],
    settings: { ...DEFAULT_RAB_SETTINGS },
    updatedAt: null,
  };
}

export function createEmptyDesign() {
  return {
    luasBangunan: null,
    luasTapak: null,
    jumlahLantai: 1,
    tinggiLantai: 3,
    tipeStruktur: 'beton bertulang',
  };
}

export function calcPerimeter(design) {
  const luas = design.luasBangunan || design.luasTapak || 0;
  if (!luas) return 0;
  const side = Math.sqrt(luas);
  return Math.round(side * 4 * 100) / 100;
}

export function resolveVolume(formula, design, defaultVolume) {
  if (defaultVolume != null) return defaultVolume;
  if (!formula) return 0;
  const lb = design.luasBangunan || 0;
  const lt = design.luasTapak || lb || 0;
  const jl = design.jumlahLantai || 1;
  const p = calcPerimeter(design);

  const map = {
    luasBangunan: lb,
    luasTapak: lt,
    perimeter: p,
    'luasBangunan*0.3': lb * 0.3,
    'luasBangunan*0.15': lb * 0.15,
    'luasBangunan*0.12': lb * 0.12,
    'luasBangunan*0.18': lb * 0.18,
    'luasBangunan*0.2': lb * 0.2,
    'luasBangunan*0.25': lb * 0.25,
    'luasBangunan*0.4': lb * 0.4,
    'luasBangunan*0.85': lb * 0.85,
    'luasBangunan*0.9': lb * 0.9,
    'luasBangunan*0.95': lb * 0.95,
    'luasBangunan*1.2': lb * 1.2,
    'luasBangunan*1.4': lb * 1.4,
    'luasBangunan*1.5': lb * 1.5,
    'luasBangunan*2': lb * 2,
    'luasBangunan*2.8': lb * 2.8,
    'luasBangunan*3.5': lb * 3.5,
    'luasBangunan*5.6': lb * 5.6,
    'luasBangunan*0.15': lb * 0.15,
    'luasBangunan*0.1': lb * 0.1,
    'luasBangunan*0.05': lb * 0.05,
    'luasTapak*0.2': lt * 0.2,
    'luasTapak*0.3': lt * 0.3,
    'luasTapak*0.35': lt * 0.35,
    'luasTapak*0.45': lt * 0.45,
    'perimeter*0.2': p * 0.2,
    'jumlahLantai*12': jl * 12,
  };

  const val = map[formula];
  return val != null ? Math.round(val * 100) / 100 : 0;
}

export function generateRabFromTemplate(specialization, design) {
  const template = RAB_TEMPLATES[specialization] ?? RAB_TEMPLATES.perumahan;
  return template.map((t, i) => ({
    id: `tpl-${Date.now()}-${i}`,
    category: t.category,
    pekerjaan: t.pekerjaan,
    volume: resolveVolume(t.volumeFormula, design, t.defaultVolume),
    satuan: t.satuan,
    hargaSatuan: t.hargaSatuan,
    volumeFormula: t.volumeFormula ?? null,
    linkedStage: 4,
  }));
}

export function calcItemTotal(item) {
  return (item.volume || 0) * (item.hargaSatuan || 0);
}

export function calcRabSummary(rab) {
  const items = rab?.items ?? [];
  const settings = { ...DEFAULT_RAB_SETTINGS, ...(rab?.settings ?? {}) };

  const subtotal = items.reduce((sum, it) => sum + calcItemTotal(it), 0);
  const overhead = subtotal * (settings.overheadPercent / 100);
  const profit = subtotal * (settings.profitPercent / 100);
  const beforeContingency = subtotal + overhead + profit;
  const contingency = beforeContingency * (settings.contingencyPercent / 100);
  const beforePpn = beforeContingency + contingency;
  const ppn = beforePpn * (settings.ppnPercent / 100);
  const grandTotal = beforePpn + ppn;

  const byCategory = {};
  RAB_CATEGORIES.forEach((c) => { byCategory[c.id] = 0; });
  items.forEach((it) => {
    byCategory[it.category] = (byCategory[it.category] || 0) + calcItemTotal(it);
  });

  return {
    subtotal,
    overhead,
    profit,
    contingency,
    beforePpn,
    ppn,
    grandTotal,
    byCategory,
    settings,
    itemCount: items.length,
  };
}

export function recalcVolumesFromDesign(items, design) {
  return items.map((it) => {
    if (!it.volumeFormula) return it;
    return { ...it, volume: resolveVolume(it.volumeFormula, design, null) };
  });
}

export function getCategoryName(id) {
  return RAB_CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
}

export function formatNumber(n) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n || 0);
}
