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

  // Font size and type for additionnal text above barcode
  doc.setFontType("bold");
  doc.setFontSize(9);

  barcodesImages.forEach((barcodeImg, i) => {
    if (i>0 && i%BARCODE_PER_PAGE === 0) {
      doc.addPage();
    }
    let y = (i%BARCODE_PER_PAGE) * barcodeImg.img.height;

    console.log(y)
    if (barcodeImg.additionnalTxt)
      doc.text(barcodeImg.additionnalTxt, 5, y + 5)

    doc.addImage({imageData: barcodeImg.img, format: "PNG", x: 5, y: y+15})
  });

  doc.save('barcodes.pdf')
}

export function generateBarcodesPdf(dataArr)
{
  let barcodesImages = [];

  dataArr.forEach((data) => {
    try {
      let canvas = document.createElement('canvas');

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
        barcodesImages.push({img: barcodeImg, additionnalTxt: data.additionnalTxt});
    } catch (e) {
        // `e` may be a string or Error object
        console.log(e)
    }
  });

  exportBarcodesToPdf(barcodesImages);
}