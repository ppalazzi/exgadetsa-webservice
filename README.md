# Exgadet - Get Task App

API Rest y accesos a Base de Datos

## Requirements

- [Node and npm](http://nodejs.org)
- [Docker](https://www.docker.com/) 
    - `Imagen MongoDb` (Usada para la registracion y seguimiento de usuarios).
    - `Imagen SQL Server 2017` (Usada para registrar las tareas diarias de los usuarios).

## Configuracion

Se crearon dos archivos JSON, los cuales sirven para tener credenciales diferentes segun el ambiente en el que se levanta la aplicacion:
- `DEFAULT.JSON`

### Propiedad para recrear Mongo con datos de prueba

| PROPIEDAD | VALOR |                              DETALLE                                          |
|-----------|-------|-------------------------------------------------------------------------------|
| RECREATE  | True  |   Inserta todo el set de datos (Clientes, Usuarios, Connecciones, Mensajes)   |
|  DELETE   | True  |   Borra todos los documentos de las colecciones antes mencionadas             |


## Installation

1. Clonar el repo: `git clone https://bitbucket.org/dagonzalez/exgadet/src/master/`
2. Instalar librerias: `npm install`
3. Levantar las imagenes previamente mencionadas (Con sus correspondientes script para la creacion de sus tablas: `./config/database/sql/script.sql`)
4. Instalar la herramienta FOREVER globalmente corriendo: `npm install forever -g`
5. Ejecutar en `path/api/`: `forever node server.js`

## Log de inicio de servidor
---
`[2018-08-06T22:06:37.338] [INFO] server - Exgadet Api listening on port: 3000`

`[2020-01-01T13:36:21.245] [INFO] SqlServer-Connection - La coneccion a la base de datos [Sistema_Integral_Exgadet], se genero exitosamente!:)`

Nota: Se creara un archivo log cada dia como el siguiente ejemplo: `api-server.2020-07-16.log` y en el mismo dia cada 20 MB, se creara otro con un digito extra `api-server.2020-07-16.1.log`

----
#### View in browser at `http://localhost:3000`

### Aclaracion: 
Las imagenes del `docker-compose.yaml`, son solo ejemplos para tener en cuenta, no hace falta levantar lo mismo.

---
---

## SERVICIOS

### `GET /app/tasks/user/{userId}` 
#### Posibles respuestas:

- 200: Pudiendo tener o no resultados
- 500: Cuando alguna parte del flujo falla

#### Respuestas de Ejemplo:

`{
    "mensaje": "No se encontraron TAREAS para el usuario: y",
    "status": 200,
    "data": []
}`

---

`{
    "mensaje": "",
    "status": 200,
    "data": [
        {
            "Direccion": "MALDONADO (D.22) 00344 PB    01",
            "Tipo_Trabajo": "OC",
            "Fecha_Creacion": "2018-05-17T00:00:00.000Z"
        },
        {
            "Direccion": "URDANETA 07176",
            "Tipo_Trabajo": "OC",
            "Fecha_Creacion": "2018-05-17T00:00:00.000Z"
        }
    ]
}`

---

`{
    "mensaje": "Error en la consulta para obtener tareas por usuarioInvalid column name 'COPERRIO900'.",
    "status": 500,
    "data": ""
}`



---