#  Money Tracker

Полноценное веб-приложение для учёта личных финансов с красивым графическим интерфейсом и REST API на Spring Boot.

![Java](https://img.shields.io/badge/Java-17+-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.3-green)
![License](https://img.shields.io/badge/License-MIT-blue)

##  Возможности

-  **Дашборд** — общий обзор доходов, расходов и баланса с визуализацией расходов по категориям
-  **Управление транзакциями** — добавление, редактирование, удаление и фильтрация транзакций
-  **Управление категориями** — создание и редактирование категорий доходов и расходов
-  **Адаптивный дизайн** — корректно отображается на десктопе, планшете и мобильном
-  **Современный UI** — чистый и красивый интерфейс без сторонних UI-фреймворков

## Технологии

### Backend
- Java 17
- Spring Boot 4.0.3
- Spring Data JPA + Hibernate
- H2 Database (in-memory)
- Lombok
- Jakarta Bean Validation

### Frontend
- HTML5 + CSS3 + Vanilla JavaScript
- Font Awesome иконки
- Inter (Google Fonts)
- Адаптивная верстка (CSS Grid + Flexbox)

##  Запуск

### Требования
- Java 17+ установлена (`java -version` для проверки)

### Запуск из терминала
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw spring-boot:run
```

### Запуск из IntelliJ IDEA
1. Откройте проект в IDEA
2. Откройте `MoneyTrakerApplication.java`
3. Нажмите ▶ (Run) или `Shift+F10`

Приложение запустится на `http://localhost:8080`

###  Графический интерфейс

После запуска откройте в браузере: **http://localhost:8080**

Вы увидите:
- **Дашборд** — карточки с доходами/расходами/балансом + график расходов по категориям + последние транзакции
- **Транзакции** — таблица всех транзакций с фильтрами по типу и дате
- **Категории** — карточки всех категорий с возможностью редактирования

## API Эндпоинты

### Категории — `/api/categories`

| Метод    | URL                    | Описание            |
|----------|------------------------|---------------------|
| `GET`    | `/api/categories`      | Все категории       |
| `GET`    | `/api/categories/{id}` | Категория по ID     |
| `POST`   | `/api/categories`      | Создать категорию   |
| `PUT`    | `/api/categories/{id}` | Обновить категорию  |
| `DELETE` | `/api/categories/{id}` | Удалить категорию   |

### Транзакции — `/api/transactions`

| Метод    | URL                         | Описание                     |
|----------|-----------------------------|------------------------------|
| `GET`    | `/api/transactions`         | Все транзакции (с фильтрами) |
| `GET`    | `/api/transactions/{id}`    | Транзакция по ID             |
| `POST`   | `/api/transactions`         | Создать транзакцию           |
| `PUT`    | `/api/transactions/{id}`    | Обновить транзакцию          |
| `DELETE` | `/api/transactions/{id}`    | Удалить транзакцию           |
| `GET`    | `/api/transactions/summary` | Финансовая сводка            |

### Фильтрация транзакций

```
GET /api/transactions?type=EXPENSE
GET /api/transactions?type=INCOME
GET /api/transactions?from=2026-03-01&to=2026-03-31
GET /api/transactions?type=EXPENSE&from=2026-03-01&to=2026-03-31
```

## Примеры запросов

### Создать категорию
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Health", "type": "EXPENSE"}'
```

### Создать транзакцию
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "type": "EXPENSE",
    "categoryId": 1,
    "description": "Lunch",
    "date": "2026-03-04"
  }'
```

### Получить сводку
```bash
curl http://localhost:8080/api/transactions/summary
```

Пример ответа:
```json
{
  "totalIncome": 175000.00,
  "totalExpenses": 26700.00,
  "balance": 148300.00,
  "spendingByCategory": {
    "Bills": 15000.00,
    "Entertainment": 2000.00,
    "Food": 3500.00,
    "Shopping": 5000.00,
    "Transport": 1200.00
  }
}
```

## H2 Console

В браузере откройте: `http://localhost:8080/h2-console`

- **JDBC URL:** `jdbc:h2:mem:moneytracker`
- **User:** `sa`
- **Password:** *(пустой)*

## Начальные данные

При запуске автоматически создаются:

**Категории расходов:** Food, Transport, Entertainment, Shopping, Bills  
**Категории доходов:** Salary, Freelance, Investment  
**7 демо-транзакций** для примера

##  Тестирование

### Через графический интерфейс
1. Запустите приложение (`.\mvnw.cmd spring-boot:run`)
2. Откройте `http://localhost:8080` в браузере
3. На **Дашборде** вы увидите сводку по доходам/расходам
4. Нажмите **"Новая транзакция"** — создайте транзакцию
5. Перейдите на вкладку **"Транзакции"** — отфильтруйте по типу/дате
6. Перейдите на вкладку **"Категории"** — добавьте/редактируйте категорию

### Через curl (REST API)
```bash
# Получить все транзакции
curl http://localhost:8080/api/transactions

# Создать транзакцию
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 500, "type": "EXPENSE", "categoryId": 1, "description": "Кофе", "date": "2026-03-04"}'

# Получить сводку
curl http://localhost:8080/api/transactions/summary
```

### Юнит-тесты
```bash
.\mvnw.cmd test
```

##  Публикация на GitHub

```bash
# 1. Инициализация Git (если ещё не сделано)
git init

# 2. Добавить все файлы
git add .

# 3. Первый коммит
git commit -m "Initial commit: Money Tracker with GUI"

# 4. Добавить удалённый репозиторий (создайте репозиторий на GitHub: github.com/new)
git remote add origin https://github.com/monreala/money_traker.git

# 5. Отправить на GitHub
git branch -M main
git push -u origin main
```



**monreala** — [github.com/monreala](https://github.com/monreala)

