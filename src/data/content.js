export const TAHAPAN = [
  {
    id: 1,
    title: 'Tahap Konsep Rancangan',
    shortTitle: 'Konsep',
    icon: '💡',
    ringkasan: 'Menganalisis kebutuhan klien, anggaran, fungsi ruang, dan regulasi tapak untuk menyusun Program Rancangan dan Konsep Rancangan.',
    prasyarat: 'Sebelum kegiatan perancangan dimulai, perlu ada kejelasan mengenai semua data dan informasi dari pengguna jasa yang terkait tentang kebutuhan dan persyaratan pembangunan.',
    kegiatan: [
      'Pemeriksaan seluruh data serta informasi yang diterima dari pengguna jasa',
      'Analisis dan pengolahan data primer maupun sekunder',
      'Penyusunan Program Rancangan berdasarkan batasan tujuan proyek dan kendala persyaratan/ketentuan pembangunan',
      'Penyusunan Konsep Rancangan sebagai dasar pemikiran semua bidang terkait (struktur, mekanikal, elektrikal, dll.)',
    ],
    deliverables: [
      { name: 'Program Rancangan', desc: 'Disusun berdasarkan pengolahan data untuk mencapai batasan tujuan proyek serta kendala persyaratan pembangunan yang berlaku.' },
      { name: 'Konsep Rancangan', desc: 'Dasar pemikiran yang menampung semua aspek, kebutuhan, tujuan, biaya, dan kendala proyek.' },
    ],
    persetujuan: 'Setelah program rancangan diperiksa dan mendapat persetujuan pengguna jasa, digunakan sebagai dasar konsep. Setelah konsep disetujui, menjadi dasar tahap selanjutnya.',
    sasaran: [],
  },
  {
    id: 2,
    title: 'Tahap Prarancangan / Skematik Desain',
    shortTitle: 'Prarancangan',
    icon: '📐',
    ringkasan: 'Membuat sketsa awal, tata letak ruang, bentuk luar bangunan, sirkulasi, dan diagram fungsional.',
    prasyarat: 'Berdasarkan Konsep Rancangan yang paling sesuai dan dapat memenuhi persyaratan program perancangan.',
    kegiatan: [
      'Menyusun pola dan gubahan bentuk arsitektur dalam gambar-gambar',
      'Menyajikan nilai fungsional dalam bentuk diagram-diagram',
      'Menyajikan aspek kualitatif dan kuantitatif: luas lantai, bahan, sistem konstruksi, biaya, waktu pelaksanaan',
    ],
    deliverables: [
      { name: 'Gambar Skematik', desc: 'Pola dan gubahan bentuk arsitektur, tata letak ruang, bentuk luar bangunan.' },
      { name: 'Diagram Fungsional', desc: 'Sirkulasi dan alur fungsi ruang.' },
      { name: 'Laporan Prarancangan', desc: 'Perkiraan luas lantai, bahan, biaya, dan waktu pelaksanaan.' },
    ],
    persetujuan: 'Setelah diperiksa dan mendapat persetujuan dari pengguna jasa, arsitek melanjutkan ke tahap selanjutnya.',
    sasaran: [
      'Membantu pengguna jasa memperoleh pengertian yang tepat atas program dan konsep rancangan',
      'Mendapatkan pola dan gubahan bentuk yang tepat, waktu pembangunan singkat, dan biaya ekonomis',
      'Memperoleh kesesuaian pengertian atas konsep rancangan dan pengaruhnya terhadap kelayakan lingkungan',
      'Menunjukkan keselarasan konsep rancangan terhadap ketentuan Rencana Tata Kota untuk perizinan',
    ],
  },
  {
    id: 3,
    title: 'Tahap Pengembangan Rancangan',
    shortTitle: 'Pengembangan',
    icon: '🏗️',
    ringkasan: 'Mematangkan material, sistem struktur, utilitas (pipa/listrik), dan estimasi biaya kasar.',
    prasyarat: 'Berdasarkan prarancangan yang telah disetujui oleh pengguna jasa.',
    kegiatan: [
      'Menentukan sistem konstruksi, struktur, mekanikal-elektrikal, dan disiplin terkait lainnya',
      'Menjelaskan bahan bangunan dengan mempertimbangkan manfaat, ketersediaan, konstruksi, dan nilai ekonomi',
      'Menyusun perkiraan biaya konstruksi berdasarkan sistem bangunan',
    ],
    deliverables: [
      { name: 'Gambar Pengembangan', desc: 'Gambar-gambar rancangan yang lebih matang dan terpadu.' },
      { name: 'Diagram Sistem', desc: 'Diagram struktur, MEP, dan sistem terkait.' },
      { name: 'Laporan Pengembangan', desc: 'Uraian bahan, sistem, dan perkiraan biaya konstruksi.' },
    ],
    persetujuan: 'Setelah disetujui pengguna jasa, hasil pengembangan rancangan dianggap rancangan akhir dan dasar tahap selanjutnya.',
    sasaran: [
      'Memastikan dan menguraikan ukuran serta wujud karakter bangunan secara menyeluruh, pasti, dan terpadu',
      'Mematangkan konsep rancangan dari segi kelayakan, fungsi, estetika, waktu, dan ekonomi bangunan',
    ],
  },
  {
    id: 4,
    title: 'Tahap Pembuatan Gambar Kerja',
    shortTitle: 'Gambar Kerja',
    icon: '📋',
    ringkasan: 'Menyediakan gambar teknis detail, spesifikasi material, dan syarat teknis untuk konstruksi.',
    prasyarat: 'Berdasarkan hasil Pengembangan Rancangan yang telah disetujui pengguna jasa.',
    kegiatan: [
      'Menerjemahkan konsep rancangan ke gambar-gambar dan uraian teknis terinci',
      'Menyusun spesifikasi dan syarat-syarat teknik pembangunan',
      'Menyusun perhitungan kuantitas pekerjaan (Bill of Quantity) dan perkiraan biaya pelaksanaan',
    ],
    deliverables: [
      { name: 'Gambar Kerja (Working Drawing)', desc: 'Gambar teknis detail untuk pelaksanaan konstruksi.' },
      { name: 'Spesifikasi Teknis', desc: 'Spesifikasi material dan syarat-syarat teknik pembangunan.' },
      { name: 'RAB & BoQ', desc: 'Perhitungan kuantitas pekerjaan dan perkiraan biaya pelaksanaan.' },
    ],
    persetujuan: 'Setelah disetujui, Gambar Kerja dianggap rancangan akhir dan siap untuk proses selanjutnya.',
    sasaran: [
      'Memperoleh kejelasan teknik pelaksanaan konstruksi agar konsep dapat diwujudkan dengan mutu baik',
      'Memperoleh kejelasan kuantitatif agar biaya dan waktu pelaksanaan dapat dihitung seksama',
      'Melengkapi kejelasan teknis administrasi pelaksanaan dan persyaratan yuridis dokumen pelelangan/kontrak',
    ],
  },
  {
    id: 5,
    title: 'Tahap Proses Pengadaan Pelaksana Konstruksi',
    shortTitle: 'Pengadaan',
    icon: '📝',
    ringkasan: 'Membantu tender kontraktor dan menyeleksi pelaksana proyek.',
    prasyarat: 'Berdasarkan Gambar Kerja yang telah disetujui pengguna jasa.',
    kegiatan: [
      'Penyiapan Dokumen Pelelangan: RKS, RAB, Daftar Volume (BoQ)',
      'Prakualifikasi seleksi pelaksana konstruksi',
      'Pembagian Dokumen Pelelangan kepada peserta/lelang',
      'Penjelasan teknis dan lingkup pekerjaan',
      'Penerimaan dan penilaian penawaran biaya dari pelaksana konstruksi',
      'Rekomendasi pemilihan Pelaksana Konstruksi kepada pengguna jasa',
      'Penyusunan Perjanjian Kerja Konstruksi',
    ],
    deliverables: [
      { name: 'Dokumen Pelelangan', desc: 'Format dokumen pelelangan lengkap dengan RKS dan RAB.' },
      { name: 'Uraian RKS', desc: 'Rencana Kerja dan Syarat-Syarat teknis pelaksanaan pekerjaan.' },
      { name: 'Perjanjian Kerja Konstruksi', desc: 'Dokumen kontrak antara Pengguna Jasa dan Pelaksana Konstruksi.' },
    ],
    persetujuan: 'Rekomendasi pemilihan pelaksana konstruksi memerlukan persetujuan pengguna jasa.',
    sasaran: [
      'Memperoleh penawaran biaya dan waktu konstruksi yang wajar dan memenuhi syarat teknis pelaksanaan pekerjaan',
    ],
  },
  {
    id: 6,
    title: 'Tahap Pengawasan Berkala',
    shortTitle: 'Pengawasan',
    icon: '👁️',
    ringkasan: 'Memantau progres di lapangan agar sesuai dengan dokumen perencanaan.',
    prasyarat: 'Pelaksana konstruksi telah ditetapkan dan konstruksi dimulai.',
    kegiatan: [
      'Peninjauan dan pengawasan berkala di lapangan',
      'Pertemuan teratur dengan pengguna jasa dan Pelaksana Pengawasan Terpadu/MK',
      'Pengawasan paling banyak 1 kali dalam 2 minggu atau sekurang-kurangnya 1 kali sebulan',
      'Arsitek TIDAK terlibat pengawasan harian atau menerus',
    ],
    deliverables: [
      { name: 'Laporan Pengawasan Berkala', desc: 'Dokumentasi hasil peninjauan lapangan dan rekomendasi.' },
      { name: 'Notulen Pertemuan', desc: 'Catatan pertemuan dengan pengguna jasa dan MK.' },
    ],
    persetujuan: 'Laporan pengawasan disampaikan kepada pengguna jasa untuk keputusan tindakan konstruksi.',
    catatanKhusus: 'Apabila lokasi di luar kota tempat kediaman arsitek, biaya perjalanan wajib diganti oleh pengguna jasa sesuai ketentuan yang disepakati.',
    sasaran: [
      'Membantu pengguna jasa merumuskan kebijaksanaan dan pertimbangan keputusan tindakan konstruksi terkait rancangan',
      'Membantu Pengawas Terpadu/MK menanggulangi masalah konstruksi terkait rancangan arsitek',
      'Memastikan pelaksanaan konstruksi sesuai ketentuan mutu dalam rancangan arsitek',
    ],
  },
];

