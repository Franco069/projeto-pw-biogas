<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
// timezone para São Paulo América
date_default_timezone_set('America/Sao_Paulo');

ob_start();

require  __DIR__ . "/vendor/autoload.php";

// os headers abaixo são necessários para permitir o acesso a API por clientes externos ao domínio
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Credentials: true'); // Permitir credenciais

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;
// localhost/acme-3am/api
$route = new Router(url("api"),":");

$route->namespace("Source\Controller");

// Área autenticada BioGas Analytics
$route->group("/system-parameters");
$route->get("/list/{system_parameter_id}", "SystemParameters:listById");
$route->get("/list", "SystemParameters:listAll");
$route->post("/", "SystemParameters:insert");
$route->put("/{system_parameter_id}", "SystemParameters:update");
$route->delete("/{system_parameter_id}", "SystemParameters:delete");
$route->group(null);

$route->group("/simulations");
$route->get("/admin/list", "Simulations:listAdmin");
$route->get("/list", "Simulations:listAll");
$route->get("/list/{simulation_id}", "Simulations:listById");
$route->post("/", "Simulations:insert");
$route->delete("/{simulation_id}", "Simulations:delete");
$route->group(null);

$route->group("/reports");
$route->get("/admin/list", "Reports:listAdmin");
$route->get("/list", "Reports:listAll");
$route->post("/", "Reports:insert");
$route->group(null);




// Etapa 07 — produtos e galeria 1:N do usuário autenticado
$route->group("/products");
$route->get("/list", "Products:listAll");
$route->post("/", "Products:insert");
$route->delete("/{product_id}", "Products:delete");
$route->get("/{product_id}/images", "Products:listImages");
$route->post("/{product_id}/images", "Products:uploadImage");
$route->delete("/{product_id}/images/{image_id}", "Products:deleteImage");
$route->group(null);



// rota do locations
$route->group("/locations");

$route->get("/list/{location_id}", "Locations:listById");
$route->get("/list", "Locations:listAll");
$route->post("/", "Locations:insert");
$route->put("/{location_id}", "Locations:update");
$route->delete("/{location_id}", "Locations:delete");

// Imagens dos locais - Etapa 07
$route->get("/{location_id}/images", "LocationImages:listAll");
$route->post("/{location_id}/images", "LocationImages:insert");
$route->delete("/{location_id}/images/{image_id}", "LocationImages:delete");

$route->group(null);



// rota do energy_consumptions
$route->group("/energy-consumptions");
$route->get("/list/{energy_consumption_id}","EnergyConsumptions:listById"); // select by id
$route->get("/list","EnergyConsumptions:listAll"); // select all
$route->post("/","EnergyConsumptions:insert"); // insert
$route->put("/{energy_consumption_id}","EnergyConsumptions:update"); // update
$route->delete("/{energy_consumption_id}","EnergyConsumptions:delete"); 
$route->group(null);

// rota do waste_types
$route->group("/waste-types");
$route->get("/list/{waste_type_id}","WasteTypes:listById"); // select by id
$route->get("/list","WasteTypes:listAll"); // select all
$route->post("/","WasteTypes:insert"); // insert
$route->put("/{waste_type_id}","WasteTypes:update"); // update
$route->delete("/{waste_type_id}","WasteTypes:delete"); 
$route->group(null);

// Faqs
$route->get("/faqs-categories/list", "FaqsCategories:list");
$route->get("/faqs-categories/list/{categoryId}", "FaqsCategories:findById");
$route->get("/faqs/list", "Faqs:list");
$route->get("/faqs/admin/list", "Faqs:listAdmin");
$route->get("/faqs/list/{faqId}", "Faqs:findById");
$route->post("/faqs-categories", "FaqsCategories:create");
$route->post("/faqs", "Faqs:create");
$route->put("/faqs/{faqId}", "Faqs:update");
$route->put("/faqs-categories/{categoryId}", "FaqsCategories:update");
$route->delete("/faqs/{faqId}", "Faqs:delete");
$route->delete("/faqs-categories/{categoryId}", "FaqsCategories:delete");
$route->group(null);

// Login
$route->group("/users");
$route->post("/register","Users:register"); // Registrar usuário comum
$route->post("/login","Users:auth"); // login de usuário comum
$route->put("/update","Users:update"); // update de usuário comum
$route->get("/me", "Users:me");
$route->get("/me-admin", "Users:meAdmin");
$route->post("/photo", "Users:uploadPhoto");
$route->post("/photo-admin", "Users:uploadPhotoAdmin");
$route->post("/register-admin", "Users:registerAdmin");
$route->get("/manage/{type_id}", "Users:listManaged");
$route->post("/manage/{type_id}", "Users:insertManaged");
$route->put("/manage/{type_id}/{user_id}", "Users:updateManaged");
$route->delete("/manage/{type_id}/{user_id}", "Users:deleteManaged");
$route->post("/login-admin","Users:authAdmin"); // login de usuário admin
$route->put("/update-admin","Users:updateAdmin"); // update de usuário admin
$route->group(null);


$route->dispatch();

/** ERROR REDIRECT */
if ($route->error()) {
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(404);

    echo json_encode([
        "code" => 404,
        "type" => "error",
        "status" => "not_found",
        "message" => "O recurso solicitado não existe."
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

ob_end_flush();
