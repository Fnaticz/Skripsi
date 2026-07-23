const TAHAPAN_DATA = [
  { id: 1, title: 'Tahap Konsep Rancangan', deliverables: [{ name: 'Program Rancangan' }, { name: 'Konsep Rancangan' }] },
  { id: 2, title: 'Tahap Prarancangan / Skematik Desain', deliverables: [{ name: 'Gambar Skematik' }, { name: 'Diagram Fungsional' }, { name: 'Laporan Prarancangan' }] },
  { id: 3, title: 'Tahap Pengembangan Rancangan', deliverables: [{ name: 'Gambar Pengembangan' }, { name: 'Diagram Sistem' }, { name: 'Laporan Pengembangan' }] },
  { id: 4, title: 'Tahap Pembuatan Gambar Kerja', deliverables: [{ name: 'Gambar Kerja (Working Drawing)' }, { name: 'Spesifikasi Teknis' }, { name: 'RAB & BoQ' }] },
  { id: 5, title: 'Tahap Proses Pengadaan Pelaksana Konstruksi', deliverables: [{ name: 'Dokumen Pelelangan' }, { name: 'Uraian RKS' }, { name: 'Perjanjian Kerja Konstruksi' }] },
  { id: 6, title: 'Tahap Pengawasan Berkala', deliverables: [{ name: 'Laporan Pengawasan Berkala' }, { name: 'Notulen Pertemuan' }] },
];

const SPESIALISASI_DATA = [
  { id: 'perumahan', title: 'Arsitek Perumahan' },
  { id: 'komersial', title: 'Arsitek Komersial' },
  { id: 'urban', title: 'Urban Designer / Arsitek Lanskap' },
  { id: 'konservasi', title: 'Arsitek Konservasi' },
  { id: 'interior', title: 'Arsitek Interior' },
];

module.exports = { TAHAPAN_DATA, SPESIALISASI_DATA };
