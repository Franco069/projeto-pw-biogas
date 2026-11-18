import HttpClientBase from '../scripts/HttpClientBase.js';
import SessionStorage from '../scripts/storage.js';

export default class ProductImages extends HttpClientBase {
    constructor() {
        super('http://localhost/projeto-pw-biogas/api');
        this.setAuthToken(new SessionStorage().getToken() || '');
    }

    list(productId) {
        return this.get('/products/:product_id/images', { product_id: productId });
    }

    upload(productId, image, altText = '') {
        const data = new FormData();
        data.append('image', image);
        data.append('alt_text', altText);
        return this.postForm('/products/:product_id/images', data, { product_id: productId });
    }

    delete(productId, imageId) {
        return super.delete('/products/:product_id/images/:image_id', {
            product_id: productId,
            image_id: imageId
        });
    }
}
