import { BaseCrudService } from "../base-crud.service";
import * as Axios from 'axios';
import { RequestQueryBuilder } from "@nestjsx/crud-request";

export default class CartonOutService extends BaseCrudService
{
  constructor(token)
  {
    super("carton-out", token);
  }

  createBulkCartons(numCartons, whOutId)
  {
    return Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/create/bulk`, {numCartons: numCartons, whOpId: whOutId}, this._headers)
  }

  getCartonOutInfo(refCode)
  {
    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/content/${refCode}`, this._headers);
  }

  filterCartonsOut(filters)
  {
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
    .setPage(filters.page)
    .setJoin({field: 'whOutOp'})

    let isSearchTerm = false;

    if (filters.searchTerm)
    {
      isSearchTerm = true;

      switch(filters.type)
      {
        case 'cartonout_ref':
          qb.setFilter({ field: "refCode", operator: "$cont", value: filters.searchTerm })
          break;
        case 'cartonout_whout':
          qb.setFilter({ field: "whOutOp.refCode", operator: "$cont", value: filters.searchTerm })
          break;
      }
    }

    // si les statut ne sont pas tous cochés (length=2) ou si rien n'est coché (length=0) on a rien a faire
    // Sinon
    if (filters.tagFilters && filters.tagFilters.length === 1)
    {
      // si il y a un search term on ajoute un or
      if (isSearchTerm)
        qb.setOr({ field: "scanned", operator: "$eq", value: (filters.tagFilters[0] === 'enregistré') ? true : false})
      else
        qb.setFilter({ field: "scanned", operator: "$eq", value: (filters.tagFilters[0] === 'enregistré') ? true : false})
    }
    
    const queryParams = qb.query();

    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?${queryParams}`, this._headers);
  }
}