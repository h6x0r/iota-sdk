# Демонстрация Readonly Селектов

## Где найти readonly селекты в UI

### 1. Currencies CRUD (основная демонстрация)

**Эндпоинты:**
- Список: `http://localhost:3201/currencies`
- Создание: `http://localhost:3201/currencies/new`
- Редактирование: `http://localhost:3201/currencies/{id}/edit`

**Readonly поля в форме редактирования:**
- `status` - селект с опциями (Active, Inactive, Deprecated) - **READONLY**
- `created_at` - поле даты-времени - **READONLY**
- `updated_at` - поле даты-времени - **READONLY**

### 2. Как протестировать

1. **Запустить сервер:**
   ```bash
   cd /workspace
   PORT=3201 go run ./cmd/server/main.go
   ```

2. **Открыть в браузере:**
   ```
   http://localhost:3201/currencies
   ```

3. **Авторизация:**
   - Если потребуется логин, создать тестового пользователя или использовать существующего

4. **Проверить readonly поведение:**
   - Перейти к редактированию любой валюты
   - Поле `status` (селект) должно быть визуально отключено (серый фон, нет взаимодействия)
   - Поля `created_at` и `updated_at` также должны быть readonly

### 3. Технические детали

**Что исправлено:**
- `components/base/select.templ` - добавлена конвертация `readonly → disabled`
- `components/base/selects/search_select.templ` - аналогично
- CSS стили для визуального отображения readonly полей
- Серверная логика игнорирует readonly поля при отправке формы

**Что еще нужно исправить:**
- `components/base/combobox.templ` - не поддерживает readonly
- `components/base/input/switch.templ` - не поддерживает readonly  
- `components/base/radio/radio.templ` - не поддерживает readonly
- `components/base/slider/slider.templ` - не поддерживает readonly

### 4. Проверка в DevTools

1. Открыть DevTools (F12)
2. Перейти на форму редактирования валюты
3. Найти элемент селекта для поля `status`
4. Убедиться, что у него есть атрибут `disabled="true"`
5. Попробовать кликнуть - селект не должен открываться
6. Проверить CSS - должны применяться стили для disabled состояния

### 5. Cypress тесты

Запустить E2E тесты:
```bash
cd e2e
npx cypress run --spec "cypress/e2e/readonly-fields.cy.js"
```

Или в интерактивном режиме:
```bash
cd e2e  
npx cypress open
```