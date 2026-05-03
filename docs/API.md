# HTTP API (f2e-front) — методы, типы, примеры

Конфиг эндпоинтов: [`src/config/api/endpoints.ts`](../src/config/api/endpoints.ts). Пути указаны относительно базы **`API_URL`** (часто `/api/`). Типы: [`src/entities/`](../src/entities/).

Для методов без явного типа на фронте приведён **ожидаемый** или **условный** пример — сверять с бэкендом.

---

## Аутентификация и пользователь

### POST `auth/login/`

| | |
|--|--|
| **Запрос** | `LoginRequestServer` — [`entities/auth/server.ts`](../src/entities/auth/server.ts) |
| **Ответ** | `BackendAuthResponse` |

**Пример запроса**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Пример ответа**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "dancer",
    "first_name": "Иван",
    "middle_name": "Иванович",
    "last_name": "Иванов",
    "avatar": null,
    "city": "Москва",
    "dance_level": "beginner",
    "role": "student",
    "survey_completed": false,
    "teacher": null,
    "favorite_course_ids": [],
    "favorite_teacher_ids": []
  },
  "access": "<jwt-access>",
  "refresh": "<jwt-refresh>"
}
```

---

### POST `auth/register/`

| | |
|--|--|
| **Запрос** | `RegisterRequestServer` |
| **Ответ** | `BackendAuthResponse` |

**Пример запроса**

```json
{
  "email": "new@example.com",
  "username": "newuser",
  "first_name": "Мария",
  "middle_name": "",
  "last_name": "Петрова",
  "phone": "+79991234567",
  "password": "Pass123!",
  "password_confirm": "Pass123!"
}
```

**Пример ответа** — как у `POST auth/login/` (`user` + `access` + `refresh`).

---

### POST `auth/refresh/`

| | |
|--|--|
| **Запрос** | `RefreshTokenRequestServer` |
| **Ответ** | `RefreshTokenResponseServer` |

**Пример запроса**

```json
{
  "refresh": "<jwt-refresh>"
}
```

**Пример ответа**

```json
{
  "access": "<new-jwt-access>",
  "refresh": "<optional-new-refresh>"
}
```

---

### POST `auth/logout/`

| | |
|--|--|
| **Запрос** | `LogoutRequestServer` |
| **Ответ** | на фронте ожидается объект с полем `detail` (см. `UserStore`), точный тип не в `entities` |

**Пример запроса**

```json
{
  "refresh": "<jwt-refresh>"
}
```

**Пример ответа**

```json
{
  "detail": "Успешный выход из системы"
}
```

---

### GET `user/`

| | |
|--|--|
| **Запрос** | тело нет |
| **Ответ** | `BackendUser` — [`entities/user/server.ts`](../src/entities/user/server.ts) |

**Пример ответа**

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "dancer",
  "first_name": "Иван",
  "middle_name": "Иванович",
  "last_name": "Иванов",
  "avatar": "/media/u/1.jpg",
  "city": "Москва",
  "dance_level": "intermediate",
  "role": "student",
  "survey_completed": true,
  "teacher": null,
  "favorite_course_ids": [1, 5],
  "favorite_teacher_ids": [11],
  "preferred_time_from": "18:00",
  "preferred_time_to": "23:59",
  "preferred_weekdays": ["mon", "wed"],
  "preferred_dance_styles": ["High Heels"]
}
```

---

### PATCH `user/`

| | |
|--|--|
| **Запрос** | `multipart/form-data`: поля `username`, `first_name`, `middle_name`, `last_name`, опционально `avatar_file` (файл) — см. [`ProfilePageStore.saveProfile`](../src/store/ProfilePageStore/ProfilePageStore.ts) |
| **Ответ** | `BackendUser` |

Пример как **ключи формы** (не JSON): `username`, `first_name`, `middle_name`, `last_name`, `avatar_file` (опционально).

**Пример ответа** — как у `GET user/`.

---

### PATCH `user/survey/`

| | |
|--|--|
| **Запрос** | логика фронта строит `SurveySubmitPayload` / ожидание бэка в духе `SurveySubmitPayloadServer` — [`entities/survey/server.ts`](../src/entities/survey/server.ts) |
| **Ответ** | зависит от бэкенда (часто обновлённый пользователь или `{ "status": "ok" }`) |

