import api from './api';

export default class ProductService {

    getProductsSmall() {
		return api.get('assets/layout/data/products-small.json').then(res => res.data.data);
	}

	getProducts() {
		return api.get('assets/layout/data/products.json').then(res => res.data.data);
    }

    getProductsWithOrdersSmall() {
		return api.get('assets/layout/data/products-orders-small.json').then(res => res.data.data);
	}
}
