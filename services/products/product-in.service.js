import { BaseCrudService } from "../base-crud.service";
import XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import * as Axios from 'axios';

export default class ProductInService extends BaseCrudService
{
  constructor(token)
  {
    super("product-in-stock", token);
  }

  sortAllProductsInStock(allProductsIn)
  {
    let products = {};

    allProductsIn.forEach(productInStock => {
      if (!products[productInStock.place[0]])
        products[productInStock.place[0]] = [];
        products[productInStock.place[0]].push(productInStock);
    });


    for (let key of Object.keys(products).sort()) {
      // Sort each pack of product out stock sorted by place refcode letter by the number after the first letter
      products[key] = products[key].sort((a,b) => {
        return parseInt(a.place.slice(1)) - parseInt(b.place.slice(1));
      });
    }

    let sortedProducts = [];

    // Merge arrays
    for (let key of Object.keys(products)) {
      // Sort each pack of product out stock sorted by place refcode letter by the number after the first letter
      sortedProducts = sortedProducts.concat(products[key])
    }

    return sortedProducts;
  }

  exportStockToExcelFile()
  {
    return new Promise((resolve, reject) => {
      this.readAll().then(response => {
        let productsIn = response.data.map(productIn => ({  code: productIn.product.refCode,
                                                            product: productIn.product.name,
                                                            brand: productIn.product.brand.name,
                                                            barcode: productIn.product.eanCode,
                                                            carton: productIn.carton.refCode,
                                                            place: productIn.carton.place.refCode,
                                                            quantity: productIn.quantity
                                                      }));
  
        const sheetName = "Wh out list";
        const header = ["Référence",
                        "Produit",
                        "Marque",
                        "Code Barre",
                        "Carton",
                        "Emplacement",
                        "Quantité"];
  
        // Create the new excel workbook
        let wb  = XLSX.utils.book_new();
        wb.Props = {
          Title: "Stock export",
          Subject: "Stock export",
          Author: "MULTI-M",
          CreatedDate: new Date(Date.now())
        };
  
        wb.SheetNames.push(sheetName);
  
        // Create the data array
        let wsData = []
        wsData[0] = header;
    
        this.sortAllProductsInStock(productsIn).forEach((productIn, idx) => {
          wsData[idx + 1] = [
            productIn.code,
            productIn.product,
            productIn.brand,
            productIn.barcode,
            productIn.carton,
            productIn.place,
            productIn.quantity]
        })
  
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        wb.Sheets[sheetName] = ws;
        const wopts = { bookType:'xlsx', bookSST:false, type:'array' };
        const wbout = XLSX.write(wb, wopts);
        saveAs(new Blob([wbout],{type:"application/octet-stream"}), "export-stock.xlsx");
        resolve("Stock exporté avec succès");
      }).catch(e => reject(e));
    });
  }

  exportExcelFile(productsIn, sorted)
  {
    console.log("export excel file")
    const sheetName = "Wh out list";
    const header = ["Référence",
                    "Produit",
                    "Marque",
                    "Code Barre",
                    "Carton",
                    "Emplacement",
                    "Quantité"];

    // Create the new excel workbook
    let wb  = XLSX.utils.book_new();
    wb.Props = {
      Title: "Stock export",
      Subject: "Stock export",
      Author: "MULTI-M",
      CreatedDate: new Date(Date.now())
    };

    wb.SheetNames.push(sheetName);

    // Create the data array
    let wsData = []
    wsData[0] = header;

    this.sortAllProductsInStock(productsIn).forEach((productIn, idx) => {
      wsData[idx + 1] = [
        productIn.code,
        productIn.product,
        productIn.brand,
        productIn.barcode,
        productIn.carton,
        productIn.place,
        productIn.quantity]
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    wb.Sheets[sheetName] = ws;
    const wopts = { bookType:'xlsx', bookSST:false, type:'array' };
    const wbout = XLSX.write(wb, wopts);
    saveAs(new Blob([wbout],{type:"application/octet-stream"}), "export-stock.xlsx");
  }

  filterProductIn(filters)
  {
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
      .setJoin([{field: 'carton'}, {field:'carton.place'}, {field:'product'}, {field:'product.brand'}])
      .setPage(filters.page)

    if (filters.searchTerm)
    {
      console.log(filters.type)
      switch(filters.type)
      {
        case 'product_name':
          qb.setFilter({ field: "product.name", operator: "$cont", value: filters.searchTerm});
        break;
        case 'product_ref':
          qb.setFilter({ field: "product.refCode", operator: "$cont", value: filters.searchTerm});
        break;
        case 'product_brand':
          qb.setFilter({ field: "product.brand.name", operator: "$cont", value: filters.searchTerm});
        break;
        case 'product_ean':
          qb.setFilter({ field: "product.eanCode", operator: "$cont", value: filters.searchTerm});
        break;
        case 'product_place':
          qb.setFilter({ field: "carton.place.refCode", operator: "$cont", value: filters.searchTerm});
        break;
        case 'product_carton':
          qb.setFilter({ field: "carton.refCode", operator: "$cont", value: filters.searchTerm});
        break;

      }
    }

    const queryParams = qb.query();

    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?${queryParams}`, this._headers);
  }
}