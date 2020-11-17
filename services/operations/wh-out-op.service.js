import { BaseCrudService } from "../base-crud.service";
import XLSX from 'xlsx';
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import * as Axios from 'axios';
import { saveAs } from 'file-saver';

export default class WhOutOpService extends BaseCrudService
{
  constructor(token)
  {
    super("wh-out-op", token);
  }

  checkOrderValid(order)
  {
    return true;
  }

  checkProductValid(product)
  {
    return true;
  }

  getWhOutInfo(refCode)
  {
    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/ref/${refCode}`, this._headers);
  }

  sortAllProductsOutStock(allProductsOut)
  {
    let products = {};

    allProductsOut.forEach(productOutStock => {
      if (!products[productOutStock.cartonIn.place.refCode[0]])
        products[productOutStock.cartonIn.place.refCode[0]] = [];

        products[productOutStock.cartonIn.place.refCode[0]].push(productOutStock);
    });


    for (let key of Object.keys(products).sort()) {
      // Sort each pack of product out stock sorted by place refcode letter by the number after the first letter
      products[key] = products[key].sort((a,b) => {
        return parseInt(a.cartonIn.place.refCode.slice(1)) - parseInt(b.cartonIn.place.refCode.slice(1));
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

  async exportWhOutClassicToExcel(whOutClassic)
  {
    console.log("export classic whout");
    console.log(whOutClassic)
    // Récupération des détails ddu  whout classic

    const result = await Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/classic/${whOutClassic.refCode}/info`, this._headers);
    console.log(result)
    const whOutClassicToExport = result.data;

    const sheetName = "Wh out classic";
    const header = ["Order No",
                    "Command Number",
                    "Customer Name",
                    "Street 1",
                    "City",
                    "Country",
                    "Phone Number"];

        // Create the new excel workbook
        let wb  = XLSX.utils.book_new();
        wb.Props = {
          Title: "Warehouse out classic export",
          Subject: "WHOUT classic export",
          Author: "MULTI-M",
          CreatedDate: new Date(Date.now())
        };

        wb.SheetNames.push(sheetName);

        let wsData = [];
        wsData[0] = header;


        wsData[1] = [
          whOutClassic.refCode,
          whOutClassic.orderNum,
          whOutClassic.clientName,
          whOutClassic.clientAddress,
          whOutClassic.clientCity,
          whOutClassic.clientCountry,
          whOutClassic.clientTel,
        ]

        wsData[2] = [
          "Product reference",
          "EAN",
          "Carton IN",
          "Carton OUT",
          "Quantity scanned",
          "Quantity to scan",
        ]

