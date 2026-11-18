import Users from "../../_common/classes/Users.js";
import SessionStorage from "../../_common/scripts/storage.js";

import Toast from "../../_common/prototypes/Toast.js";
import FormController from "../../_common/prototypes/FormController.js";

const users = new Users();
const storage = new SessionStorage();

const publicToast = Object.create(Toast);

const loginForm = Object.create(FormController);
const registerForm = Object.create(FormController);

const loginFormElement =
    document.querySelector("#login-form");

const registerFormElement =
    document.querySelector("#register-form");


async function handleLogin(event) {
    event.preventDefault();

    const data = loginForm.serialize();

    try {
        const result = data.admin ? await users.loginAdminFromForm(loginFormElement) : await users.login(
            data.email,
            data.password
        );

        if (result?.status !== "success") {
            publicToast.error(
                result?.message ||
                "Não foi possível realizar o login."
            );

            return;
        }

        const token = result.data?.token;

        if (!token) {
            publicToast.error(
                "Login realizado, mas o token não foi recebido."
            );

            return;
        }

        storage.saveSession(
            token,
            result.data
        );

        publicToast.success(
            result.message ||
            "Login realizado com sucesso."
        );

        const typeId =
            Number(result.data?.type_id);

        setTimeout(() => {
            if (typeId === 1) {
                window.location.href =
                    "../../admin/pages/dashboard.html";
                return;
            }

            if (typeId === 2) {
                window.location.href =
                    "../../app/pages/dashboard.html";
                return;
            }

            publicToast.error(
                "Tipo de usuário inválido."
            );
        }, 500);

    } catch (error) {
        console.error(error);

        publicToast.error(
            "Não foi possível conectar com o servidor."
        );
    }
}


async function handleRegister(event) {
    event.preventDefault();

    const data = registerForm.serialize();

    try {
        const result =
            await users.register(data);

        if (result?.status !== "success") {
            publicToast.error(
                result?.message ||
                "Não foi possível realizar o cadastro."
            );

            return;
        }

        publicToast.success(
            result.message ||
            "Usuário cadastrado com sucesso."
        );

        registerForm.clear();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

    } catch (error) {
        console.error(error);

        publicToast.error(
            "Não foi possível conectar com o servidor."
        );
    }
}


if (loginFormElement) {
    loginForm.init(loginFormElement);

    loginFormElement.addEventListener(
        "submit",
        handleLogin
    );
}


if (registerFormElement) {
    registerForm.init(registerFormElement);

    registerFormElement.addEventListener(
        "submit",
        handleRegister
    );
}
