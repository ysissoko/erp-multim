import { BaseCrudService } from "../base-crud.service";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import * as Axios from 'axios';
export default class WhMovOpService extends BaseCrudService
{
  constructor(token)
  {
    super("wh-mov-op", token);
  }

  filterHistory(filters)
  {
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
      .setJoin([{field: 'oldPlace'}, {field:'newPlace'}, {field:'carton'}, {field:'product.brand'}])
      .setPage(filters.page)

    if (filters.searchTerm)
    {
      switch(filters.type)
      {
        case 'whmov_ref':
          qb.setFilter({ field: "refCode", operator: "$cont", value: filters.searchTerm});
        break;
        case 'whmov_carton':
          qb.setFilter({ field: "carton.refCode", operator: "$cont", value: filters.searchTerm});
        break;
        case 'whmov_old_place':
          qb.setFilter({ field: "oldPlace.refCode", operator: "$cont", value: filters.searchTerm});
        break;
        case 'whmov_new_place':
          qb.setFilter({ field: "newPlace.refCode", operator: "$cont", value: filters.searchTerm});
        break;
      }
    }
    
    const queryParams = qb.query();

    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?${queryParams}`, this._headers);
  }
}