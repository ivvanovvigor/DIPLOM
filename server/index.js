const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

app.use(cors({
  origin: ['http://localhost:5173', 'https://moto-store-eight.vercel.app'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Токен відсутній' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err.message);
      return res.status(403).json({ message: 'Недійсний токен', error: err.message });
    }
    req.user = decoded;
    next();
  });
};

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Користувач вже існує' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({ data: { email, fullName, passwordHash: hashedPassword } });
    res.status(201).json({ userId: newUser.id });
  } catch (e) { res.status(500).json({ message: 'Помилка реєстрації' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ message: 'Невірні дані' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: 'Помилка сервера' }); }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    if (!product) {
      return res.status(404).json({ message: "Товар не знайдено" });
    }

    res.json(product);
  } catch (e) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// --- CART ---
app.get('/api/cart', authenticateToken, async (req, res) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user.userId },
    include: { product: true },
    orderBy: { id: 'asc' }
  });

  res.json(cartItems.map(item => ({
    id: item.id,
    productId: item.product.id,
    title: item.product.title,
    price: item.product.price,
    quantity: item.quantity,
    imageUrl: item.product.imageUrl
  })));
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;
  const existing = await prisma.cartItem.findFirst({ where: { userId, productId: Number(productId) } });

  if (existing) await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + (quantity || 1) } });
  else await prisma.cartItem.create({ data: { userId, productId: Number(productId), quantity: quantity || 1 } });
  res.json({ message: 'Додано' });
});

app.delete('/api/cart/remove/:cartItemId', authenticateToken, async (req, res) => {
  const { cartItemId } = req.params;
  const userId = req.user.userId;

  try {
    const deleted = await prisma.cartItem.deleteMany({
      where: {
        id: Number(cartItemId),
        userId: userId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Товар не знайдено" });
    }

    res.json({ message: "Видалено з кошика" });
  } catch (e) {
    console.error("Помилка при видаленні:", e);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

app.patch('/api/cart/update', authenticateToken, async (req, res) => {
  const { id, quantity } = req.body; // id - це id запису в таблиці CartItem
  const userId = req.user.userId;

  try {
    if (quantity <= 0) {
      // Якщо кількість 0 або менше - видаляємо запис
      await prisma.cartItem.deleteMany({
        where: { id: Number(id), userId: userId }
      });
      return res.json({ message: "Товар видалено з кошика" });
    }

    // Оновлюємо кількість
    const updated = await prisma.cartItem.updateMany({
      where: { id: Number(id), userId: userId },
      data: { quantity: Number(quantity) }
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Товар не знайдено" });
    }

    res.json({ message: "Кількість оновлено" });
  } catch (e) {
    console.error("Помилка при оновленні кількості:", e);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// --- FAVORITES ---
app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const favorites = await prisma.favoriteItem.findMany({
      where: { userId },
      include: { product: true }
    });
    res.json(favorites.map(fav => fav.product));
  } catch (err) {
    res.status(500).json({ message: "Помилка отримання обраного" });
  }
});

app.post('/api/favorites/toggle', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  try {
    const existing = await prisma.favoriteItem.findFirst({
      where: { userId, productId: Number(productId) }
    });

    if (existing) {
      await prisma.favoriteItem.delete({ where: { id: existing.id } });
      return res.json({ message: "Видалено з обраного", isFavorite: false });
    } else {
      await prisma.favoriteItem.create({
        data: { userId, productId: Number(productId) }
      });
      return res.json({ message: "Додано в обране", isFavorite: true });
    }
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// --- ORDERS ---
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { cartItems, totalAmount, phone, address, paymentMethod } = req.body;

  try {
    const order = await prisma.order.create({
      data: {
        userId: Number(req.user.userId),
        totalAmount: Number(totalAmount),
        phone: String(phone),
        address: String(address),
        paymentMethod: String(paymentMethod),
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });
    res.status(201).json(order);
  } catch (error) {
    console.error("Помилка Prisma:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// Маршрут для отримання замовлень поточного користувача
app.get('/api/orders/my', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(req.user.userId) },
      include: {
        items: {
          include: { product: true } // Якщо потрібно виводити назви товарів
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (e) {
    console.error("Помилка при отриманні замовлень:", e);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.patch('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const order = await prisma.order.findFirst({
      where: { id: Number(id), userId: Number(userId) }
    });

    if (!order) {
      return res.status(404).json({ message: "Замовлення не знайдено" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: 'Cancelled' }
    });

    res.json({ message: "Замовлення скасовано", order: updatedOrder });
  } catch (e) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// --- НОВА ПОШТА ---
app.post('/api/np/cities', async (req, res) => {
  const { search } = req.body;
  const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: process.env.NP_API_KEY,
      modelName: "Address",
      calledMethod: "getCities",
      methodProperties: { FindByString: search || "" }
    })
  });
  const result = await response.json();
  res.json(result.data);
});

app.post('/api/np/warehouses', async (req, res) => {
  const { cityRef } = req.body;
  const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: process.env.NP_API_KEY,
      modelName: "Address",
      calledMethod: "getWarehouses",
      methodProperties: { CityRef: cityRef }
    })
  });
  const result = await response.json();
  res.json(result.data);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));