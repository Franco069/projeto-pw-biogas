const FormController = {
    init(form) {
        this.form = form;
        return this;
    },

    serialize() {
        const formData = new FormData(this.form);
        const data = {};

        formData.forEach(function (value, key) {
            data[key] = value;
        });

        return data;
    },

    clear() {
        this.form.reset();
    }
};

export default FormController;