using { rwt.etp as my } from '../db/Schema';

service CatalogService {
entity Products as projection on my.ProductInfo;
}