# Інтернет-магазин мотозапчастин (Дипломна робота)

Сучасний повнофункціональний інтернет-магазин MotoStore.

## Основні можливості

- Реєстрація та авторизація (JWT)
- Каталог товарів з пошуком і фільтрами
- Кошик та управління товарами
- Обрані товари
- Оформлення замовлення з інтеграцією **Нова Пошта**
- Особистий кабінет та історія замовлень
- Адаптивний дизайн

## Технологічний стек

**Frontend:** React 19 + Vite + Tailwind CSS + React Router DOM v7  
**Backend:** Node.js + Express + Prisma ORM (PostgreSQL) + JWT + bcryptjs  
**База даних:** PostgreSQL

## Як запустити проєкт

### 1. Клонування репозиторію
```bash
git clone https://github.com/ivvanovvigor/DIPLOM.git
cd DIPLOM

2. Встановлення залежностей
npm install

3. Налаштування .env файлів
Своріть файли .env у папках server та client
Backend (server/.env)
DATABASE_URL="postgresql://neondb_owner:npg_YHViLM8ugwF1@ep-proud-fire-alavjsqu-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NP_API_KEY=0e5bb90678586abc76365419bb0d51b2
JWT_SECRET="super_secret_moto_store_key_2026_pro"
Frontend (client/.env)
VITE_API_URL=http://localhost:5000

4. Ініціалізація бази даних
cd ../server
npx prisma generate
npx prisma db push
cd ..

5. Запуск проєкту
npm run dev
Після запуску:
Frontend → http://localhost:5173
Backend → http://localhost:5000

Автор
Іванов Ігор