        for (let cartonOut of whOutClassicToExport.cartonsOut)
        {
          for (let i=0;  i < cartonOut.productsOutClassic.length; ++i)
          {
            const productOutClassic = cartonOut.productsOutClassic[i];
            const productOutStock = whOutClassicToExport.productsOutStock.find(productOutStock => productOutStock.id === productOutClassic.productOutStock.id)
            
            wsData[3+i] = [
              productOutStock.product.refCode,
              productOutStock.product.eanCode,
              productOutStock.cartonIn.refCode,
              cartonOut.refCode,
              productOutClassic.quantity,
              productOutStock.quantityNeeded,
            ]
          }
        }

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        wb.Sheets[sheetName] = ws;
        const wopts = { bookType:'xlsx', bookSST:false, type:'array' };
        const wbout = XLSX.write(wb, wopts);
        saveAs(new Blob([wbout],{type:"application/octet-stream"}), "export-wh-out-classic.xlsx");
  }

  async exportExcelFile(whOutOps, sorted=true)
  {
    const refCodes = whOutOps.map(whOutOp => whOutOp.refCode);
    const result = await Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/export/info`, {refCodes: refCodes}, this._headers);    console.log("export excel file")
    
    if (result && result.status === 201)
    {
      const whOutToExport = result.data;
      console.log(whOutToExport)
      const sheetName = "Wh out list";
      const header = ["Order No",
                      "Command Number",
                      "Customer Name",
                      "Street 1",
                      "Street 2",
                      "City",
                      "Country",
                      "Phone Number",
                      "Product Name",
                      "Quantity",
                      "Barcode",
                      "Carton Number",
                      "Place"];

      // Create the new excel workbook
      let wb  = XLSX.utils.book_new();

      wb.Props = {
        Title: "Warehouse out export",
        Subject: "WHOUT export",
        Author: "MULTI-M",
        CreatedDate: new Date(Date.now())
      };

      wb.SheetNames.push(sheetName);

      // Create the data array
      let wsData = []
      wsData[0] = header;
      let allProductsOut = [];

      whOutToExport.sort((a, b) => {
        return a.createdAt - b.createdAt;
      }).forEach((whOutOp) => {
        allProductsOut = allProductsOut.concat(whOutOp.productsOutStock.map(productOutStock => ({...productOutStock, whOutOp: whOutOp})));
      });

      if (sorted)
        allProductsOut = this.sortAllProductsOutStock(allProductsOut);

      allProductsOut.forEach((productOutStock, idx) => {
        wsData[idx + 1] = [
          productOutStock.whOutOp.refCode,
          productOutStock.whOutOp.orderNum,
          productOutStock.whOutOp.clientName,
          productOutStock.whOutOp.clientAddress,
          productOutStock.whOutOp.clientPostalCode,
          productOutStock.whOutOp.clientCity,
          productOutStock.whOutOp.clientCountry,
          productOutStock.whOutOp.clientTel,
          productOutStock.product.refCode,
          productOutStock.quantityNeeded,
          productOutStock.product.eanCode,
          productOutStock.cartonIn.refCode,
          productOutStock.cartonIn.place.refCode]
      })

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      wb.Sheets[sheetName] = ws;
      const wopts = { bookType:'xlsx', bookSST:false, type:'array' };
      const wbout = XLSX.write(wb, wopts);
      saveAs(new Blob([wbout],{type:"application/octet-stream"}), "export-wh-out.xlsx");
    }
  }

  exportMissingDeliveries(deliveries)
  {
    console.log("export excel file")
    const sheetName = "Wh out export list";
    const header = ["Donneur Ordre Entete",
                    "Destinataire",
                    "Adresse",
                    "CP",
                    "Ville",
                    "Pays",
                    "TEL",
                    "Date Commande",
                    "Code Article",
                    "Quantité",];

    // Create the new excel workbook
    let wb  = XLSX.utils.book_new();
    wb.Props = {
      Title: "Missing warehouse out export",
      Subject: "Missing WHOUT export",
      Author: "MULTI-M",
      CreatedDate: new Date(Date.now())
    };

    wb.SheetNames.push(sheetName);

    // Create the data array
    let wsData = []
    wsData[0] = header;

    const addLeadingZero = (d) => {
      return (d < 10) ? `0${d}` : d;
    };

    deliveries.forEach((delivery, idx) => {
      let date = new Date(delivery.orderDate);

      delivery.products.map(product => {
        wsData[idx + 1] = [
          delivery.orderNum,
          delivery.clientName,
          delivery.address,
          delivery.postalCode,
          delivery.clientCity,
          delivery.clientCountry,
          delivery.clientTel,
          `${date.getFullYear()}${addLeadingZero(date.getMonth() + 1)}${addLeadingZero(date.getDate())}`,
          product.refCode,
          product.quantity];
      })
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    wb.Sheets[sheetName] = ws;
    const wopts = { bookType:'xlsx', bookSST:false, type:'array' };
    const wbout = XLSX.write(wb, wopts);
    saveAs(new Blob([wbout],{type:"application/octet-stream"}), "export-missing-wh-out.xlsx");
  }

  exportMissingProductsForDelivery(delivery)
  {
    console.log("export excel file")
    const sheetName = "Wh out export list";
    const header = ["Donneur Ordre Entete",
                    "Destinataire",
                    "Adresse",
                    "CP",
                    "Ville",
                    "Pays",
                    "TEL",
                    "Date Commande",
                    "Code Article",
                    "Quantité",];

    // Create the new excel workbook
    let wb  = XLSX.utils.book_new();

    wb.Props = {
      Title: "Missing warehouse out classic export",
      Subject: "Missing WHOUT classic export",
      Author: "MULTI-M",
      CreatedDate: new Date(Date.now())
    };

    wb.SheetNames.push(sheetName);

    // Create the data array
    let wsData = []
    wsData[0] = header;

    const addLeadingZero = (d) => {
      return (d < 10) ? `0${d}` : d;
    };

    const date =  new Date(delivery.orderDate);
    delivery.products.map((product, idx) => {
      wsData[idx + 1] = [
        (idx===0) ? delivery.orderNum : "",
        (idx===0) ? delivery.clientName : "",
        (idx===0) ? delivery.address : "",
        (idx===0) ? delivery.postalCode : "",
        (idx===0) ? delivery.clientCity : "",
        (idx===0) ? delivery.clientCountry : "",
        (idx===0) ? delivery.clientTel : "",
        (idx===0) ? `${date.getFullYear()}${addLeadingZero(date.getMonth() + 1)}${addLeadingZero(date.getDate())}` : "",
        product.refCode,
        product.quantity];
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    wb.Sheets[sheetName] = ws;
    const wopts = { bookType:'xlsx', bookSST:false, type:'array' };
    const wbout = XLSX.write(wb, wopts);
    saveAs(new Blob([wbout],{type:"application/octet-stream"}), "export-missing-wh-out-classic.xlsx");
  }

  importClassicDeliveriesExcelFile(file)
  {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();

      fileReader.onload = (e) => {
        let workbook  = XLSX.read(e.target.result, {type:"binary"});
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        // Errors if empty cell is encountered
        let errorLines = [];

        let ordersFileArr = XLSX.utils.sheet_to_json(sheet, {header: 1, range: 1});
        console.log(`${ordersFileArr.length} lines in the order file to import to the database`);

        let date = undefined;

        // Date parsing
        if (ordersFileArr[0][7])
        {
          let dateStr = ordersFileArr[0][7].toString();
          let year = dateStr.slice(0, 4);
          let month = dateStr.slice(4, 6);
          let day = dateStr.slice(6, 8);

          date = new Date(`${year}-${month}-${day}`);
        }

        // Create the order object
        let orderToCreate = {
          orderNum: (ordersFileArr[0][0]) ? ordersFileArr[0][0].toString().trim() : "",
          clientName: (ordersFileArr[0][1]) ? ordersFileArr[0][1].toString().trim() : "",
          address: (ordersFileArr[0][2]) ? ordersFileArr[0][2].toString().trim() : "",
          postalCode: (ordersFileArr[0][3]) ? ordersFileArr[0][3].toString().trim() : "",
          clientCity: (ordersFileArr[0][4]) ? ordersFileArr[0][4].toString().trim() : "",
          clientCountry: (ordersFileArr[0][5]) ? ordersFileArr[0][5].toString().trim() : "",
          clientTel: (ordersFileArr[0][6]) ? ordersFileArr[0][6].toString().trim() : "",
          orderDate: date,
          products: []
        }

        ordersFileArr.forEach((row, index) => {
          // Expected 4 columns : name, brand, barcode and reference
          if (row[8] && row[9])
          {
            const refCode = row[8].toString().trim();
            const quantity = parseInt(row[9]);

            if (quantity > 0 && refCode != "")
            {

              //Index du produit
              const idx = orderToCreate.products.findIndex((product) => product.refCode == refCode)

              // > -1 si le produit est présent dans la liste de produits
              if (idx > -1)
              {
                // Mis à jour de la quantité du produit si la référence est déjà présente
                orderToCreate.products[idx].quantity += quantity;
              }
              else
              {
                // Sinon ajout du nouveau produit
                const productToAdd = {refCode: refCode, quantity: quantity};
                orderToCreate.products.push(productToAdd);
              }
            }
          }
        });

        if (errorLines.length === 0)
        {

          // Il n'y a pas d'erreur
          const chunkSize = 50;
          let totalProductImported = 0;
          const numTotalProducts = orderToCreate.products.length;
          let promises = [];

          for (let i=0, hasErrors = false; i < numTotalProducts && !hasErrors; i += chunkSize)
          {
              const endSlice = i + chunkSize < numTotalProducts ? i + chunkSize :  numTotalProducts;
              const arrayToPush = orderToCreate.products.slice(i, endSlice);

              const promise = Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/import/classic`, {...orderToCreate, products: arrayToPush}, this._headers);

              promise.then((success) => {
                totalProductImported += chunkSize;
                console.log("produits importés" + totalProductImported);
                console.log(`Importation ${Math.round(totalProductImported * 100 / numTotalProducts) } %`);
              }).catch(error => {
                reject(error);
                hasErrors = true;
              });

              promises.push(promise);
          }

        let productsNotImported = [];
        Promise.all(promises).then((respArr) => {
            console.log("*Excel file import success*");
            for (let resp of respArr)
              productsNotImported = productsNotImported.concat(resp.data)

            resolve({...orderToCreate, productsNotImported});
          }, (error) => {
            reject(error);
          });
        }
        else {
          reject(new Error(`Error importing excel files. Errors encountered on lines ${errorLines}`));
        }
      }

      fileReader.onabort = () => reject(new Error("[FileReader] Excel file read aborted"));
      fileReader.onerror = () => reject(new Error("[FileReader] Error loading excel file"));

      fileReader.readAsBinaryString(file)
    })
  }

  importDeliveriesFromExcelFile(file)
  {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();

      fileReader.onload = (e) => {
        let workbook  = XLSX.read(e.target.result, {type:"binary"});
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let ordersToCreate = [];
        // Errors if empty cell is encountered
        let errorLines = [];

        let ordersFileArr = XLSX.utils.sheet_to_json(sheet, {header: 1, range: 1});
        console.log(`${ordersFileArr.length} lines in the order file to import to the database`);

        ordersFileArr.forEach((row, index) => {
          //console.log(product)
          // Expected 4 columns : name, brand, barcode and reference
          if (row.length >= 10)
          {
            const orderIdx = ordersToCreate.findIndex((order) =>  order.orderNum === row[0] );
            // Check if order has already been added (duplicate row in the excel file)
            let orderExist =  orderIdx != -1;
            // Create the new product to add to the order object
            const productToAdd = {refCode: (row[8]) ? row[8].trim() : "", quantity: (row[9]) ? row[9] : 0}

            // If the order No is not already registered
            if (!orderExist)
            {
              let date = undefined;

              // Date parsing
              if (row[7])
              {
                let dateStr = row[7].toString();
                let year = dateStr.slice(0, 4);
                let month = dateStr.slice(4, 6);
                let day = dateStr.slice(6, 8);

                date = new Date(`${year}-${month}-${day}`);
              }

              // Create the order object
              let orderToCreate = {
                orderNum: (row[0]) ? row[0].toString().trim() : "",
                clientName: (row[1]) ? row[1].toString().trim() : "",
                address: (row[2]) ? row[2].toString().trim() : "",
                postalCode: (row[3]) ? row[3].toString().trim() : "",
                clientCity: (row[4]) ? row[4].toString().trim() : "",
                clientCountry: (row[5]) ? row[5].toString().trim() : "",
                clientTel: (row[6]) ? row[6].toString().trim() : "",
                orderDate: date,
                products: []
              }

              if (this.checkOrderValid(orderToCreate) && this.checkProductValid(productToAdd))
              {
                orderToCreate.products.push(productToAdd);
                ordersToCreate.push(orderToCreate);
              }
              else
                // row starts at index 1 and we skip the header so to have the correct line number, we need to add 2
                errorLines.push(index + 2);
            }
            else {
              // Else add the product to the existing order if it is valid
              if (this.checkProductValid(productToAdd))
                ordersToCreate[orderIdx].products.push(productToAdd);
              else
                // row starts at index 1 and we skip the header so to have the correct line number, we need to add 2
                errorLines.push(index + 2);
            }
          }
        })

        if (errorLines.length === 0)
        {
          const chunkSize = 3;
          let totalOrders = 0;
          let promises = [];

          for (let i=0, hasErrors = false; i < ordersToCreate.length && !hasErrors; i += chunkSize)
          {
              const endSlice = i + chunkSize < ordersToCreate.length ? i + chunkSize :  ordersToCreate.length;
              const arrayToPush = ordersToCreate.slice(i, endSlice);

              const promise = Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/import`, arrayToPush, this._headers);

              promise.then((success) => {
                totalOrders += chunkSize;
                console.log("total whout importés" + totalOrders);
                console.log(`Importation ${Math.round(totalOrders * 100 / ordersToCreate.length) } %`);
              }).catch(error => {
                reject(error);
                hasErrors = true;
              });

              promises.push(promise);
          }

        let whoutNotImported = [];
        Promise.all(promises).then((respArr) => {
            console.log("*Excel file import success*");
            for (let resp of respArr)
              whoutNotImported = whoutNotImported.concat(resp.data)
            resolve(whoutNotImported);
          }, (error) => {
            reject(error);
          });
        }
        else {
          reject(new Error(`Error importing excel files. Errors encountered on lines ${errorLines}`));
        }
      }

      fileReader.onabort = () => reject(new Error("[FileReader] Excel file read aborted"));
      fileReader.onerror = () => reject(new Error("[FileReader] Error loading excel file"));

      fileReader.readAsBinaryString(file)
    })
  }

  filterWhOut(filters)
  {
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
      .setPage(filters.page)
      .setJoin({field: 'batch'});

    let isSearchTerm = false;
    
    if (filters.searchTerm)
    {
      switch (filters.type)
      {
        case 'whout_ref':
          qb.setFilter({ field: "refCode", operator: "$cont", value: filters.searchTerm });
          break;
        case 'whout_orderno':
          qb.setFilter({ field: "orderNum", operator: "$cont", value: filters.searchTerm });
          break;
        case 'whout_batch':
          qb.setFilter({ field: "batch.refCode", operator: "$cont", value: filters.searchTerm });
          break;
      }
    }
    
    if (filters.dateRange)
    {
      const dateRangeField = { field: "createdAt", operator: "$between", value: filters.dateRange };
      qb.setFilter(dateRangeField);
    }

    // Filtre par type de whout
    
    if (filters.statusTags && filters.statusTags.length > 0)
    {
      let statusTags = []
      let typesTags = [];

      for (let i = 0, j=0; i < filters.statusTags.length; ++i)
      {
        switch(filters.statusTags[i])
        {
          case "à préparer":
            statusTags.push("todo");
          break;
          case "en cours":
            statusTags.push("inprogress");
          break;
          case "terminée":
            statusTags.push("done");
          break;
          case "dropshipping":
            typesTags.push("dropshipping");
          break;
          case "classic":
            typesTags.push("classic");
          break;
        }
      }

      if (statusTags.length > 0)
        qb.setFilter({field: 'status', operator: '$in', value: statusTags})
      if (typesTags.length > 0)
        qb.setFilter({field: 'type', operator: '$in', value: typesTags})
  }

  const queryParams = qb.query();
  return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?${queryParams}`, this._headers);
}
}