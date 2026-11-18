import HttpClientBase from '../scripts/HttpClientBase.js';
import SessionStorage from '../scripts/storage.js';

export default class SystemParameters extends HttpClientBase {
    constructor() { super('http://localhost/projeto-pw-biogas/api'); this.setAuthToken(new SessionStorage().getToken() || ''); }
    list() { return this.get('/system-parameters/list'); }
    update(id, data) { return this.putForm('/system-parameters/:system_parameter_id', data, { system_parameter_id: id }); }
}
