import jsPDF from 'jspdf';
import type { ItineraryDay } from '../types';
import { formatCurrency, formatDuration } from './routeOptimizer';

// Helper to safely clean text of unsupported unicode, emojis, or dashes that crash Helvetica in jsPDF
function cleanText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, ' ')
    .replace(/—|–/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function exportItineraryPDF(
  cityName: string,
  days: ItineraryDay[],
  totalBudget: number
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  let y = 0;

  // Safe city name for filename and header
  const cleanCity = cleanText(cityName) || 'Indonesia';
  const safeFileCity = cleanCity.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'Trip';
  const filename = `TripNesia_${safeFileCity}_Itinerary.pdf`;

  const totalCost = days.reduce((s, d) => s + d.totalCost, 0);
  const totalPlaces = days.reduce((s, d) => s + d.destinations.length, 0);
  const totalDurationMin = days.reduce((s, d) => s + d.totalDuration, 0);

  // Helper for checking page overflow
  function ensureSpace(neededHeight: number) {
    if (y + neededHeight > pageH - 22) {
      doc.addPage();
      drawPageHeader();
      y = 22;
    }
  }

  // Running header for subsequent pages
  function drawPageHeader() {
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(0, 0, pageW, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TRIPNESIA', margin, 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`|  Panduan Perjalanan: ${cleanCity}`, margin + 22, 8);
    doc.text('Smart Travel Planner Indonesia', pageW - margin - 45, 8);
  }

  // ========================================================
  // 1. COVER / HEADER BANNER (PAGE 1)
  // ========================================================
  doc.setFillColor(15, 23, 42); // Deep Slate Navy #0F172A
  doc.rect(0, 0, pageW, 46, 'F');

  // Accent gradient stripe
  doc.setFillColor(2, 132, 199); // Brand Blue #0284C7
  doc.rect(0, 44, pageW, 2, 'F');

  // Brand Name
  doc.setTextColor(56, 189, 248); // Sky Blue #38BDF8
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TRIPNESIA', margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('SMART TRAVEL PLANNER INDONESIA', margin, 22);

  // Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`ITINERARY PERJALANAN: ${cleanCity.toUpperCase()}`, margin, 32);

  // Metadata right aligned
  const issueDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Tanggal Cetak: ${cleanText(issueDate)}`, pageW - margin, 18, { align: 'right' });
  doc.text('Dokumen Resmi Rencana Wisata', pageW - margin, 24, { align: 'right' });

  y = 54;

  // ========================================================
  // 2. EXECUTIVE KPI MATRIX (4 Cards)
  // ========================================================
  const cardW = (contentW - 9) / 4;
  const cardH = 20;

  const kpis = [
    { label: 'DURASI TRIP', val: `${days.length} Hari`, sub: 'Jadwal teratur' },
    { label: 'TOTAL TEMPAT', val: `${totalPlaces} Destinasi`, sub: 'Rute optimal' },
    { label: 'EST. BIAYA TIKET', val: cleanText(formatCurrency(totalCost)), sub: 'Tiket masuk destinasi' },
    { label: 'EST. WAKTU AKTIVITAS', val: cleanText(formatDuration(totalDurationMin)), sub: 'Waktu kunjungan' },
  ];

  kpis.forEach((kpi, idx) => {
    const cx = margin + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252); // #F8FAFC
    doc.setDrawColor(226, 232, 240); // #E2E8F0
    doc.setLineWidth(0.4);
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD');

    // Accent line at top of card
    doc.setFillColor(2, 132, 199);
    doc.roundedRect(cx, y, cardW, 1.5, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, cx + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, cx + 4, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, cx + 4, y + 17);
  });

  y += cardH + 8;

  // Budget status bar if user set budget
  if (totalBudget > 0) {
    const budgetPct = Math.min(100, Math.round((totalCost / totalBudget) * 100));
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentW, 10, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Alokasi Anggaran: ${cleanText(formatCurrency(totalBudget))}  |  Est. Pengeluaran: ${cleanText(formatCurrency(totalCost))} (${budgetPct}%)`,
      margin + 4,
      y + 6.5
    );

    const sisa = totalBudget - totalCost;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    if (sisa >= 0) {
      doc.setTextColor(5, 150, 105);
      doc.text(`Sisa Anggaran: ${cleanText(formatCurrency(sisa))} (Aman)`, pageW - margin - 4, y + 6.5, { align: 'right' });
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text(`Melebihi Anggaran: ${cleanText(formatCurrency(Math.abs(sisa)))}`, pageW - margin - 4, y + 6.5, { align: 'right' });
    }
    y += 15;
  }

  // ========================================================
  // 3. DETAILED ITINERARY BY DAY
  // ========================================================
  for (const day of days) {
    ensureSpace(24);

    // Day Section Header Banner
    doc.setFillColor(2, 132, 199); // Brand Blue
    doc.roundedRect(margin, y, contentW, 9, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const dayDateStr = day.date ? ` - ${cleanText(day.date)}` : '';
    doc.text(`HARI ${day.day}${dayDateStr.toUpperCase()}`, margin + 4, y + 6);

    const dayMeta = `${day.destinations.length} Tempat  |  Est. Biaya: ${cleanText(formatCurrency(day.totalCost))}  |  Waktu: ${cleanText(formatDuration(day.totalDuration))}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(dayMeta, pageW - margin - 4, y + 6, { align: 'right' });

    y += 13;

    // Render destinations for this day
    for (let i = 0; i < day.destinations.length; i++) {
      const dest = day.destinations[i];
      const startHour = 8 + i * 2;
      const endHour = startHour + 2;
      const timeSlot = `${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`;

      const safeName = cleanText(dest.name) || 'Destinasi Wisata';
      const safeDesc = cleanText(dest.description) || 'Informasi tempat wisata dan rute rekreasi keluarga.';
      const safeCategory = cleanText(dest.category).toUpperCase() || 'WISATA';
      const costStr = dest.estimatedCost === 0 ? 'Gratis' : cleanText(formatCurrency(dest.estimatedCost));

      // Calculate description height
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const descLines = doc.splitTextToSize(safeDesc, contentW - 42);
      const neededCardH = Math.max(22, 14 + descLines.length * 3.5);

      ensureSpace(neededCardH + 4);

      // Card container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentW, neededCardH, 1.5, 1.5, 'FD');

      // Left Column: Time & Step Number Pill
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin + 2, y + 2, 32, neededCardH - 4, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(2, 132, 199);
      doc.text(`STOP ${String(i + 1).padStart(2, '0')}`, margin + 18, y + 7, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(timeSlot, margin + 18, y + 13, { align: 'center' });

      // Destination Main Info
      const textX = margin + 38;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(safeName, textX, y + 6);

      // Category Pill
      const catText = `${safeCategory}`;
      const catW = doc.getTextWidth(catText);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(textX, y + 8, catW + 6, 4.5, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(catText, textX + 3, y + 11.2);

      // Ticket Price Tag (Right Aligned)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      if (dest.estimatedCost === 0) {
        doc.setTextColor(5, 150, 105); // Green
        doc.text('Tiket: Gratis', pageW - margin - 4, y + 6, { align: 'right' });
      } else {
        doc.setTextColor(2, 132, 199); // Blue
        doc.text(`Tiket: ${costStr}`, pageW - margin - 4, y + 6, { align: 'right' });
      }

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(descLines, textX, y + 14.5);

      y += neededCardH + 3;

      // Small travel indicator between stops
      if (i < day.destinations.length - 1) {
        ensureSpace(6);
        doc.setDrawColor(203, 213, 225);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(margin + 18, y - 1, margin + 18, y + 3);
        doc.setLineDashPattern([], 0); // reset

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text('Perjalanan ke lokasi berikutnya (~15-30 menit)', margin + 26, y + 2);
        y += 5;
      }
    }

    y += 5;
  }

  // ========================================================
  // 4. BUDGET BREAKDOWN SUMMARY TABLE
  // ========================================================
  ensureSpace(45);

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentW, 7, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('RINGKASAN ANGGARAN PERJALANAN', margin + 4, y + 4.8);

  y += 9;

  // Table Headers
  const col1 = margin + 4;
  const col2 = margin + 40;
  const col3 = margin + 85;
  const col4 = pageW - margin - 4;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Jadwal', col1, y + 4.2);
  doc.text('Jumlah Kunjungan', col2, y + 4.2);
  doc.text('Estimasi Biaya Tiket', col3, y + 4.2);
  doc.text('Catatan', col4, y + 4.2, { align: 'right' });

  y += 7;

  days.forEach((d) => {
    ensureSpace(7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    doc.text(`Hari ${d.day}`, col1, y + 4);
    doc.text(`${d.destinations.length} Destinasi`, col2, y + 4);
    doc.text(cleanText(formatCurrency(d.totalCost)), col3, y + 4);
    doc.text(d.totalCost === 0 ? 'Wisata Gratis' : 'Tiket Standar', col4, y + 4, { align: 'right' });

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6, pageW - margin, y + 6);
    y += 6.5;
  });

  // Grand Total Row
  ensureSpace(8);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentW, 7, 'F');
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  doc.line(margin, y + 7, pageW - margin, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL KESELURUHAN', col1, y + 4.8);
  doc.text(`${totalPlaces} Destinasi`, col2, y + 4.8);
  doc.setTextColor(2, 132, 199);
  doc.text(cleanText(formatCurrency(totalCost)), col3, y + 4.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Estimasi Tiket Saja', col4, y + 4.8, { align: 'right' });

  y += 14;

  // ========================================================
  // 5. TRAVEL TIPS & ADVISORY SECTION
  // ========================================================
  ensureSpace(28);

  doc.setFillColor(254, 243, 199); // Amber tint
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('PANDUAN & TIPS PERJALANAN INDONESIA:', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  doc.text('- Transportasi: Gunakan aplikasi ride-hailing lokal atau sewa kendaraan harian untuk efisiensi.', margin + 4, y + 10);
  doc.text('- Cuaca Tropis: Siapkan payung, jas hujan, pakaian menyerap keringat, dan tabir surya.', margin + 4, y + 14);
  doc.text('- Etika Lokal: Kenakan pakaian sopan saat mengunjungi tempat ibadah, keraton, atau situs bersejarah.', margin + 4, y + 18);

  // ========================================================
  // 6. RUNNING FOOTER ON ALL PAGES
  // ========================================================
  const totalPageCount = doc.getNumberOfPages();
  for (let p = 1; p <= totalPageCount; p++) {
    doc.setPage(p);

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('TripNesia  |  Smart Travel Planner Indonesia  |  www.tripnesia.id', margin, pageH - 7);
    doc.text(`Halaman ${p} dari ${totalPageCount}`, pageW - margin, pageH - 7, { align: 'right' });
  }

  // ========================================================
  // 7. DOWNLOAD PDF (DATA URI + DOM-ATTACHED ANCHOR)
  // ========================================================
  // Using Data URI with embedded filename in MIME header ensures Chrome
  // saves with the correct filename and .pdf extension instead of a blob UUID.
  try {
    const dataUri = doc.output('dataurlstring', { filename });
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = dataUri;
    link.download = filename;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 1500);
  } catch {
    // Fallback: Blob with application/pdf MIME
    const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 1500);
  }

  return { filename, doc };
}

export async function previewItineraryPDF(
  cityName: string,
  days: ItineraryDay[],
  totalBudget: number
) {
  const { doc } = await exportItineraryPDF(cityName, days, totalBudget);
  const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
}

