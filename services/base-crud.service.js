import * as Axios from 'axios';

export class BaseCrudService{

  constructor(baseUrl, jwtToken)
  {
    this._baseUrl = baseUrl;
    this._headers = { headers: {Authorization: `Bearer ${jwtToken}`} };
  }

  create(newEntity)
  {
    return Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}`, newEntity, this._headers);
  }

  createBulk(entities)
  {
    return Axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/bulk`, {bulk: entities}, this._headers);
  }

  read(entityId, queryParams)
  {
    let url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/${entityId}`;

    if (queryParams)
      url = `${url}?${queryParams}`;

    return Axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/${entityId}`, this._headers);
  }

  readDataPages(page, maxPerPage, queryParams)
  {
    let url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}?page=${page}&limit=${maxPerPage}`;

    if (queryParams)
      url = `${url}&${queryParams}`;
      
    return Axios.get(url, this._headers);
  }

  readAll(queryParams)
  {
    let url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}`;

    if (queryParams)
      url = `${url}?${queryParams}`;

    return Axios.get(url, this._headers);
  }

  update(entityId, updateData)
  {
    return Axios.patch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/${entityId}`, updateData, this._headers);
  }

  delete(entityId)
  {
    return Axios.delete(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${this._baseUrl}/${entityId}`, this._headers);
  }
}