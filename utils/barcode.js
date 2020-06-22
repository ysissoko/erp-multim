// Bar code generation
import bwipjs from 'bwip-js';
let jsPDF = null;

if (typeof window !== "undefined") {
  import("jspdf").then(module => {
    jsPDF = module.default;
  });
}

const BARCODE_BAR_H = 10; // in mm
const BARCODE_PER_PAGE = 6;

function exportBarcodesToPdf(barcodesImages)
{
  var doc = new jsPDF({unit: 'px', orientation: 'p'})

  barcodesImages.forEach((barcodeImg, i) => {
    console.log(barcodeImg.height)
    let y = (i%BARCODE_PER_PAGE) * barcodeImg.height;

    if (i>0 && i%BARCODE_PER_PAGE === 0) doc.addPage();

    doc.addImage({imageData: barcodeImg, format: "PNG", x: 0, y: y})
  });

  doc.save('barcodes.pdf')
}

export function generateBarcodesPdf(dataArr)
{
  let barcodesImages = [];

  let canvas = document.createElement('canvas');
  dataArr.forEach((data) => {
    try {
      // The return value is the canvas element
      let barcodeCanvas = bwipjs.toCanvas(canvas, {
              bcid:        'code128',       // Barcode type
              text:        data.toBarcode,  // Text to encode
              scale:       3,               // 3x scaling factor
              height:      BARCODE_BAR_H,       // Bar height, in millimeters
              includetext: true,            // Show human-readable text
              textxalign:  'center',        // Always good to set this
        });

        var barcodeImg = new Image(barcodeCanvas.width, barcodeCanvas.height);
        barcodeImg.src = barcodeCanvas.toDataURL('image/png')
        barcodesImages.push(barcodeImg);
    } catch (e) {
        // `e` may be a string or Error object
        console.log(e)
    }
  });

  exportBarcodesToPdf(barcodesImages);
}