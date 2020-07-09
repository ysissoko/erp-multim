let jsPDF = null;

if (typeof window !== "undefined") {
  import("jspdf").then(module => {
    jsPDF = module.default;
  });
}

const warehouseAddress = [ "Multi-M", "9 rue Jean Jaures", "95670 Marly La Ville", "France"];

export function exportWhOutToPdf(whout)
{

}