import jsPDF from 'jspdf';

/**
 * Instantly download crisp print-ready A4 landscape PDF directly in client browser
 * 0 Server Load, 0 Memory Leak, 0 Gateway Timeout, 100% Instant Delivery
 */
export const downloadPdfFromImage = async (dataUriOrUrl, filename = 'Certificate.pdf') => {
  if (!dataUriOrUrl) return;

  const sanitizedFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  if (dataUriOrUrl.startsWith('data:image')) {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      // A4 Landscape: 297mm x 210mm with 0 margins
      pdf.addImage(dataUriOrUrl, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
      pdf.save(sanitizedFilename);
      return;
    } catch (e) {
      console.error('jsPDF direct generation error:', e);
    }
  }

  // If it's a PDF URL or file URL, fetch directly as blob and trigger download
  try {
    const res = await fetch(dataUriOrUrl);
    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = sanitizedFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return;
    }
  } catch (err) {
    console.warn('Fetch blob download error, trying direct image/link fallback:', err);
  }

  const link = document.createElement('a');
  link.href = dataUriOrUrl;
  link.download = sanitizedFilename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