export const SPESIALISASI = [
  {
    id: 'perumahan',
    title: 'Arsitek Perumahan',
    icon: '🏠',
    color: '#3b82f6',
    deskripsi: 'Fokus pada desain rumah tinggal, hunian tapak, atau apartemen.',
    cakupan: ['Rumah tinggal', 'Hunian tapak', 'Apartemen', 'Cluster perumahan', 'Renovasi hunian'],
    tahapanRelevan: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'komersial',
    title: 'Arsitek Komersial',
    icon: '🏢',
    color: '#8b5cf6',
    deskripsi: 'Fokus pada perkantoran, pusat perbelanjaan, hotel, dan bangunan publik.',
    cakupan: ['Perkantoran', 'Pusat perbelanjaan', 'Hotel & resort', 'Restoran & F&B', 'Bangunan publik'],
    tahapanRelevan: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'urban',
    title: 'Urban Designer / Arsitek Lanskap',
    icon: '🌳',
    color: '#22c55e',
    deskripsi: 'Fokus pada penataan kawasan, ruang terbuka hijau, dan lansekap kota.',
    cakupan: ['Masterplan kawasan', 'Ruang terbuka hijau', 'Taman publik', 'Waterfront', 'Revitalisasi kota'],
    tahapanRelevan: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'konservasi',
    title: 'Arsitek Konservasi',
    icon: '🏛️',
    color: '#f59e0b',
    deskripsi: 'Fokus pada perbaikan atau pemeliharaan bangunan bersejarah.',
    cakupan: ['Restorasi bangunan bersejarah', 'Adaptif reuse', 'Konservasi struktur', 'Dokumentasi warisan', 'Rehabilitasi'],
    tahapanRelevan: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'interior',
    title: 'Arsitek Interior',
    icon: '🛋️',
    color: '#ec4899',
    deskripsi: 'Fokus pada pengolahan tata ruang dalam, perabotan, dan pencahayaan.',
    cakupan: ['Tata ruang interior', 'Desain perabotan', 'Pencahayaan', 'Material finishing', 'Styling ruang'],
    tahapanRelevan: [1, 2, 3, 4],
  },
];