**Пример запроса** (snake_case, как типы сервера)

```json
{
  "city": "Москва",
  "level": "beginner",
  "preferred_weekdays": ["mon", "wed"],
  "preferred_time_from": "18:00",
  "preferred_time_to": "23:59",
  "price_from": 5000,
  "price_to": 15000,
  "role": "student",
  "preferred_dance_styles": ["High Heels", "Contemporary"]
}
```

**Пример ответа**

```json
{
  "detail": "OK"
}
```

---

### PATCH `user/preferences/`

| | |
|--|--|
| **Запрос** | на фронте тип не заведён; по смыслу близко к `SurveyPreferencePayloadServer` |
| **Ответ** | по контракту бэка |

**Пример запроса**

```json
{
  "city": "Санкт-Петербург",
  "level": "advanced",
  "preferred_weekdays": ["sat", "sun"],
  "preferred_time_from": "12:00",
  "preferred_time_to": "18:00",
  "price_from": 8000,
  "price_to": 20000
}
```

**Пример ответа**

```json
{
  "detail": "updated"
}
```

---

### PUT `user/skills/`

| | |
|--|--|
| **Запрос** | массив `SurveySkillPayloadServer[]` (логически) |
| **Ответ** | по контракту бэка |

**Пример запроса**

```json
[
  { "dance_style_id": 2, "level": "intermediate" },
  { "dance_style_id": 5, "level": "beginner" }
]
```

**Пример ответа**

```json
{
  "detail": "skills saved"
}
```

---

### POST `user/flag`

| | |
|--|--|
| **Запрос** | на фронте есть `FlagParamsType` (`name`, `value`) — [`entities/user/client.ts`](../src/entities/user/client.ts); тело к API может быть в snake_case на бэке |
| **Ответ** | по контракту бэка |

**Пример запроса**

```json
{
  "name": "onboarding_seen",
  "value": true
}
```

**Пример ответа**

```json
{
  "detail": "ok"
}
```

---

### POST `user/restart`

| | |
|--|--|
| **Запрос** | тип не задан на фронте |
| **Ответ** | по контракту бэка |

**Пример запроса**

```json
{}
```

**Пример ответа**

```json
{
  "detail": "restarted"
}
```

---

## Справочники

### GET `cities/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `CityServer[]` — [`entities/city/server.ts`](../src/entities/city/server.ts) |

**Пример ответа**

```json
[
  { "id": 1, "name": "Москва" },
  { "id": 2, "name": "Санкт-Петербург" }
]
```

---

### GET `dance-styles/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `BackendDanceStyle[]` — [`entities/danceStyle/server.ts`](../src/entities/danceStyle/server.ts) |

**Пример ответа**

```json
[
  { "id": 1, "name": "High Heels", "slug": "high-heels" },
  { "id": 2, "name": "Contemporary", "slug": "contemporary" }
]
```

---

### GET `studios/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `StudioServer[]` — [`entities/studio/server.ts`](../src/entities/studio/server.ts) |

**Пример ответа**

```json
[
  {
    "id": 3,
    "name": "ТанцХаб",
    "city": "Москва",
    "address": "ул. Примерная, 1",
    "metro": "Павелецкая"
  }
]
```

---

## Карта

### GET `map/points/`

| | |
|--|--|
| **Query** | опционально: `city`, `metro`, `studio`, `style` — строки, значения через запятую — [`MapPageStore`](../src/store/MapPageStore/MapPageStore.ts) |
| **Ответ** | `MapPointsResponseServer` (`MapPointServer[]`) — [`entities/mapPoint/server.ts`](../src/entities/mapPoint/server.ts) |

**Пример ответа**

```json
[
  {
    "id": 10,
    "name": "ТанцХаб",
    "city": "Москва",
    "address": "ул. Примерная, 1",
    "metro": "Павелецкая",
    "lat": 55.71,
    "lng": 37.63,
    "image": "/media/studios/10.jpg",
    "halls_count": 4,
    "active_courses_count": 12,
    "dance_styles": ["High Heels", "Contemporary"]
  }
]
```

