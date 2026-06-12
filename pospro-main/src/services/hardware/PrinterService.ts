/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useSettingsStore } from '../../store/useSettingsStore';

export interface PrintData {
  title?: string;
  address?: string;
  phone?: string;
  customerName?: string;
  transactionId?: string;
  items: any[];
  total: number;
  cashAmount?: number;
  changeAmount?: number;
  footer?: string;
}

class PrinterService {
  async printReceipt(data: PrintData) {
    const settings = useSettingsStore.getState();
    
    const printData = {
      ...data,
      title: data.title || settings.storeInfo.name,
      address: data.address || settings.storeInfo.address,
      phone: data.phone || settings.storeInfo.phone,
      footer: data.footer || settings.storeInfo.footer,
    };
    
    console.log("Mencetak struk...", printData);
    return this.printUniversal(printData);
  }

  async previewReceipt(data: PrintData): Promise<string> {
    const settings = useSettingsStore.getState();
    
    const printData = {
      ...data,
      title: data.title || settings.storeInfo.name,
      address: data.address || settings.storeInfo.address,
      phone: data.phone || settings.storeInfo.phone,
      footer: data.footer || settings.storeInfo.footer,
    };

    return this.generateReceiptHtml(printData);
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }

  private escapeHtml(text: string) {
    // Penting untuk mencegah karakter seperti <, >, & merusak struktur HTML saat dimasukkan ke <pre>
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private generateReceiptHtml(data: PrintData): string {
    const settings = useSettingsStore.getState();
    const paperWidthMm = settings.printer?.paperWidthMm ?? 58;
    const extraPageHeightMm = Number.isFinite(settings.printer?.extraPageHeightMm)
      ? Number(settings.printer.extraPageHeightMm)
      : 0;

    const MAX_WIDTH = 32;
    const COL_QTY = 4;
    const COL_NAME = 18;
    const COL_TOTAL = 10;
    
    const padRight = (t: any, l: number) => (String(t || '') + ' '.repeat(l)).substring(0, l);
    const padLeft = (t: any, l: number) => (' '.repeat(l) + String(t || '')).slice(-l);
    const padCenter = (t: any, l: number) => {
      const text = String(t || '').substring(0, l);
      const space = Math.max(0, l - text.length);
      const padLeft = Math.floor(space / 2);
      return ' '.repeat(padLeft) + text + ' '.repeat(space - padLeft);
    };
    const formatReceiptAmount = (amount: number) => this.formatCurrency(amount).replace('Rp', '').trim();
    const fitAmountToColumn = (value: number, width: number) => {
      const full = formatReceiptAmount(value);
      if (full.length <= width) return full;
      const compact = String(Math.round(value));
      if (compact.length <= width) return compact;
      return compact;
    };

    const formatSummaryLine = (label: string, value: number) => {
      const amountText = fitAmountToColumn(value, COL_TOTAL);
      const summaryIndent = Math.max(0, COL_QTY - 2);
      return `${padRight('', summaryIndent)}${padCenter(label, COL_NAME)}${padLeft(amountText, COL_TOTAL)}`;
    };

    const itemsHtml = data.items.map(item => {
      let nama = '';
      if (item.product_name) nama = item.product_name;
      else if (item.name) nama = item.name;
      else if (item.nama) nama = item.nama;
      else if (item.productName) nama = item.productName;
      else if (item.nama_barang) nama = item.nama_barang;
      else if (item.barang) nama = item.barang;
      else nama = 'Produk';
      
      nama = String(nama).toUpperCase();
      const qty = Number(item.qty || item.quantity || item.jumlah) || 1;
      const harga = Number(item.price_at_sale || item.price || item.harga || item.harga_jual) || 0;
      const subtotal = qty * harga;
      const totalStr = this.formatCurrency(subtotal).replace('Rp', '').trim();

      const namaLines: string[] = [];
      for (let i = 0; i < nama.length; i += COL_NAME) {
        namaLines.push(nama.substring(i, i + COL_NAME));
      }

      let result = `${padRight(qty.toString() + 'x', COL_QTY)}${padCenter(namaLines[0], COL_NAME)}${padLeft(totalStr, COL_TOTAL)}`;
      
      for (let i = 1; i < namaLines.length; i++) {
        result += `\n${padRight('', COL_QTY)}${padCenter(namaLines[i], COL_NAME)}${padRight('', COL_TOTAL)}`;
      }
      
      return result;
    }).join('\n');

    // NOTE:
    // Sebelumnya body memakai `white-space: pre` dan HTML diindent.
    // Whitespace (spasi/newline) dari indent antar tag ikut tercetak -> membuat struk jadi "kepanjangan".
    // Solusi: render konten sebagai TEKS murni di dalam <pre>, lalu HTML dibuat tanpa indent.
    const receiptLines: string[] = [];

    receiptLines.push(String(data.title || '').toUpperCase());
    if (data.address) receiptLines.push(String(data.address));
    if (data.phone) receiptLines.push(String(data.phone));
    if (data.transactionId) receiptLines.push(`ID: ${data.transactionId}`);
    if (data.customerName) receiptLines.push(`Pelanggan: ${data.customerName}`);
    receiptLines.push(new Date().toLocaleString('id-ID'));
    receiptLines.push('-'.repeat(MAX_WIDTH));
    receiptLines.push(`${padRight('QTY', COL_QTY)}${padCenter('NAMA BARANG', COL_NAME)}${padLeft('TOTAL', COL_TOTAL)}`);
    receiptLines.push('-'.repeat(MAX_WIDTH));
    if (itemsHtml) receiptLines.push(itemsHtml);
    receiptLines.push('='.repeat(MAX_WIDTH));
    receiptLines.push(formatSummaryLine('TOTAL', data.total));
    receiptLines.push(formatSummaryLine('TUNAI', data.cashAmount || 0));
    receiptLines.push(formatSummaryLine('KEMBALI', data.changeAmount || 0));
    receiptLines.push('-'.repeat(MAX_WIDTH));
    if (data.footer) receiptLines.push(String(data.footer));

    const receiptText = receiptLines.join('\n').trimEnd();

    // Estimasi tinggi halaman berdasarkan jumlah baris.
    // Ini penting karena sebagian driver thermal akan selalu "feed" sampai akhir page height.
    // Dengan tinggi dinamis, sisa kertas setelah struk akan jauh berkurang.
    const lineCount = receiptText.length > 0 ? receiptText.split('\n').length : 1;
    // Perbaikan: naikkan line height estimation karena font monospace butuh ruang lebih
    const approxLineHeightMm = 4.5; // ~ 11px * 1.5 line-height @ 96dpi (lebih realistis)
    const paddingMm = 4; // Padding lebih ketat
    const estimatedHeightMm = Math.ceil(lineCount * approxLineHeightMm + paddingMm + Math.max(0, extraPageHeightMm));
    // Batas bawah lebih ketat: 40mm (cukup untuk header minimal)
    const pageHeightMm = Math.min(600, Math.max(40, estimatedHeightMm));

    // CSS optimal untuk thermal printer: minimal margin, tinggi dinamis
    return `<!DOCTYPE html><html><head><title>STRUK TRANSAKSI</title><meta charset="utf-8"><style>
      *{margin:0;padding:0;box-sizing:border-box;}
      @page{margin:0;size:${paperWidthMm}mm ${pageHeightMm}mm;}
      html,body{margin:0;padding:0;width:${paperWidthMm}mm;height:${pageHeightMm}mm;overflow:visible;}
      body{font-family:'Courier New',monospace;font-size:11px;line-height:1.5;background:#fff;color:#000;}
      pre{margin:0;padding:0;white-space:pre;line-height:1.5;}
      @media print{
        html,body{height:auto !important;min-height:0 !important;overflow:visible;}
        @page{margin:0;size:${paperWidthMm}mm auto;}
      }
    </style></head><body><pre>${this.escapeHtml(receiptText)}</pre></body></html>`;
  }

  private printUniversal(data: PrintData) {
    const finalHtml = this.generateReceiptHtml(data);

    const htmlWithPrintTrigger = finalHtml.replace('</body>', `
      <script>
        (function() {
          var userAgent = navigator.userAgent.toLowerCase();
          var isAndroid = userAgent.includes('android');
          
          if (isAndroid && window.location.protocol !== 'file:') {
            var text = document.body.innerText;
            var base64 = btoa(unescape(encodeURIComponent(text)));
            window.location.href = "rawbt:base64," + base64;
            return;
          }
          
          function doPrint() {
            try {
              window.focus();
              window.print();
            } catch(e) {}
          }
          
          window.onload = doPrint;
          
          // Tutup popup setelah print dialog ditutup
          if (window.onafterprint === undefined) {
            // Fallback: polling setiap 500ms untuk deteksi print selesai
            var beforePrint = new Date();
            var pollTimer = setInterval(function() {
              var afterPrint = new Date();
              var elapsed = afterPrint - beforePrint;
              // Jika sudah lewat 1 detik dan tidak ada print aktif, tutup
              if (elapsed > 1000) {
                clearInterval(pollTimer);
                try { window.close(); } catch(e) {}
              }
            }, 500);
          } else {
            window.onafterprint = function() {
              setTimeout(function() { try { window.close(); } catch(e) {} }, 100);
            };
          }
          
          // Jika window.print() langsung selesai (misal print dialog ditolak), tetap tutup
          setTimeout(function() {
            try { window.close(); } catch(e) {}
          }, 5000);
        })();
      <\/script>
    </body>`);

    var popup = window.open('', '_blank', 'width=380,height=500,menubar=no,toolbar=no,location=no,status=no,scrollbars=no,resizable=no');
    
    if (!popup) {
      console.warn('Popup diblokir, fallback ke iframe...');
      return this.printViaIframe(htmlWithPrintTrigger);
    }

    try {
      popup.document.open();
      popup.document.write(htmlWithPrintTrigger);
      popup.document.close();
    } catch(e) {
      console.warn('Gagal nulis ke popup, fallback ke iframe...', e);
      popup.close();
      return this.printViaIframe(htmlWithPrintTrigger);
    }
  }

  private printViaIframe(htmlContent: string) {
    var iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '58mm';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    
    document.body.appendChild(iframe);

    var doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 45000);
  }
}

export const printerService = new PrinterService();