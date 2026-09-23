import jsPDF from 'jspdf';

/**
 * Instantly download crisp print-ready A4 landscape PDF directly in client browser
 * 0 Server Load, 0 Memory Leak, 0 Gateway Timeout, 100% Instant Delivery
 */
export const downloadPdfFromImage = (dataUriOrUrl, filename = 'Certificate.pdf') => {
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

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1123;
      canvas.height = img.naturalHeight || 794;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUri = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      pdf.addImage(dataUri, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
      pdf.save(sanitizedFilename);
    } catch (err) {
      window.open(dataUriOrUrl, '_blank');
    }
  };
  img.onerror = () => {
    window.open(dataUriOrUrl, '_blank');
  };
  img.src = dataUriOrUrl;
};