---

## Календарь

### GET `calendar/`

| | |
|--|--|
| **Query** | `mode`: `all` \| `enrolled` \| `teaching` |
| **Ответ** | `CalendarEventsResponseServer` — [`entities/calendar/server.ts`](../src/entities/calendar/server.ts) |

**Пример ответа**

```json
[
  {
    "id": 101,
    "course_id": 5,
    "course_name": "High Heels PRO",
    "teacher_name": "Карпова Ксения",
    "dance_style": "High Heels",
    "level": "advanced",
    "lesson_date": "2026-03-05",
    "time_from": "20:00",
    "time_to": "21:30",
    "start": "2026-03-05T20:00:00",
    "end": "2026-03-05T21:30:00",
    "location_text": "м. Павелецкая",
    "status": "scheduled",
    "studio": "ТанцХаб",
    "city": "Москва"
  }
]
```

---

## Курсы

### GET `courses/`

| | |
|--|--|
| **Запрос** | на фронте без query; бэкенд может принимать фильтры |
| **Ответ** | `CourseListResponseServer` = `CourseListItemServer[]` **или** `{ "results": CourseListItemServer[] }` — [`entities/courses/server.ts`](../src/entities/courses/server.ts) |

**Пример ответа (массив)**

```json
[
  {
    "id": 1,
    "name": "High Heels PRO Intensive",
    "level": "advanced",
    "price": 15000,
    "date_from": "2026-02-17",
    "date_to": "2026-03-04",
    "status": "active",
    "image": "/media/courses/1.jpg",
    "teacher_id": 11,
    "teacher_name": "Карпова Ксения",
    "dance_style": "High Heels",
    "city": "Москва",
    "studio": "ТанцХаб",
    "schedule": [{ "weekday": "Пн, Ср", "time_from": "20:00", "time_to": "21:30" }],
    "spots_left": 6
  }
]
```

**Пример ответа (объект с results)**

```json
{
  "results": [
    {
      "id": 1,
      "name": "High Heels PRO Intensive",
      "level": "advanced",
      "price": 15000,
      "date_from": "2026-02-17",
      "date_to": "2026-03-04",
      "image": "/media/courses/1.jpg",
      "teacher_name": "Карпова Ксения",
      "dance_style": "High Heels",
      "city": "Москва",
      "studio": "ТанцХаб",
      "schedule": [],
      "spots_left": 6
    }
  ]
}
```

---

### POST `courses/`

| | |
|--|--|
| **Запрос** | JSON **или** `multipart/form-data` — см. [`ProfilePageStore._buildCoursePayload`](../src/store/ProfilePageStore/ProfilePageStore.ts); расписание: `weekday`=`mon`\|…[`entities/course/config.ts`](../src/entities/course/config.ts) |
| **Ответ** | `CourseDetailServer` — [`entities/course/server.ts`](../src/entities/course/server.ts) |

**Пример запроса (JSON)**

```json
{
  "dance_style_id": 1,
  "studio_id": 3,
  "name": "Новый курс",
  "description": "Описание",
  "music_url": "https://open.spotify.com/track/...",
  "level": "beginner",
  "price": 8000,
  "capacity": 20,
  "date_from": "2026-04-01",
  "date_to": "2026-05-30",
  "status": "published",
  "schedule": [
    {
      "weekday": "tue",
      "time_from": "19:00",
      "time_to": "20:30",
      "location_text": "м. Таганская"
    }
  ],
  "image_cover": "",
  "ordered_image_urls": []
}
```

**Пример запроса (multipart)** — те же поля строками + `schedule` как **JSON-строка** + несколько файлов `image_files`.

**Пример ответа**

```json
{
  "id": 42,
  "name": "Новый курс",
  "description": "Описание",
  "level": "beginner",
  "price": 8000,
  "capacity": 20,
  "spots_left": 20,
  "date_from": "2026-04-01",
  "date_to": "2026-05-30",
  "status": "active",
  "images": ["/media/c/42-1.jpg"],
  "teacher_id": 11,
  "teacher_name": "Карпова Ксения",
  "dance_style": "High Heels",
  "city": "Москва",
  "studio": "ТанцХаб",
  "schedule": [
    {
      "weekday": "Вт",
      "time_from": "19:00",
      "time_to": "20:30",
      "location": "м. Таганская"
    }
  ],
  "music": { "artist": "", "track": "", "url": "https://open.spotify.com/track/..." }
}
```

