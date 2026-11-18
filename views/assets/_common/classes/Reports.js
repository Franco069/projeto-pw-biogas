import HttpClientBase from '../scripts/HttpClientBase.js';
import SessionStorage from '../scripts/storage.js';

export default class Reports extends HttpClientBase {
    constructor() { super('http://localhost/projeto-pw-biogas/api'); this.setAuthToken(new SessionStorage().getToken() || ''); }
    list() { return this.get('/reports/list'); }
    listAdmin() { return this.get('/reports/admin/list'); }
    create(data) { return this.postForm('/reports/', data); }
}
