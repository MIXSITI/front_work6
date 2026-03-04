const express = require('express');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const app = express();
const port = 3001;

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.options('*', cors());

app.use(express.json());

// Логирование
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${res.statusCode} ${req.originalUrl}`);
  });
  next();
});

// Данные
let products = [
  { id: nanoid(6), title: 'Капучино', category: 'Напитки', description: 'Классический капучино с нежной пенкой', price: 320, stock: 20 },
  { id: nanoid(6), title: 'Латте', category: 'Напитки', description: 'Нежный латте', price: 350, stock: 15 },
  { id: nanoid(6), title: 'Эспрессо', category: 'Напитки', description: 'Крепкий эспрессо', price: 250, stock: 30 },
  { id: nanoid(6), title: 'Раф', category: 'Напитки', description: 'Раф с ванилью', price: 370, stock: 12 },
  { id: nanoid(6), title: 'Круассан', category: 'Выпечка', description: 'Свежий круассан', price: 180, stock: 18 },
  { id: nanoid(6), title: 'Чизкейк', category: 'Десерты', description: 'Классический чизкейк', price: 450, stock: 8 }
];

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Кофейни Bean & Brew',
      version: '1.0.0',
      description: 'Полное REST API меню кофейни'
    },
    servers: [{ url: `http://localhost:${port}` }]
  },
  apis: ['./app.js']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

function findProductOr404(id, res) {
  const p = products.find(x => x.id === id);
  if (!p) {
    res.status(404).json({ error: 'Товар не найден' });
    return null;
  }
  return p;
}

// ==================== РОУТЫ ====================

app.get('/api/products', (req, res) => res.json(products));

app.get('/api/products/:id', (req, res) => {
  const p = findProductOr404(req.params.id, res);
  if (p) res.json(p);
});

app.post('/api/products', (req, res) => {
  const { title, category, description, price, stock } = req.body;
  if (!title?.trim() || !category?.trim() || !description?.trim() || 
      typeof price !== 'number' || price <= 0 || 
      !Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  const newProduct = {
    id: nanoid(6),
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock)
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const p = findProductOr404(req.params.id, res);
  if (!p) return;

  const { title, category, description, price, stock } = req.body;

  if (title !== undefined) p.title = title.trim();
  if (category !== undefined) p.category = category.trim();
  if (description !== undefined) p.description = description.trim();
  if (price !== undefined) p.price = Number(price);
  if (stock !== undefined) p.stock = Number(stock);

  res.json(p);
});

app.delete('/api/products/:id', (req, res) => {
  console.log('DELETE запрос получен, id =', req.params.id);
  const id = req.params.id;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    console.log('Товар не найден');
    return res.status(404).json({ error: 'Товар не найден' });
  }
  products.splice(index, 1);
  console.log('Товар удалён, осталось:', products.length);
  res.status(204).send();
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
});