---

### GET `courses/:id/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `CourseDetailServer` |

**Пример ответа**

```json
{
  "id": 1,
  "name": "High Heels PRO Intensive",
  "description": "Интенсив.",
  "level": "advanced",
  "price": 15000,
  "capacity": 20,
  "spots_left": 6,
  "date_from": "2026-02-17",
  "date_to": "2026-03-04",
  "status": "active",
  "images": ["/media/c1.jpg", "/media/c2.jpg"],
  "teacher_id": 11,
  "teacher_name": "Карпова Ксения",
  "dance_style": "High Heels",
  "city": "Москва",
  "studio": "ТанцХаб",
  "schedule": [
    {
      "weekday": "Пн, Ср",
      "time_from": "20:00",
      "time_to": "21:30",
      "location": "м. Павелецкая"
    }
  ],
  "music": {
    "artist": "Tinashe",
    "track": "Needs",
    "url": "https://open.spotify.com/track/1..."
  }
}
```

---

### PATCH `courses/:id/`

| | |
|--|--|
| **Запрос** | частичное обновление: как POST (полный объект) или минимально, например только статус |
| **Ответ** | `CourseDetailServer` |

**Пример запроса (завершить курс)**

```json
{
  "status": "completed"
}
```

**Пример ответа** — как `GET courses/:id/`, с обновлёнными полями.

---

### DELETE `courses/:id/`

| | |
|--|--|
| **Запрос** | нет / по бэку |
| **Ответ** | тип не описан на фронте |

**Пример ответа**

```json
{
  "detail": "deleted"
}
```

---

### GET `courses/:id/students/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `CourseStudentsResponseServer` — [`entities/courseStudents/server.ts`](../src/entities/courseStudents/server.ts) |

**Пример ответа**

```json
[
  {
    "enrollment_id": 7,
    "user_id": 3,
    "full_name": "Алина Волкова",
    "email": "student@example.com",
    "phone": "+79991234567",
    "dance_level": "intermediate",
    "enrolled_at": "2026-02-01T10:00:00Z",
    "status": "active",
    "paid": true
  }
]
```

---

### GET `courses/:id/lessons/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `CourseLessonsResponseServer` — [`entities/courseLessons/server.ts`](../src/entities/courseLessons/server.ts) |

**Пример ответа**

```json
[
  {
    "id": 1001,
    "course_id": 1,
    "lesson_date": "2026-03-03",
    "time_from": "20:00",
    "time_to": "21:30",
    "location_text": "м. Павелецкая",
    "status": "scheduled",
    "hall": "Зал 2"
  }
]
```

---

### GET `courses/:id/attendance/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `CourseAttendanceResponseServer` — [`entities/courseAttendance/server.ts`](../src/entities/courseAttendance/server.ts) |

**Пример ответа**

```json
[
  {
    "id": 5001,
    "lesson_id": 1001,
    "lesson_date": "2026-03-03",
    "course_id": 1,
    "course_name": "High Heels PRO",
    "student_id": 3,
    "student_name": "Алина В.",
    "status": "present",
    "marked_at": "2026-03-03T20:05:00Z"
  }
]
```

---

### GET `courses/:id/attendance-stats/`

| | |
|--|--|
| **Query** | опционально `date_from`, `date_to` — `YYYY-MM-DD` |
| **Ответ** | `CourseAttendanceStatsServer` — [`entities/courseAttendanceStats/server.ts`](../src/entities/courseAttendanceStats/server.ts) |

**Пример ответа**

```json
{
  "total_lessons": 10,
  "conducted_lessons": 8,
  "cancelled_lessons": 2,
  "avg_attendance_percent": 82.5,
  "total_students": 12,
  "per_lesson": [
    {
      "lesson_id": 1001,
      "date": "2026-03-03",
      "present": 10,
      "absent": 2,
      "total": 12,
      "percent": 83.33
    }
  ],
  "per_student": [
    {
      "student_id": 3,
      "student_name": "Алина Волкова",
      "attended": 8,
      "missed": 0,
      "total": 8,
      "percent": 100.0
    }
  ]
}
```

