import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { getLogoBase64 } from './pdfHelper';
import { Order, Bill } from '../types';

/**
 * Builds and returns the standardized jsPDF Document instance for an Order or Bill.
 */
export async function generateInvoicePdfDoc(order: Order | Bill | any): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const invoiceNumber = order.invoiceNumber || order.billNumber || 'INV-PENDING';
  const orderDate = order.date ? new Date(order.date) : new Date();
  const formattedDate = format(orderDate, 'MMM dd, yyyy');
  const formattedTime = format(orderDate, 'hh:mm a');
  const customerName = order.customerName || 'Walk-in Customer';
  const mobile = order.mobile || 'N/A';
  const address = order.address || 'In-Store';
  const paymentMethod = order.paymentMethod || 'Cash';
  const paymentStatus = order.paymentStatus || 'Paid';
  const source = order.source || 'Admin (POS)';
  const items = order.items || [];

  // Top Accent Bar (Amber Gold)
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, 210, 5, 'F');

  // Try adding brand logo
  let logoLoaded = false;
  try {
    const logoData = await getLogoBase64();
    if (logoData) {
      doc.addImage(logoData, 'PNG', 14, 12, 18, 18);
      logoLoaded = true;
    }
  } catch (err) {
    console.warn('Logo could not be loaded into PDF, continuing with styled text branding:', err);
  }

  const brandX = logoLoaded ? 36 : 14;

  // Company Branding Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(217, 119, 6); // Amber-600
  doc.text('SHREE HARI', brandX, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('Premium Pooja Samagri & Devotional Essentials', brandX, 26);
  doc.text('Phone / WhatsApp: +91 7058117155', brandX, 31);

  // Top Right: TAX INVOICE title & Bill No
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('TAX INVOICE', 196, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(`Invoice No: ${invoiceNumber}`, 196, 26, { align: 'right' });
  doc.text(`Date: ${formattedDate} (${formattedTime})`, 196, 31, { align: 'right' });

  // Divider line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 37, 196, 37);

  // Customer & Bill Details 2-Column Info Card
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(14, 42, 182, 30, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 30, 2, 2, 'S');

  // Left column: Customer Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(217, 119, 6);
  doc.text('BILLED TO:', 20, 49);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(customerName, 20, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile: ${mobile}`, 20, 62);
  doc.text(`Address: ${address.substring(0, 45)}`, 20, 67);

  // Right column: Invoice / Payment Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(217, 119, 6);
  doc.text('PAYMENT DETAILS:', 120, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Mode:`, 120, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${paymentMethod}`, 155, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Status:`, 120, 62);
  doc.setFont('helvetica', 'bold');
  if (paymentStatus === 'Paid') {
    doc.setTextColor(16, 185, 129); // Emerald
  } else {
    doc.setTextColor(239, 68, 68); // Red
  }
  doc.text(`${paymentStatus}`, 155, 62);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Channel:`, 120, 67);
  doc.text(`${source}`, 155, 67);

  // Items Table
  const tableColumn = ['#', 'Item Description', 'Qty', 'Unit Price', 'Amount'];
  const tableRows: any[] = [];

  items.forEach((item: any, index: number) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.sellingPrice || item.price || 0);
    const itemTotal = qty * price;

    tableRows.push([
      (index + 1).toString(),
      item.name || 'Item',
      qty.toString(),
      `Rs ${price.toFixed(2)}`,
      `Rs ${itemTotal.toFixed(2)}`
    ]);
  });

  autoTable(doc, {
    startY: 78,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    styles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: 14, right: 14 }
  });

  // Calculate Summary Totals
  const rawSubtotal = items.reduce((sum: number, item: any) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.sellingPrice || item.price || 0);
    return sum + (qty * price);
  }, 0);

  const hasGst = Boolean(order.gstIncluded || (order.gstAmount && order.gstAmount > 0));
  const gstAmount = hasGst ? (order.gstAmount || (rawSubtotal * 0.18)) : 0;
  const grandTotal = Number(order.totalAmount || (rawSubtotal + gstAmount));
  const paidAmount = order.paidAmount !== undefined ? Number(order.paidAmount) : (paymentStatus === 'Paid' ? grandTotal : 0);
  const dueAmount = order.dueAmount !== undefined ? Number(order.dueAmount) : Math.max(0, grandTotal - paidAmount);

  const finalTableY = (doc as any).lastAutoTable?.finalY || 140;
  let summaryY = finalTableY + 8;

  // If page space is low, add new page
  if (summaryY > 240) {
    doc.addPage();
    summaryY = 20;
  }

  // Summary box on right
  const summaryBoxX = 115;
  const summaryBoxWidth = 81;
  const summaryBoxHeight = hasGst ? (dueAmount > 0 ? 44 : 36) : (dueAmount > 0 ? 36 : 28);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryBoxX, summaryY, summaryBoxWidth, summaryBoxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryBoxX, summaryY, summaryBoxWidth, summaryBoxHeight, 2, 2, 'S');

  let curY = summaryY + 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryBoxX + 6, curY);
  doc.text(`Rs ${rawSubtotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, curY, { align: 'right' });

  if (hasGst) {
    curY += 7;
    doc.text('GST (18%):', summaryBoxX + 6, curY);
    doc.text(`Rs ${gstAmount.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, curY, { align: 'right' });
  }

  curY += 7;
  doc.setDrawColor(226, 232, 240);
  doc.line(summaryBoxX + 6, curY - 2, summaryBoxX + summaryBoxWidth - 6, curY - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', summaryBoxX + 6, curY + 3);
  doc.text(`Rs ${grandTotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, curY + 3, { align: 'right' });

  if (dueAmount > 0) {
    curY += 8;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('Paid Today:', summaryBoxX + 6, curY + 2);
    doc.text(`Rs ${paidAmount.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, curY + 2, { align: 'right' });

    curY += 6;
    doc.setTextColor(239, 68, 68);
    doc.text('Pending Due:', summaryBoxX + 6, curY + 2);
    doc.text(`Rs ${dueAmount.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, curY + 2, { align: 'right' });
  }

  // Terms and Notes on the left side
  const notesY = summaryY + 5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Terms & Instructions:', 14, notesY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Goods once sold can be replaced within 3 days in original packaging.', 14, notesY + 5);
  doc.text('2. Please keep this invoice for warranty and returns.', 14, notesY + 10);
  doc.text('3. Thank you for choosing Shree Hari for your spiritual needs!', 14, notesY + 15);

  // Footer Branding & Signatory
  const footerY = 280;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, footerY - 10, 196, footerY - 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated tax invoice and does not require physical signature.', 14, footerY - 4);
  doc.text('SHREE HARI - Pure & Authentic Pooja Essentials', 196, footerY - 4, { align: 'right' });

  return doc;
}

/**
 * Generates an invoice PDF as a binary Blob.
 */
export async function generateInvoicePdfBlob(order: Order | Bill | any): Promise<Blob> {
  const doc = await generateInvoicePdfDoc(order);
  return doc.output('blob');
}

/**
 * Generates and downloads the invoice PDF to the user's computer.
 */
export async function downloadInvoicePdf(order: Order | Bill | any, customFilename?: string): Promise<void> {
  const doc = await generateInvoicePdfDoc(order);
  const invoiceNum = order.invoiceNumber || order.billNumber || Date.now();
  const filename = customFilename || `Invoice_${invoiceNum}.pdf`;
  doc.save(filename);
}

/**
 * Generates and opens the invoice PDF in a new browser tab/window.
 */
export async function viewInvoicePdf(order: Order | Bill | any): Promise<void> {
  const doc = await generateInvoicePdfDoc(order);
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}

/**
 * Prepares and sends the Invoice via WhatsApp with:
 * 1. Native Web Share API (attaching PDF document directly if supported)
 * 2. WhatsApp URL link with full order breakdown and direct public PDF invoice download link
 * 3. Automatic local PDF download so admin has the file ready on device
 */
export async function sendInvoiceViaWhatsApp(
  order: Order | Bill | any,
  pdfBlob?: Blob,
  invoiceUrl?: string
): Promise<{ sharedDirectly: boolean; whatsappOpened: boolean }> {
  const invoiceNum = order.invoiceNumber || order.billNumber || 'INV-PENDING';
  const customerName = order.customerName || 'Customer';
  const rawMobile = (order.mobile || '').replace(/[^0-9]/g, '');
  const mobile = rawMobile.startsWith('91') && rawMobile.length === 12 ? rawMobile.slice(2) : rawMobile;
  const items = order.items || [];
  const grandTotal = Number(order.totalAmount || 0).toFixed(2);
  const paymentMethod = order.paymentMethod || 'Cash';
  const paymentStatus = order.paymentStatus || 'Paid';

  // Ensure we have the PDF blob
  const blob = pdfBlob || (await generateInvoicePdfBlob(order));
  const pdfFile = new File([blob], `Invoice_${invoiceNum}.pdf`, { type: 'application/pdf' });

  // 1. Try Native Web Share API (supported on mobile/tablets to attach actual PDF file)
  let sharedDirectly = false;
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      await navigator.share({
        title: `Invoice ${invoiceNum} - Shree Hari`,
        text: `Namaste ${customerName}, here is your invoice for ₹${grandTotal} from Shree Hari.`,
        files: [pdfFile]
      });
      sharedDirectly = true;
      return { sharedDirectly: true, whatsappOpened: false };
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, falling back to WhatsApp Web URL:', err);
      }
    }
  }

  // 2. Format WhatsApp Message with itemized list and direct download link
  const itemsSummary = items
    .map((item: any) => `• ${item.name} × ${item.quantity} (₹${(Number(item.sellingPrice || item.price || 0) * Number(item.quantity || 1)).toFixed(2)})`)
    .join('\n');

  let pdfLinkText = '';
  if (invoiceUrl && !invoiceUrl.startsWith('blob:')) {
    pdfLinkText = `\n\n📄 *Download Official PDF Invoice:*\n${invoiceUrl}`;
  }

  const message = 
`🙏 *SHREE HARI - Tax Invoice*

Namaste *${customerName}*, thank you for shopping with Shree Hari!

━━━━━━━━━━━━━━━━━━━━
🧾 *Invoice No:* ${invoiceNum}
📅 *Date:* ${format(order.date ? new Date(order.date) : new Date(), 'dd-MM-yyyy hh:mm a')}
💳 *Payment Mode:* ${paymentMethod} (${paymentStatus})
━━━━━━━━━━━━━━━━━━━━

📦 *Purchased Items:*
${itemsSummary || '• Order Items'}

━━━━━━━━━━━━━━━━━━━━
💰 *Grand Total:* ₹${grandTotal}
━━━━━━━━━━━━━━━━━━━━${pdfLinkText}

_For support or queries, contact us at +91 7058117155._
_May Shree Hari bless you and your family!_`;

  // 3. Open WhatsApp chat directly
  if (mobile) {
    const waUrl = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  } else {
    // If no mobile number, share via generic wa.me
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  // 4. Also trigger local PDF download so the user has the physical copy immediately
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoiceNum}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.warn('Could not auto-download PDF locally:', err);
  }

  return { sharedDirectly: false, whatsappOpened: true };
}
