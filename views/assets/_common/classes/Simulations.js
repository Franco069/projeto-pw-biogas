import HttpClientBase from '../scripts/HttpClientBase.js';
import SessionStorage from '../scripts/storage.js';

export default class Simulations extends HttpClientBase {
    constructor() { super('http://localhost/projeto-pw-biogas/api'); this.setAuthToken(new SessionStorage().getToken() || ''); }
    list() { return this.get('/simulations/list'); }
    listAdmin() { return this.get('/simulations/admin/list'); }
    find(id) { return this.get('/simulations/list/:simulation_id', { simulation_id: id }); }
    create(data) { return this.postForm('/simulations/', data); }
    delete(id) { return super.delete('/simulations/:simulation_id', { simulation_id: id }); }
}