---

### POST `courses/:id/enroll/`

| | |
|--|--|
| **Запрос** | тело пустое на странице курса [`CoursePage`](../src/pages/CoursePage/CoursePage.tsx) |
| **Ответ** | `CourseDetailServer` |

**Пример ответа** — как `GET courses/:id/` (может отличаться статус записи через поля курса).

---

### DELETE `courses/:id/enroll/`

| | |
|--|--|
| **Запрос** | пустое |
| **Ответ** | `void`/пустое тело типизированы на фронте |

---

### POST `favorite-courses/:id/`

| | |
|--|--|
| **Запрос** | нет на фронте в реальном вызове (мок) |
| **Ответ** | не типизирован |

**Пример ответа**

```json
{
  "detail": "added"
}
```

---

### DELETE `favorite-courses/:id/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | не типизирован |

**Пример ответа**

```json
{
  "detail": "removed"
}
```

---

## Занятия (lessons)

### POST `lessons/:id/cancel/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `CourseLessonServer` |

**Пример ответа**

```json
{
  "id": 1001,
  "course_id": 1,
  "lesson_date": "2026-03-03",
  "time_from": "20:00",
  "time_to": "21:30",
  "location_text": "м. Павелецкая",
  "status": "cancelled",
  "hall": null
}
```

---

### POST `lessons/:id/attendance/mark/`

| | |
|--|--|
| **Запрос** | `MarkAttendancePayloadServer` |
| **Ответ** | `CourseAttendanceServer` |

**Пример запроса**

```json
{
  "student_id": 3,
  "status": "present"
}
```

**Пример ответа**

```json
{
  "id": 5002,
  "lesson_id": 1001,
  "lesson_date": "2026-03-03",
  "course_id": 1,
  "course_name": "High Heels PRO",
  "student_id": 3,
  "student_name": "Алина В.",
  "status": "present",
  "marked_at": "2026-03-03T20:06:00Z"
}
```

---

### PATCH `lessons/:id/`

| | |
|--|--|
| **Запрос** | тип не задан на фронте |
| **Ответ** | по бэку |

**Пример запроса**

```json
{
  "time_from": "20:15",
  "time_to": "21:45",
  "location_text": "Новый адрес"
}
```

**Пример ответа**

```json
{
  "id": 1001,
  "course_id": 1,
  "lesson_date": "2026-03-03",
  "time_from": "20:15",
  "time_to": "21:45",
  "location_text": "Новый адрес",
  "status": "scheduled",
  "hall": null
}
```

---

## Записи студента

### GET `enrollments/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `CourseDetailServer[]` (список «Мои записи») |

**Пример ответа** — массив объектов формы **`CourseDetailServer`** (см. пример `GET courses/:id/`).

---

### GET `my-courses/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | массив с вложенным `course.id` и `status` записи — [`CoursePage`](../src/pages/CoursePage/CoursePage.tsx) |

**Пример ответа**

```json
[
  { "course": { "id": 1 }, "status": "active" },
  { "course": { "id": 5 }, "status": "pending" }
]
```

(`status`: на фронте ожидаются значения вроде `active`, `completed`, `cancelled`, `pending` — см. `EnrollmentStatus` в [`config/users.ts`](../src/config/users.ts).)

---

## Преподаватели

### GET `teachers/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | на фронте для элементов каталога уместно `BackendTeacherListItem[]` — [`entities/teacher/server.ts`](../src/entities/teacher/server.ts); фактический формат списка — уточнять по бэку |

**Пример ответа**

```json
[
  {
    "id": 11,
    "full_name": "Карпова Ксения",
    "bio": "High Heels",
    "experience_years": 5,
    "rating_avg": 4.8,
    "rating_count": 24,
    "city": "Москва"
  }
]
```

---

### POST `teachers/`

| | |
|--|--|
| **Запрос** | тип не описан на фронте |
| **Ответ** | по контракту бэка |

**Пример запроса**

```json
{
  "user_id": 5,
  "bio": "Преподаю коммерческую хореографию",
  "experience_years": 5,
  "specializations": ["High Heels"]
}
```

