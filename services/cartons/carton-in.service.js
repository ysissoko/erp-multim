import { BaseCrudService } from "../base-crud.service";
import * as Axios from 'axios';
import { RequestQueryBuilder } from "@nestjsx/crud-request";

export default class CartonInService extends BaseCrudService
{
  constructor(token)
  {
    super("carton-in", token);
  }

  createBulkCartons(numCartons, whInId)
  {
    return Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/create/bulk`, {numCartons: numCartons, whOpId: whInId}, this._headers)
  }

  getCartonInInfo(refCode)
  {
    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/content/${refCode}`, this._headers);
  }

  getCartonInHistory(refCode)
  {
    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/${refCode}/history`, this._headers);
  }

  filterCartonsIn(filters)
  {
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
    .setPage(filters.page)
    .setJoin([{field: "whInOp"}, {field: "place"}])
    
    let isSearchTerm = false;

    if (filters.searchTerm && filters.searchTerm != "")
    {
      isSearchTerm = true;

      switch (filters.type)
      {
        case 'carton_ref':
          qb.setFilter({ field: "refCode", operator: "$cont", value: filters.searchTerm })
        break;
        case 'carton_whin':
          qb.setFilter({ field: "whInOp.refCode", operator: "$cont", value: filters.searchTerm })
        break;
        case 'carton_place':
          qb.setFilter({ field: "place.refCode", operator: "$cont", value: filters.searchTerm })
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