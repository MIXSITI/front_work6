Архитиктура

coffee-shop/

├── backend/

│   ├── app.js                  ← Express + Swagger + CRUD товаров

│   └── package.json

├── frontend/

│   ├── public/index.html

│   ├── src/

│   │   ├── api/api.js          ← fetch-запросы к API

│   │   ├── components/

│   │   │   ├── ProductItem.jsx ← карточка товара (SASS)

│   │   │   ├── ProductModal.jsx

│   │   │   └── ProductList.jsx

│   │   ├── styles/main.scss    ← ПРАКТИКА №1: SASS

│   │   ├── App.jsx             ← ПРАКТИКА №4: React CRUD

│   │   └── index.js

│   └── package.json            

├── requests.http               ← ПРАКТИКА №3: Postman

└── README.md

Запуск

backend: npm start

backend: npm install

backend: npm i express nanoid

backend: npm i -D swagger-jsdoc swagger-ui-express

frontend: npm install

frontend: npm start

\------------------------------

- **ПР 1** — CSS-препроцессоры (SASS + BEM + миксины) - создаёт визуально оформление(цвет, размер окна, шрифта) за счёт миксинов и вложенности (https://github.com/MIXSITI/front_work1)
- **ПР 2** — Сервер на Node.js + Express - создание сервера для хранения файлов в формате JSON (https://github.com/MIXSITI/front_work2)
- **ПР 3** — JSON, внешние API, Postman - использование Postman для тестирования серверной части сайта (GET/POST/DELETE/PATCH запросы) (https://github.com/MIXSITI/front_work3)
- **ПР 4** — API + React (полноценный магазин) - использование фреймворка REACT для визуализации серверных данных(формирование карточки товара в режиме фронтенда посредством пользовательского интерфейса) (https://github.com/MIXSITI/front_work4)
- **ПР 5** — Расширенный REST API + Swagger - документирование API приложения при помощи инструмента Swagger (https://github.com/MIXSITI/front_work5)
- **ПР 6** - Интеграция компонентов с 1 по 5 в модуль-серверное приложение по продаже технике
  
\------------------------------

ПРАКТИКА №1: CSS-ПРЕПРОЦЕССОРЫ (SASS)

Цель: Переменные, миксины, вложенность для карточек товаров

Файл: frontend/src/styles/main.scss

Переменные (6 шт.):


$bg-body: #f9f5f0;           // Бежевый фон

$color-primary: #8b5a2b;      // Коричневый кофе

$color-accent: #f0c27b;       // Бежевые кнопки

$radius-card: 12px;           // Скругления

Миксин кнопок:


@mixin btn-base($bg, $color: #fff) {

padding: 8px 14px; border-radius: 6px;

background: $bg; color: $color;

&:hover { background: darken($bg, 8%); }

}

.btn-add { @include btn-base($color-primary); }

Вложенность (карточка товара):


.menu-card {

padding: 16px; border-radius: $radius-card;

h3 { font-size: 20px; color: #3c2a21; }

p { strong { color: #3c2a21; } }

&\_\_actions { display: flex; gap: 10px; }

}

<img width="346" height="325" alt="image" src="https://github.com/user-attachments/assets/017e3b69-0803-43c6-9c73-a0580577d92a" />

\----------------------------

ПРАКТИКА №2: NODE.JS + EXPRESS

Цель: REST API с CRUD-операциями

Файл: backend/app.js

Middleware:

js

app.use(express.json());     // req.body

app.use(cors({origin: '3000'})); // React

app.use((req, res, next) => {   // Логи

console.log(`${req.method} ${req.url}`);

});

In-memory БД (6 товаров):

js

let products = [{id: nanoid(6), title: 'Капучино', ...}];

CRUD (5 эндпоинтов):

js

GET    /api/products           // res.json(products)

GET    /:id                    // req.params.id

POST   /api/products           // req.body → push()

PATCH  /:id                    // Object.assign(req.body)

DELETE /:id                    // splice(req.params.id)

<img width="747" height="521" alt="image" src="https://github.com/user-attachments/assets/34e378e2-2243-4000-b779-07155ebd749c" />

\------------------------------------------

ПРАКТИКА №3: JSON + POSTMAN

Цель: Формат JSON, тестирование API

JSON-структура товара:

json

{

"id": "abc123", "title": "Капучино",

"category": "Напитки", "price": 320, "stock": 20

}

Коллекция Postman (requests.http):

text

GET  localhost:3001/api/products    → 200 [6 товаров]

POST localhost:3001/api/products    → 201 {"id": "new456", ...}

DELETE localhost:3001/api/products/abc123 → 204

<img width="1391" height="1031" alt="image" src="https://github.com/user-attachments/assets/266abe85-0495-4edc-a539-9d76730cbc0d" />

\----------------------------------------

ПРАКТИКА №4: API + REACT

Цель: Frontend интеграция с API (fetch + state)

API-клиент (api/api.js):

js

export const getProducts = () => fetch('/api/products').then(r => r.json());

React (App.jsx):

jsx

const [products, setProducts] = useState([]);

useEffect(() => loadProducts(), []); // GET

const handleDelete = async id => {    // DELETE

await deleteProduct(id);

setProducts(prev => prev.filter(...));

};

Компоненты:

text

App → ProductList → ProductItem (карточки)

↓

ProductModal (POST/PATCH)

Связь клиент-сервер:

text

package.json: "proxy": "http://localhost:3001"

Backend CORS: origin: 'http://localhost:3000'

<img width="1603" height="931" alt="image" src="https://github.com/user-attachments/assets/8f1e9c74-f468-4467-a2b1-c1542ecf0ed2" />

\--------------------------------------------

ПРАКТИКА №5: SWAGGER/OPENAPI

Цель: Автоматическая документация API

Установка: npm i swagger-jsdoc swagger-ui-express

JSDoc → OpenAPI (app.js):

js

/\*\*

* @swagger
* /api/products:
* get:
* summary: Получить товары кофейни
* responses:
* 200:
* content:
* application/json:
* schema:
* type: array
* items: { $ref: '#/components/schemas/Product' }

\*/

Схема Product:

js

/\*\*

* @swagger
* components:
* schemas:
* Product:
* type: object
* properties:
* id: { type: string }
* title: { type: string, example: "Капучино" }
* price: { type: number, example: 320 }

\*/

Swagger UI: localhost:3001/api-docs

<img width="1868" height="960" alt="image" src="https://github.com/user-attachments/assets/39855cff-5846-41ff-af0b-bafe2641eb83" />



