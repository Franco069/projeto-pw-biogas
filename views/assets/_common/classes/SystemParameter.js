export default class SystemParameter {
    constructor(data = {}) {
        this.id = Number(data.id ?? 0);
        this.name = data.name ?? '';
        this.value = Number(data.value ?? 0);
        this.unit = data.unit ?? '';
        this.description = data.description ?? '';
        this.active = Number(data.active ?? 0);
    }
}
