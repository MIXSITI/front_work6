# MIX Coffee — Кофейня

**Контрольная работа №1** по дисциплине «Фронтенд и бэкенд разработка»  
**Выполнил:** Кобылянский Сергей, группа ЭФБО-10-24  
**Преподаватель:** доц. Бочаров М.И.  
**Семестр:** 4, 2025/2026 уч. год

---

## О проекте

Полноценное **full-stack** приложение кофейни.  
Реализовано **CRUD** для товаров, современный адаптивный интерфейс на React и мощный бэкенд на Express с автоматической документацией Swagger.

### Реализовано в рамках практических занятий 1–5:
- **ПЗ 1** — CSS-препроцессоры (SASS + BEM + миксины) - создаёт визуально оформление(цвет, размер окна, шрифта) за счёт миксинов и вложенности (https://github.com/MIXSITI/front_work1)
- **ПЗ 2** — Сервер на Node.js + Express - создание сервера для хранения файлов в формате JSON (https://github.com/MIXSITI/front_work2)
- **ПЗ 3** — JSON, внешние API, Postman - использование Postman для тестирования серверной части сайта (GET/POST/DELETE/PATCH запросы) (https://github.com/MIXSITI/front_work3)
- **ПЗ 4** — API + React (полноценный магазин) - использование фреймворка REACT для визуализации серверных данных(формирование карточки товара в режиме фронтенда посредством пользовательского интерфейса) (https://github.com/MIXSITI/front_work4)
- **ПЗ 5** — Расширенный REST API + Swagger - документирование API приложения при помощи инструмента Swagger (https://github.com/MIXSITI/front_work5)
---

## Технологии

**Frontend**
- React 18 + JSX
- Axios
- SCSS (с переменными и BEM)
- Современный тёмный дизайн

**Backend**
- Node.js + Express
- Swagger (swagger-jsdoc + swagger-ui-express)
- nanoid
- CORS
- Логирование запросов + обработка ошибок
---

## Основной функционал

- ✅ Просмотр всех товаров 
- ✅ Поиск по названию 
- ✅ Фильтрация по категориям
- ✅ Добавление нового товара
- ✅ Редактирование товара 
- ✅ Удаление товара
- ✅ Полная валидация на фронте и бэке
- ✅ Swagger-документация (`/api-docs`)
- ✅ Адаптивный дизайн
- ✅ Красивые карточки товаров

## Структура проекта

```bash
WORK 6/
├── backend/
│   ├── public/
│   │   └── uploads/                  # Загруженные изображения
│   ├── app.js                        # Express-сервер + API + Swagger
│   ├── requests.http                 # Тестовые HTTP-запросы
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── postman/
│   │   └── coffee-shop.postman_collection.json
│   ├── public/
│   │   ├── images/                   # Локальные изображения товаров
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js                # Работа с API
│   │   ├── components/
│   │   │   ├── ProductItem.jsx       # Карточка товара
│   │   │   ├── ProductList.jsx       # Список товаров
│   │   │   └── ProductModal.jsx      # Модальное окно формы
│   │   ├── styles/
│   │   │   ├── _variables.scss       # Переменные и миксины
│   │   │   └── main.scss             # Основные стили приложения
│   │   ├── App.jsx                   # Главный компонент
│   │   ├── index.css
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```
 
## Запуск проекта

### 1. Запуск backend

```bash
cd backend
npm install
npm start
```

Swagger-документация:

```bash
http://localhost:3001/api-docs
```

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/products` | Получить список всех товаров |
| `GET` | `/api/products/:id` | Получить товар по ID |
| `POST` | `/api/products` | Создать новый товар |
| `PATCH` | `/api/products/:id` | Обновить товар |
| `DELETE` | `/api/products/:id` | Удалить товар |

---

## Объект товара (JSON)

```json
{
  "id": "abc123",
  "title": "Капучино",
  "category": "Напитки",
  "description": "Классический капучино с нежной пенкой",
  "price": 320,
  "stock": 20,
  "image": "/uploads/example.jpg"
}
```
### 2. Запуск frontend

```bash
cd frontend
npm install
npm start
```

Frontend будет доступен по адресу:

```bash
http://localhost:3000
```

---

## Работа с изображениями

В проекте используется хранение изображений:

1. **Стандартные изображения**  
   Хранятся в папке `frontend/public/images` и подключаются по путям вида:

```bash
/images/kapuchino.jpg
/images/latte.jpg
/images/aspreso.jpg
/images/raf.jpg
/images/kruasan.jpg
/images/chiskeyk.jpg
```
---

## Категории товаров

| Категория | Примеры |
|-----------|---------|
| Напитки | Капучино, Латте, Эспрессо, Раф |
| Выпечка | Круассан |
| Десерты | Чизкейк |

---

Проект выполнен в рамках учебной дисциплины  
**«Фронтенд и бэкенд разработка»**, 4 семестр, 2025/2026.
