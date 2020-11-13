import { BaseCrudService } from "../base-crud.service";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import * as Axios from 'axios';

export default class WhInOpService extends BaseCrudService
{
  constructor(token)
  {
    super("wh-in-op", token);
  }

  getWhInInfo(refCode)
  {
    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/ref/${refCode}`, this._headers)
  }

  filterWhIn(filters)
  {
    console.log(filters)
    const qb = RequestQueryBuilder.create();
    qb.setLimit(filters.limit)
      .setPage(filters.page);

    let isSearchTerm = false;
    
    if (filters.searchTerm)
    {
      isSearchTerm = true;
      qb.setFilter({ field: "refCode", operator: "$cont", value: filters.searchTerm })
    }

    let isDateRange = false;
    
    if (filters.dateRange)
    {
      isDateRange = true;

      const dateRangeField = { field: "createdAt", operator: "$between", value: filters.dateRange };
      qb.setFilter(dateRangeField);
    }
    
    if (filters.statusTags && filters.statusTags.length > 0)
    {
      let statusTags = [];
      
      for (let i = 0; i < filters.statusTags.length; ++i)
      {
        switch(filters.statusTags[i])
        {
          case "à réceptionner":
            statusTags.push("todo");
          break;
          case "en cours":
            statusTags.push("inprogress");
          break;
          case "terminée":
            statusTags.push(value);
          break;
        }
      }

      if (statusTags.length > 0)
        qb.setFilter({field: "status", operator: '$in', value: statusTags})
    }
      
    const queryParams = qb.query();

    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?${queryParams}`, this._headers);
  }
}