export const HAK_KEkayaan = [
  {
    id: 'hak-milik',
    title: 'Hak Milik Dokumen',
    icon: '📄',
    points: [
      'Hak kepemilikan atas setiap dokumen perancangan tetap berada pada Arsitek, termasuk setelah penyelesaian proyek atau pemutusan hubungan kerja.',
      'Dokumen perancangan tidak diperkenankan digunakan untuk proyek lain kecuali seizin arsitek dengan persetujuan tertulis dan imbalan jasa tambahan.',
    ],
  },
  {
    id: 'hak-perwujudan',
    title: 'Hak Perwujudan Rancangan',
    icon: '🏗️',
    points: [
      'Hak perwujudan adalah hak untuk merealisasikan rancangan arsitektur menjadi karya arsitektur yang nyata.',
      'Pengguna Jasa mendapat hak perwujudan sebanyak 1 (satu) kali setelah memenuhi kewajiban pembayaran imbalan jasa.',
      'Perwujudan ulang wajib memberitahukan dan mendapat persetujuan tertulis arsitek dengan imbalan jasa sesuai ketentuan.',
    ],
  },
  {
    id: 'tanda-nama',
    title: 'Tanda Nama Arsitek',
    icon: '✍️',
    points: [
      'Arsitek berhak membubuhkan tanda nama arsitek pada gambar arsitektur.',
    ],
  },
  {
    id: 'hak-dokumentasi',
    title: 'Hak Dokumentasi & Penggandaan',
    icon: '📸',
    points: [
      'Arsitek memiliki hak dokumentasi termasuk gambar, foto, dan rekaman bangunan hasil rancangannya.',
      'Hanya arsitek yang memiliki hak penggandaan atas gambar-gambar rancangan arsitektur yang dibuatnya.',
    ],
  },
  {
    id: 'regulasi',
    title: 'Regulasi HKI yang Berlaku',
    icon: '⚖️',
    points: [
      'UU No. 19 Tahun 2002 tentang Hak Cipta',
      'UU No. 14 Tahun 2001 tentang Paten',
      'UU No. 15 Tahun 2001 tentang Merek',
      'UU No. 31 Tahun 2000 tentang Desain Industri',
      'Peraturan perundang-undangan HKI lainnya yang berlaku',
    ],
  },
];

