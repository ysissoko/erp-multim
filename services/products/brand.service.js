import { BaseCrudService } from "../base-crud.service";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import * as Axios from 'axios';
export default class BrandService extends BaseCrudService{
  constructor(token)
  {
    super("brand", token);
  }

  filterBrand(filters)
  {
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
      .setPage(filters.page)

    if (filters.searchTerm)
    {
      qb.setFilter({ field: "name", operator: "$cont", value: filters.searchTerm });
    }
    
    const queryParams = qb.query();

    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?${queryParams}`, this._headers);
  }
}