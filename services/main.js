// Cartons related services
import CartonInService from "./cartons/carton-in.service"
import CartonOutService from "./cartons/carton-out.service"
import PlaceService from "./cartons/place.service"

// Warehouse operations services
import ProviderService from "./operations/provider.service"
import WhInOpService from "./operations/wh-in-op.service"
import WhOutOpService from "./operations/wh-out-op.service"
import WhMovOpService from "./operations/wh-mov-op.service"

// Products
import BrandService from "./products/brand.service"
import ProductInService from "./products/product-in.service"
import ProductOutService from "./products/product-out.service"
import ProductService from "./products/product.service"
import AuthService from "./auth.service"

console.log(`Service API endpoint for ${process.env.NODE_ENV} is ${process.env.NEXT_PUBLIC_BASE_API_URL}`);

export {
  CartonInService,
  CartonOutService,
  PlaceService,
  ProviderService,
  WhInOpService,
  WhOutOpService,
  WhMovOpService,
  BrandService,
  ProductInService,
  ProductOutService,
  ProductService,
  AuthService,
}