export const LAYANAN_UTAMA = [
  { tahap: 1, nama: 'Penyusunan Program & Konsep', desc: 'Analisis kebutuhan, anggaran, fungsi ruang, regulasi tapak' },
  { tahap: 2, nama: 'Prarancangan (Skematik)', desc: 'Sketsa awal, tata letak, bentuk luar, sirkulasi' },
  { tahap: 3, nama: 'Pengembangan Rancangan', desc: 'Material, struktur, utilitas, estimasi biaya' },
  { tahap: 4, nama: 'Pembuatan Gambar Kerja', desc: 'Gambar teknis detail, spesifikasi, syarat teknis' },
  { tahap: 5, nama: 'Pengadaan Pelaksana Konstruksi', desc: 'Tender kontraktor, seleksi pelaksana proyek' },
  { tahap: 6, nama: 'Pengawasan Berkala', desc: 'Pemantauan progres lapangan sesuai dokumen perencanaan' },
];

export const STAGE_STATUS = {
  locked: { label: 'Terkunci', class: 'status-locked' },
  active: { label: 'Berjalan', class: 'status-active' },
  pending_approval: { label: 'Menunggu Persetujuan', class: 'status-pending' },
  approved: { label: 'Disetujui', class: 'status-approved' },
};

export const SPECIALIZATION_OPTIONS = SPESIALISASI.map((s) => ({ value: s.id, label: s.title }));
