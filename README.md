# 💰 Money Tracker

REST API приложение для учёта личных финансов на Spring Boot.

## Технологии

- Java 17
- Spring Boot 4.0.3
- Spring Data JPA + Hibernate
- H2 Database (in-memory)
- Lombok
- Jakarta Bean Validation

## Запуск

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

