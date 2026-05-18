const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // ЗАМІНЕНО НА bcryptjs для стабільності на Windows
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

app.use(cors());
app.use(express.json());

// ==========================================
// МАРШРУТИ АВТОРИЗАЦІЇ (AUTH)
// ==========================================

// 1. РЕЄСТРАЦІЯ КОРИСТУВАЧА
app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // Валідація вхідних даних на випадок порожніх полів з фронтенду
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
    }

    // Перевіряємо, чи такий користувач вже існує
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Користувач з таким email вже існує' });
    }

    // Хешуємо пароль безпечно без збоїв системи
    const hashedPassword = await bcrypt.hash(password, 10);

    // Зберігаємо в базу даних
    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Користувача створено!', userId: newUser.id });
  } catch (error) {
    console.error("ПОМИЛКА РЕЄСТРАЦІЇ:", error); // Детальний лог у термінал
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації. Перевірте схему БД.' });
  }
});

// 2. ВХІД В СИСТЕМУ (LOGIN)
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

    // Створюємо токен, який діє 24 години
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

// Отримання списку всіх товарів
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("ПОМИЛКА ОТРИМАННЯ ТОВАРІВ:", error);
    res.status(500).json({ message: 'Помилка при отриманні товарів' });
  }
});

// Отримання одного товару за ID (та інкремент переглядів)
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Некоректний ID товару' });
    }
    
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        views: { increment: 1 } 
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }
    
    res.json(product);
  } catch (error) {
    console.error("ПОМИЛКА ОТРИМАННЯ ТОВАРУ:", error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні картки товару' });
  }
});

// ==========================================
// МАРШРУТИ ЗАМОВЛЕНЬ (ORDERS)
// ==========================================

// Створення нового замовлення
app.post('/api/orders', async (req, res) => {
  const { cartItems, totalAmount, userId } = req.body;

  try {
    if (!cartItems || cartItems.length === 0 || !userId) {
      return res.status(400).json({ message: 'Неповні дані замовлення або порожній кошик' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Створюємо головний запис замовлення
      const order = await tx.order.create({
        data: {
          userId: Number(userId),
          totalAmount: Number(totalAmount),
          status: 'completed',
          // 2. Одночасно створюємо всі позиції в OrderItem
          items: {
            create: cartItems.map(item => ({
              productId: Number(item.id),
              quantity: Number(item.quantity),
              price: Number(item.price)
            }))
          }
        }
      });
      return order;
    });

    res.status(201).json({ message: 'Замовлення успішно створено!', orderId: result.id });
  } catch (error) {
    console.error("ПОМИЛКА СТВОРЕННЯ ЗАМОВЛЕННЯ:", error);
    res.status(500).json({ message: 'Помилка при оформленні замовлення' });
  }
});

// Отримання історії замовлень користувача
app.get('/api/orders/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(userId) },
      include: {
        items: {
          include: { product: true } 
        }
      },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(orders);
  } catch (error) {
    console.error("ПОМИЛКА ІСТОРІЇ ЗАМОВЛЕНЬ:", error);
    res.status(500).json({ message: 'Помилка завантаження історії' });
  }
});

// Маршрут для скасування замовлення через головний екземпляр додатка (app)
app.patch('/api/orders/:id/cancel', async (req, res) => {
  // Перетворюємо id замовлення з URL-рядка у число
  const orderId = parseInt(req.params.id);

  try {
    // 1. Шукаємо замовлення в базі даних через Prisma
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    // Якщо такого замовлення немає — повертаємо клієнту 404 помилку
    if (!order) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    // 2. Оновлюємо статус замовлення на 'cancelled'
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });

    // Відправляємо успішну відповідь на фронтенд
    res.json({ message: 'Замовлення успішно скасовано', order: updatedOrder });
  } catch (error) {
    console.error('Помилка на бекенді при скасуванні:', error);
    res.status(500).json({ message: 'Внутрішня помилка сервера при скасуванні замовлення' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер працює на порту ${PORT}`);
});