import { BaseCrudService } from "../base-crud.service";
import XLSX from 'xlsx';
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import * as Axios from 'axios';
export default class PlaceService extends BaseCrudService
{
  constructor(token)
  {
    super("place", token);
  }

  importExcelFile(file)
  {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();

      fileReader.onload = (e) => {

        let workbook  = XLSX.read(e.target.result, {type:"binary"});
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let placesToCreate = [];
        let placesArr = XLSX.utils.sheet_to_json(sheet, {header: 1});
        console.log(`${placesArr.length} places to import to the database`);

        placesArr.forEach((place) => {
          if (place.length >= 1)
          {
            let placeToCreate = { refCode: place[0] }
            placesToCreate.push(placeToCreate);
          }
        })

        this.createBulk(placesToCreate).then((result) => {
          resolve(result);
        }, error => {
          console.log(error)
          reject(error);
        })
    }

    fileReader.onabort = () => reject(new Error("[FileReader] Excel file read aborted"));
    fileReader.onerror = () => reject(new Error("[FileReader] Error loading excel file"));
    fileReader.readAsBinaryString(file)
  })
  }

  filterPlace(filters)
  {
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
      .setPage(filters.page)

    if (filters.searchTerm)
    {
      qb.setFilter({ field: "refCode", operator: "$cont", value: filters.searchTerm });
    }

    const queryParams = qb.query();

    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?${queryParams}`, this._headers);
  }
}