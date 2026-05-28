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
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Доступ заборонено' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Недійсний токен' });
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

// --- CART ---
app.get('/api/cart', authenticateToken, async (req, res) => {
  const cartItems = await prisma.cartItem.findMany({ where: { userId: req.user.userId }, include: { product: true } });
  res.json(cartItems.map(item => ({ id: item.id, productId: item.product.id, title: item.product.title, price: item.product.price, quantity: item.quantity })));
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;
  const existing = await prisma.cartItem.findFirst({ where: { userId, productId: Number(productId) } });

  if (existing) await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + (quantity || 1) } });
  else await prisma.cartItem.create({ data: { userId, productId: Number(productId), quantity: quantity || 1 } });
  res.json({ message: 'Додано' });
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
    const order = await prisma.$transaction(async (tx) => {
      return await tx.order.create({
        data: {
          userId: Number(req.user.userId),
          totalAmount: Number(totalAmount),
          phone: String(phone),
          address: String(address),
          paymentMethod: String(paymentMethod),
          items: {
            create: cartItems.map(item => ({
              productId: Number(item.productId), // Пряме використання ID
              quantity: Number(item.quantity),
              price: Number(item.price)
            }))
          }
        }
      });
    });
    res.status(201).json({ orderId: order.id });
  } catch (e) {
    console.error("ПОМИЛКА PRISMA:", e);
    res.status(500).json({ message: 'Помилка при створенні замовлення' });
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