import { BaseCrudService } from "../base-crud.service";
import XLSX from 'xlsx';
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import * as Axios from 'axios';

export default class ProductService extends BaseCrudService
{
  constructor(token)
  {
    super("product", token);
  }

  checkProductValid(product)
  {
    return (product.name !== "" && product.brand !== "" && product.eanCode !== "" && product.refCode !== "" && product.eanCode.length === 13)
  }

  importExcelFile(file)
  {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();

      fileReader.onload = (e) => {

        let workbook  = XLSX.read(e.target.result, {type:"binary"});
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let productsToCreate = [];
        // Errors if empty cell is encountered
        let errorLines = [];
        console.log(workbook.SheetNames[0]);
        let productsCatalogArr = XLSX.utils.sheet_to_json(sheet, {header: 1, range: 1});
        console.log(`${productsCatalogArr.length} products to import to the database`);

        productsCatalogArr.forEach((product, index) => {
          //console.log(product)
          // Expected 4 columns : name, brand, barcode and reference
          if (product.length >= 4)
          {
            let productToCreate = {
                                  name: (product[0]) ? product[0].toString().trim() : "",
                                  brand: (product[1]) ? product[1].toString().trim() : "",
                                  eanCode: (product[2]) ? product[2].toString().trim() : "",
                                  refCode: (product[3]) ? product[3].toString().trim() : ""
                                }

            if (this.checkProductValid(productToCreate))
              productsToCreate.push(productToCreate);
            else
              // row starts at index 1 and we skip the header so to have the correct line number, we need to add 2
              errorLines.push(index + 2);
          }
        })

        if (errorLines.length === 0)
        {
          const chunkSize = 50;
          let promises = [];
          console.log("loading ...");
          let totalProducts = 0;

          for (let i=0, hasErrors = false; i < productsToCreate.length && !hasErrors; i += chunkSize)
          {
                  const endSlice = i + chunkSize < productsToCreate.length ? i + chunkSize :  productsToCreate.length;
                  const arrayToPush = productsToCreate.slice(i, endSlice);
                  const promise = Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/catalog/import`, arrayToPush, this._headers);

                  promise.then((success) => {
                    totalProducts += chunkSize;
                    console.log("total produit importés" + totalProducts);
                    console.log(`Importation ${Math.round(totalProducts * 100 / productsToCreate.length) } %`);
                  }).catch(error => {
                    reject(error);
                    hasErrors = true;
                  });

                  promises.push(promise);
          }

        Promise.all(promises).then((success) => {
            console.log("Excel file import success");
            resolve(success.data);
          }, (error) => {
            reject(error);
          });
        }
        else {
          reject(new Error(`Error importing excel files. Errors encountered on lines ${errorLines}`));
        }


      fileReader.onabort = () => reject(new Error("[FileReader] Excel file read aborted"));
      fileReader.onerror = () => reject(new Error("[FileReader] Error loading excel file"));
    }

    fileReader.readAsBinaryString(file)
  })
  }

  filterProduct(filters)
  {
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
      .setJoin([{field:'product'}, {field:'product.brand'}])
      .setPage(filters.page)

    if (filters.searchTerm)
    {
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
      }
    }

    const queryParams = qb.query();

    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?${queryParams}`, this._headers);
  }
}