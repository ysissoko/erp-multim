import { BaseCrudService } from "../base-crud.service";

export default class ProductOutService extends BaseCrudService
{
  constructor(token)
  {
    super("product-out", token);
  }
}