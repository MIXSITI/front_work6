const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;
const bcryptRounds = 10;

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

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

let users = [];
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

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Practice 7 API',
      version: '1.0.0',
      description: 'API для авторизации пользователей и управления товарами'
    },
    servers: [{ url: `http://localhost:${port}` }]
  },
  apis: [`${__filename}`]
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const removeUploadedFile = (filePath) => {
  if (!filePath || !filePath.startsWith('/uploads/')) {
    return;
  }

  const fullPath = path.join(__dirname, 'public', filePath.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const findUserByEmail = (email) => users.find((user) => user.email === email);

const findProductOr404 = (id, res) => {
  const product = products.find((item) => item.id === id);
  if (!product) {
    res.status(404).json({ error: 'Товар не найден' });
    return null;
  }
  return product;
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const validateProductPayload = ({ title, category, description, price, stock }) => {
  if (!normalizeText(title) || !normalizeText(category) || !normalizeText(description)) {
    return 'Поля title, category и description обязательны';
  }

  if (price === undefined || price === '' || Number.isNaN(Number(price)) || Number(price) <= 0) {
    return 'Поле price должно быть положительным числом';
  }

  if (stock !== undefined && stock !== '' && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
    return 'Поле stock должно быть целым неотрицательным числом';
  }

  return null;
};

const buildProductFromPayload = (payload, file, currentProduct) => {
  const nextProduct = currentProduct ? { ...currentProduct } : { id: nanoid(6) };

  nextProduct.title = normalizeText(payload.title);
  nextProduct.category = normalizeText(payload.category);
  nextProduct.description = normalizeText(payload.description);
  nextProduct.price = Number(payload.price);
  nextProduct.stock = payload.stock === undefined || payload.stock === '' ? 0 : Number(payload.stock);

  if (file) {
    if (currentProduct?.image) {
      removeUploadedFile(currentProduct.image);
    }
    nextProduct.image = `/uploads/${file.filename}`;
  } else if (!currentProduct) {
    nextProduct.image = undefined;
  }

  return nextProduct;
};

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Зарегистрировать пользователя
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Некорректные данные
 *       409:
 *         description: Пользователь уже существует
 */
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const email = normalizeText(req.body.email).toLowerCase();
    const firstName = normalizeText(req.body.first_name);
    const lastName = normalizeText(req.body.last_name);
    const password = req.body.password;

    if (!email || !firstName || !lastName || typeof password !== 'string' || password.trim().length < 6) {
      return res.status(400).json({
        error: 'Поля email, first_name, last_name и password обязательны. Пароль минимум 6 символов'
      });
    }

    if (findUserByEmail(email)) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    const user = {
      id: nanoid(6),
      email,
      first_name: firstName,
      last_name: lastName,
      password: await bcrypt.hash(password, bcryptRounds)
    };

    users.push(user);

    res.status(201).json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Выполнить вход
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Неверный пароль
 *       404:
 *         description: Пользователь не найден
 */
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = normalizeText(req.body.email).toLowerCase();
    const password = req.body.password;

    if (!email || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Поля email и password обязательны' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isAuthenticated = await bcrypt.compare(password, user.password);
    if (!isAuthenticated) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    res.json({
      login: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    next(error);
  }
});

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
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) {
    return;
  }

  res.json(product);
});

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductJsonInput'
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные данные
 */
app.post('/api/products', upload.single('image'), (req, res) => {
  const validationError = validateProductPayload(req.body);
  if (validationError) {
    removeUploadedFile(req.file ? `/uploads/${req.file.filename}` : undefined);
    return res.status(400).json({ error: validationError });
  }

  const newProduct = buildProductFromPayload(req.body, req.file);
  products.push(newProduct);

  res.status(201).json(newProduct);
});

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар по ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductJsonInput'
 *     responses:
 *       200:
 *         description: Товар обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные данные
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const currentProduct = findProductOr404(req.params.id, res);
  if (!currentProduct) {
    removeUploadedFile(req.file ? `/uploads/${req.file.filename}` : undefined);
    return;
  }

  const validationError = validateProductPayload(req.body);
  if (validationError) {
    removeUploadedFile(req.file ? `/uploads/${req.file.filename}` : undefined);
    return res.status(400).json({ error: validationError });
  }

  const updatedProduct = buildProductFromPayload(req.body, req.file, currentProduct);
  products = products.map((item) => (item.id === req.params.id ? updatedProduct : item));

  res.json(updatedProduct);
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
 *         description: Товар удалён
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  removeUploadedFile(products[index].image);
  products.splice(index, 1);
  res.status(204).send();
});

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: a1B2c3
 *         email:
 *           type: string
 *           example: user@example.com
 *         first_name:
 *           type: string
 *           example: Ivan
 *         last_name:
 *           type: string
 *           example: Ivanov
 *     RegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         first_name:
 *           type: string
 *           example: Ivan
 *         last_name:
 *           type: string
 *           example: Ivanov
 *         password:
 *           type: string
 *           example: qwerty123
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: qwerty123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         login:
 *           type: boolean
 *           example: true
 *         user:
 *           $ref: '#/components/schemas/User'
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           example: a1B2c3
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
 *     ProductInput:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         image:
 *           type: string
 *           format: binary
 *     ProductJsonInput:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 */

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);

  if (req.file) {
    removeUploadedFile(`/uploads/${req.file.filename}`);
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
});
