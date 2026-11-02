# Backend API для «ЕГЭ Грамотность»

## Цель

Сейчас фронтенд работает без сервера: задания лежат в `src/data`, прогресс и ошибки — в
`localStorage`. Бэкенд нужен для авторизации, синхронизации прогресса между устройствами,
тетради ошибок и статистики.

## Рекомендуемый стек MVP

- REST API, JSON
- `GET/POST/PATCH/DELETE`
- PostgreSQL
- JWT access token + refresh token в HttpOnly cookie
- OpenAPI 3.1 (`/docs` или `/openapi.json`)
- Все даты в ISO 8601 UTC

Базовый URL:

```text
/api/v1
```

## 1. Авторизация

### `POST /auth/register`

```json
{
  "email": "student@example.com",
  "password": "strong-password",
  "name": "Ростислав"
}
```

Ответ `201`:

```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "Ростислав",
    "createdAt": "2026-11-02T18:00:00Z"
  },
  "accessToken": "jwt"
}
```

### `POST /auth/login`

Тело: `email`, `password`. Возвращает тот же объект, что и регистрация.

### `POST /auth/refresh`

Обновляет access token по refresh cookie.

### `POST /auth/logout`

Инвалидирует refresh token.

### `GET /me`

Возвращает текущего пользователя.

## 2. Профиль и прогресс

### `GET /me/progress`

```json
{
  "xp": 600,
  "totalSolved": 17,
  "correctCount": 17,
  "wrongCount": 0,
  "streak": 17,
  "bestStreak": 17,
  "taskStats": {
    "task9": {
      "solved": 10,
      "correct": 9,
      "accuracy": 90
    }
  },
  "updatedAt": "2026-11-02T18:00:00Z"
}
```

### `POST /me/progress/events`

Фиксирует один ответ пользователя. Это основной endpoint, который фронтенд вызывает после
каждого задания.

```json
{
  "idempotencyKey": "uuid",
  "taskId": "task9",
  "questionId": "orth-001",
  "answer": "о",
  "isCorrect": true,
  "mode": "sprint",
  "elapsedMs": 4200
}
```

Ответ должен вернуть уже пересчитанный прогресс:

```json
{
  "xpEarned": 15,
  "progress": {
    "xp": 615,
    "totalSolved": 18,
    "correctCount": 18,
    "wrongCount": 0,
    "streak": 18,
    "bestStreak": 18
  }
}
```

`idempotencyKey` обязателен: повторная отправка одного события не должна дважды начислять
XP и статистику.

### `POST /me/progress/reset`

Сбрасывает прогресс пользователя. Требует явного подтверждения на фронтенде.

## 3. Тетрадь ошибок

### `GET /me/mistakes?taskId=task9&limit=100&cursor=...`

### `POST /me/mistakes`

```json
{
  "questionId": "orth-001",
  "taskId": "task9",
  "question": "Вставьте пропущенную букву...",
  "userAnswer": "а",
  "correctAnswer": "о",
  "explanation": "Проверочное слово...",
  "source": "sprint"
}
```

Дубликаты по паре `(userId, questionId, taskId)` не создавать.

### `PATCH /me/mistakes/{mistakeId}`

```json
{
  "status": "mastered"
}
```

Статусы: `open`, `mastered`.

### `DELETE /me/mistakes/{mistakeId}`

Удаляет ошибку из тетради.

## 4. Задания и теория

На первом этапе можно оставить контент в репозитории фронтенда. Если нужно управлять
заданиями через админку, добавить:

### `GET /tasks?taskId=task9&mode=sprint&limit=20`

### `GET /tasks/{taskId}/{questionId}`

### `GET /theory?taskId=task9`

Ответ задания должен содержать `id`, `taskId`, `type`, `prompt`, `options`, `answer` и
`explanation`. Правильный ответ не отдавать до отправки ответа, если нужна честная
экзаменационная проверка.

## 5. Пробный экзамен

### `POST /exams`

```json
{
  "variant": "demo",
  "taskIds": ["task4", "task5", "task6", "task7", "task8", "task9"]
}
```

Ответ:

```json
{
  "id": "uuid",
  "status": "active",
  "durationSec": 1800,
  "startedAt": "2026-11-02T18:00:00Z",
  "tasks": [
    {
      "number": 1,
      "questionId": "task4-001",
      "taskId": "task4",
      "prompt": "..."
    }
  ]
}
```

### `POST /exams/{examId}/answers`

```json
{
  "questionId": "task4-001",
  "answer": "торты"
}
```

### `POST /exams/{examId}/finish`

Закрывает попытку, проверяет время и возвращает результат:

```json
{
  "examId": "uuid",
  "status": "finished",
  "score": 10,
  "total": 12,
  "percent": 83,
  "answers": [
    {
      "questionId": "task4-001",
      "isCorrect": true,
      "correctAnswer": "торты",
      "explanation": "..."
    }
  ]
}
```

## 6. Поиск

### `GET /search?q=деепричастие&limit=20`

Ищет по заданиям, теории, паронимам и словарю. До появления серверного контента фронтенд
может продолжать использовать локальный поиск.

## 7. Ошибки API

Единый формат:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректный email",
    "details": {
      "field": "email"
    },
    "requestId": "uuid"
  }
}
```

Минимальные коды: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`,
`CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

## 8. Минимальный MVP для первой интеграции

Сначала реализовать только:

1. `POST /auth/register`
2. `POST /auth/login`
3. `POST /auth/refresh`
4. `POST /auth/logout`
5. `GET /me`
6. `GET /me/progress`
7. `POST /me/progress/events`
8. `GET /me/mistakes`
9. `POST /me/mistakes`
10. `DELETE /me/mistakes/{mistakeId}`

Экзамены, поиск и серверную теорию подключить второй очередью.

## 9. Что не нужно выносить в API

- звуки и `Web Audio API`;
- визуальное перемешивание вариантов;
- открытие модальных окон;
- состояние активной вкладки;
- локальный UI;
- расчёт отображаемого уровня, если XP уже возвращает сервер.
