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

// Налаштування CORS: дозволяємо запити з усіх джерел для безпроблемного з'єднання з Vercel
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==========================================
// MIDDLEWARE ДЛЯ ПЕРЕВІРКИ JWT ТОКЕНА
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Витягуємо токен з "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ message: 'Доступ заборонено: відсутній токен авторизації' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Недійсний або прострочений токен' });
    }
    // Записуємо розшифровані дані (там лежить userId) у req.user
    req.user = decoded;
    next(); // Пропускаємо запит далі до маршруту
  });
};

// ==========================================
// МАРШРУТИ АВТОРИЗАЦІЇ (AUTH)
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Користувач з таким email вже існує' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash: hashedPassword, // Використовуємо поле синхронізоване з базою
      },
    });
    res.status(201).json({ message: 'Користувача створено!', userId: newUser.id });
  } catch (error) {
    console.error("ПОМИЛКА РЕЄСТРАЦІЇ:", error);
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Введіть email та пароль' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Користувача не знайдено' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Невірний пароль' });

    // Додаємо userId в корисне навантаження токена (payload)
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      token, 
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error("ПОМИЛКА ВХОДУ:", error);
    res.status(500).json({ message: 'Помилка на сервері під час входу' });
  }
});

// ==========================================
// МАРШРУТИ ТОВАРІВ (PRODUCTS)
// ==========================================

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("ПОМИЛКА ОТРИМАННЯ ТОВАРІВ:", error);
    res.status(500).json({ message: 'Помилка при отриманні товарів' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    if (isNaN(productId)) return res.status(400).json({ message: 'Некоректний ID' });
    
    const product = await prisma.product.update({
      where: { id: productId },
      data: { views: { increment: 1 } }
    });
    res.json(product);
  } catch (error) {
    console.error("ПОМИЛКА ОТРИМАННЯ ТОВАРУ:", error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// ==========================================
// ХМАРНИЙ КОШИК (CART ROUTES)
// ==========================================

app.get('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    const formattedCart = cartItems.map(item => ({
      id: item.id, 
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity
    }));

    res.json(formattedCart);
  } catch (error) {
    console.error("ПОМИЛКА ЗАВАНТАЖЕННЯ КОШИКА:", error);
    res.status(500).json({ message: 'Не вдалося завантажити хмарний кошик' });
  }
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  try {
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId: Number(productId) }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productId: Number(productId),
          quantity: quantity || 1
        }
      });
    }
    res.json({ message: 'Товар успішно синхронізовано з хмарою' });
  } catch (error) {
    console.error("ПОМИЛКА ДОДАВАННЯ В КОШИК:", error);
    res.status(500).json({ message: 'Помилка при збереженні в кошик' });
  }
});

app.patch('/api/cart/update', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { id, quantity } = req.body;

  try {
    const item = await prisma.cartItem.findFirst({
      where: { id: Number(id), userId }
    });

    if (!item) return res.status(404).json({ message: 'Товар в кошику не знайдено' });

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: Number(quantity) }
    });

    res.json({ message: 'Кількість оновлено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка оновлення кількості' });
  }
});

app.delete('/api/cart/remove/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const id = parseInt(req.params.id);

  try {
    const item = await prisma.cartItem.findFirst({
      where: { id, userId }
    });

    if (!item) return res.status(404).json({ message: 'Товар не знайдено в кошику' });

    await prisma.cartItem.delete({ where: { id: item.id } });
    res.json({ message: 'Товар видалено з хмарного кошика' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка видалення товару' });
  }
});

// ==========================================
// ХМАРНЕ ОБРАНЕ (FAVORITES ROUTES)
// ==========================================

app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const favorites = await prisma.favoriteItem.findMany({
      where: { userId },
      include: { product: true }
    });
    
    const formattedFavs = favorites.map(fav => fav.product);
    res.json(formattedFavs);
  } catch (err) {
    console.error("ПОМИЛКА ОТРИМАННЯ ОБРАНОГО:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні вибраного" });
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
    console.error("ПОМИЛКА ЗМІНИ СТАТУСУ ОБРАНОГО:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// ==========================================
// МАРШРУТИ ЗАМОВЛЕНЬ (ORDERS)
// ==========================================

app.post('/api/orders', authenticateToken, async (req, res) => {
  const { cartItems, totalAmount } = req.body;
  const userId = req.user.userId;

  try {
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Кошик порожній' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: Number(userId),
          totalAmount: Number(totalAmount),
          status: 'completed',
          items: {
            create: cartItems.map(item => ({
              productId: Number(item.productId || item.id),
              quantity: Number(item.quantity),
              price: Number(item.price)
            }))
          }
        }
      });

      await tx.cartItem.deleteMany({
        where: { userId: Number(userId) }
      });

      return order;
    });

    res.status(201).json({ message: 'Замовлення успішно створено, кошик очищено!', orderId: result.id });
  } catch (error) {
    console.error("ПОМИЛКА СТВОРЕННЯ ЗАМОВЛЕННЯ:", error);
    res.status(500).json({ message: 'Помилка при оформленні замовлення' });
  }
});

app.get('/api/orders/my', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(userId) },
      include: {
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(orders);
  } catch (error) {
    console.error("ПОМИЛКА ІСТОРІЇ ЗАМОВЛЕНЬ:", error);
    res.status(500).json({ message: 'Помилка завантаження історії замовлень' });
  }
});

app.patch('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
  const orderId = parseInt(req.params.id);
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: 'Замовлення не знайдено' });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });
    res.json({ message: 'Замовлення успішно скасовано', order: updatedOrder });
  } catch (error) {
    console.error('Помилка при скасуванні:', error);
    res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
});

// ==========================================
// МОДЕРНІЗОВАНИЙ ЗАПУСК СЕРВЕРА ДЛЯ ХОСТИНГУ
// ==========================================
// '0.0.0.0' відкриває сервер для зовнішнього світу, що критично для Render/Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер успішно запущено та відкрито на порту ${PORT}`);
});