**Пример ответа**

```json
{
  "id": 11,
  "user_id": 5,
  "full_name": "Карпова Ксения"
}
```

---

### GET `teachers/:id/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `BackendTeacher` — [`entities/teacher/server.ts`](../src/entities/teacher/server.ts) |

**Пример ответа**

```json
{
  "id": 11,
  "user_id": 5,
  "full_name": "Карпова Ксения",
  "name": "Карпова Ксения",
  "email": "kseniya@example.com",
  "avatar": "/media/avatars/11.jpg",
  "city": "Москва",
  "bio": "Преподаватель High Heels",
  "images": ["/media/t/1.jpg"],
  "experience": 5,
  "rating": "4.8",
  "specializations": ["High Heels"],
  "achievements": ["Победитель фестиваля"],
  "reviews": [
    {
      "id": 1,
      "author_name": "Студент",
      "rating": 5,
      "text": "Отличный курс",
      "created_at": "2026-01-15T12:00:00Z"
    }
  ],
  "courses": [
    {
      "id": 1,
      "name": "High Heels PRO",
      "dance_style": "High Heels",
      "level": "advanced",
      "price": 15000,
      "date_from": "2026-02-17",
      "date_to": "2026-03-04",
      "status": "active",
      "studio": "ТанцХаб"
    }
  ]
}
```

---

### PUT `teachers/:id/`

| | |
|--|--|
| **Запрос** | JSON: `bio`, `images`, `achievements`, `experience`, `specializations` — [`ProfilePageStore.saveProfile`](../src/store/ProfilePageStore/ProfilePageStore.ts) |
| **Ответ** | ожидается профиль преподавателя; на типах фронта — близко к `BackendTeacherProfile` + идентификатор сущности |

**Пример запроса**

```json
{
  "bio": "Обновлённое описание",
  "images": ["/media/t/a.jpg", "/media/t/b.jpg"],
  "achievements": ["Награда 2025"],
  "experience": 6,
  "specializations": ["High Heels", "Stretching"]
}
```

**Пример ответа**

```json
{
  "bio": "Обновлённое описание",
  "images": ["/media/t/a.jpg"],
  "achievements": ["Награда 2025"],
  "experience": 6,
  "specializations": ["High Heels", "Stretching"],
  "rating": 4.9
}
```

---

### GET `my-teaching-courses/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | `CourseDetailServer[]` |

**Пример ответа**

```json
[
  {
    "id": 1,
    "name": "Мой курс",
    "description": "...",
    "level": "beginner",
    "price": 8000,
    "capacity": 15,
    "spots_left": 10,
    "date_from": "2026-04-01",
    "date_to": "2026-06-01",
    "status": "active",
    "images": [],
    "teacher_name": "Карпова Ксения",
    "dance_style": "High Heels",
    "city": "Москва",
    "studio": "ТанцХаб",
    "schedule": [],
    "music": { "artist": "", "track": "", "url": "" }
  }
]
```

---

### POST `favorite-teachers/:id/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | не типизирован |

**Пример ответа**

```json
{
  "detail": "favorite added"
}
```

---

### DELETE `favorite-teachers/:id/`

| | |
|--|--|
| **Запрос** | нет |
| **Ответ** | не типизирован |

**Пример ответа**

```json
{
  "detail": "favorite removed"
}
```

---

## Справка по файлам типов

| Тема | Где типы |
|------|----------|
| Логин / регистрация / токены | `entities/auth/server.ts` |
| Пользователь | `entities/user/server.ts` |
| Анкета | `entities/survey/server.ts` |
| Список курсов | `entities/courses/server.ts` |
| Деталь курса | `entities/course/server.ts` |
| Уроки / студенты / посещаемость / статы | `entities/courseLessons`, `courseStudents`, `courseAttendance`, `courseAttendanceStats` |
| Преподаватель | `entities/teacher/server.ts` |
| Календарь / карта / города / студии / стили | `entities/calendar`, `mapPoint`, `city`, `studio`, `danceStyle` |

При смене контракта бэкенда обновляйте `entities/*/server.ts` и примеры в этом файле.
