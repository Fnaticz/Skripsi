function escapeCsv(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatNum(n) {
  return Math.round(n || 0);
}

function buildRabCsv(project) {
  const rab = project.rab ?? { items: [], settings: {} };
  const design = project.design ?? {};
  const s = { ppnPercent: 11, contingencyPercent: 5, overheadPercent: 10, profitPercent: 6, ...rab.settings };
  const lines = [];

  lines.push('RENCANA ANGGARAN BIAYA (RAB) / BILL OF QUANTITY');
  lines.push(`Proyek,${escapeCsv(project.name)}`);
  lines.push(`Klien,${escapeCsv(project.clientName)}`);
  lines.push(`Lokasi,${escapeCsv(project.location || '')}`);
  lines.push(`Luas Bangunan (m2),${design.luasBangunan ?? ''}`);
  lines.push(`Luas Tapak (m2),${design.luasTapak ?? ''}`);
  lines.push(`Jumlah Lantai,${design.jumlahLantai ?? 1}`);
  lines.push(`Tanggal Export,${new Date().toISOString().slice(0, 10)}`);
  lines.push('');

  lines.push('No,Kategori,Uraian Pekerjaan,Volume,Satuan,Harga Satuan (Rp),Jumlah (Rp)');
  let no = 1;
  let subtotal = 0;
  rab.items.forEach((it) => {
    const jumlah = (it.volume || 0) * (it.hargaSatuan || 0);
    subtotal += jumlah;
    lines.push([
      no++,
      escapeCsv(it.category),
      escapeCsv(it.pekerjaan),
      it.volume ?? 0,
      escapeCsv(it.satuan),
      formatNum(it.hargaSatuan),
      formatNum(jumlah),
    ].join(','));
  });

  const overhead = subtotal * s.overheadPercent / 100;
  const profit = subtotal * s.profitPercent / 100;
  const beforeCont = subtotal + overhead + profit;
  const contingency = beforeCont * s.contingencyPercent / 100;
  const beforePpn = beforeCont + contingency;
  const ppn = beforePpn * s.ppnPercent / 100;
  const grandTotal = beforePpn + ppn;

  lines.push('');
  lines.push(`,,,,,Subtotal,${formatNum(subtotal)}`);
  lines.push(`,,,,,Overhead ${s.overheadPercent}%,${formatNum(overhead)}`);
  lines.push(`,,,,,Profit ${s.profitPercent}%,${formatNum(profit)}`);
  lines.push(`,,,,,Kontinjensi ${s.contingencyPercent}%,${formatNum(contingency)}`);
  lines.push(`,,,,,PPN ${s.ppnPercent}%,${formatNum(ppn)}`);
  lines.push(`,,,,,GRAND TOTAL,${formatNum(grandTotal)}`);

  return lines.join('\n');
}

module.exports = { buildRabCsv };
