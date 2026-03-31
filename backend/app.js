const express = require('express');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid(10)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Только изображения разрешены'));
    }
    cb(null, true);
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${res.statusCode} ${req.originalUrl}`);
  });
  next();
});

let products = [
  {
    id: nanoid(6),
    title: 'Капучино',
    category: 'Напитки',
    description: 'Классический капучино с нежной пенкой',
    price: 320,
    stock: 20,
    image: '/images/kapuchino.jpg'
  },
  {
    id: nanoid(6),
    title: 'Латте',
    category: 'Напитки',
    description: 'Нежный латте с бархатистой пенкой',
    price: 350,
    stock: 15,
    image: '/images/latte.jpg'
  },
  {
    id: nanoid(6),
    title: 'Эспрессо',
    category: 'Напитки',
    description: 'Крепкий эспрессо двойной порции',
    price: 250,
    stock: 30,
    image: '/images/aspreso.jpg'
  },
  {
    id: nanoid(6),
    title: 'Раф',
    category: 'Напитки',
    description: 'Раф кофейный с ванилью',
    price: 370,
    stock: 12,
    image: '/images/raf.jpg'
  },
  {
    id: nanoid(6),
    title: 'Круассан',
    category: 'Выпечка',
    description: 'Хрустящий французский круассан',
    price: 180,
    stock: 18,
    image: '/images/kruasan.jpg'
  },
  {
    id: nanoid(6),
    title: 'Чизкейк',
    category: 'Десерты',
    description: 'Нью-йоркский чизкейк классический',
    price: 450,
    stock: 8,
    image: '/images/chiskeyk.jpg'
  }
];

// Swagger конфигурация
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coffee API',
      version: '1.0.0',
      description: 'API для управления меню кофейни'
    },
    servers: [{ url: `http://localhost:${port}` }]
  },
  apis: [`${__filename}`]
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Товар не найден' });
  res.json(product);
});

// Вспомогательная функция
const findProductOr404 = (id, res) => {
  const product = products.find(p => p.id === id);
  if (!product) res.status(404).json({ error: 'Товар не найден' });
  return product;
};

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags:
 *       - Products
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Товар создан
 *       400:
 *         description: Неверные данные
 */
app.post('/api/products', upload.single('image'), (req, res) => {
  const { title, category, description, price, stock } = req.body;

  if (
    !title?.trim() ||
    !category?.trim() ||
    !description?.trim() ||
    isNaN(price) || price <= 0 ||
    isNaN(stock) || !Number.isInteger(Number(stock)) || stock < 0
  ) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  const newProduct = {
    id: nanoid(6),
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    image: req.file ? `/uploads/${req.file.filename}` : undefined
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @openapi
 * /api/products/{id}:
 *   patch:
 *     summary: Частично обновить товар
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Товар обновлён
 *       400:
 *         description: Неверные данные
 *       404:
 *         description: Товар не найден
 */
app.patch('/api/products/:id', upload.single('image'), (req, res) => {
  const p = findProductOr404(req.params.id, res);
  if (!p) return;

  const { title, category, description, price, stock } = req.body;

  if (title !== undefined && title.trim()) p.title = title.trim();
  if (category !== undefined && category.trim()) p.category = category.trim();
  if (description !== undefined && description.trim()) p.description = description.trim();
  if (price !== undefined && !isNaN(price) && price > 0) p.price = Number(price);
  if (stock !== undefined && !isNaN(stock) && Number.isInteger(Number(stock)) && Number(stock) >= 0) {
    p.stock = Number(stock);
  }
  if (req.file) p.image = `/uploads/${req.file.filename}`;

  res.json(p);
});

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удалён успешно
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  const product = products[index];

  if (product.image && product.image.startsWith('/uploads/')) {
    const imagePath = path.join(__dirname, 'public', product.image.replace(/^\//, ''));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  products.splice(index, 1);
  res.status(204).send();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID
 *         title:
 *           type: string
 *           example: Капучино
 *         category:
 *           type: string
 *           example: Напитки
 *         description:
 *           type: string
 *           example: Классический капучино
 *         price:
 *           type: number
 *           example: 320
 *         stock:
 *           type: integer
 *           example: 20
 *         image:
 *           type: string
 *           example: /uploads/abc123.jpg
 */

// Обработчики ошибок
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
});
