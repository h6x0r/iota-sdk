# Анализ проекта: Readonly селекты и формы

## Проблема
До наших изменений селекты с атрибутом `readonly="true"` не работали корректно, поскольку HTML `<select>` элементы не поддерживают атрибут `readonly`. Они оставались полностью интерактивными.

## Где найти readonly селекты для тестирования

### 1. Currencies CRUD (✅ ГОТОВО)
**Путь:** `/currencies/{id}/edit`
**Поля:** 
- `status` - SelectField с опциями (Active, Inactive, Deprecated) - **READONLY**
- `created_at`, `updated_at` - DateTime поля - **READONLY**

**Как протестировать:**
```bash
cd /workspace
PORT=3201 go run ./cmd/server/main.go
# Открыть http://localhost:3201/currencies
```

### 2. Места в коде где используются селекты

#### ✅ Исправленные компоненты:
- `components/base/select.templ` - добавлена конвертация `readonly → disabled`
- `components/base/selects/search_select.templ` - аналогично

#### ❌ Требуют исправления:

**1. Combobox компонент:**
- `components/base/combobox.templ` (строки 86-95)
- Нужно добавить `disabled?={ props.Attrs["readonly"] == true }` к скрытому select и триггерам

**2. Checkbox/Radio/Switch компоненты:**
- `components/base/input/input.templ` - Checkbox (строка ~55)
- `components/base/radio/radio.templ` 
- `components/base/input/switch.templ`
- `components/base/slider/slider.templ`

**3. Placeholder реализации в форм-билдере:**
- `components/scaffold/form/fields.go` (строки 837-892) - comboboxField и searchSelectField

**4. Ручные формы в контроллерах:**
- `modules/core/presentation/controllers/{user,roles,group}_controller.go`
- `modules/finance/**/controllers/*_controller.go` 
- `modules/warehouse/**/controllers/*_controller.go`

### 3. Использование SelectField в модулях

**Найденные места с SelectField:**
- `modules/core/presentation/controllers/crud_controller.go` - основная логика обработки
- Тесты в `pkg/crud/field_select_test.go`

**Другие селекты в проекте:**
- `components/filters/default.templ` (строка 39) - скрытый select для фильтров
- `components/user/language-select.templ` - селект языков
- Combobox в различных формах финансового и складского модулей

## Техническое решение

### 1. Основной принцип
```go
// В template компонентах:
disabled?={ p.Attrs["readonly"] == true || p.Attrs["disabled"] == true }
```

### 2. CSS стили
```css
.form-control-input[readonly], select[disabled] {
    cursor: not-allowed;
    opacity: 0.7;
    background-color: #f3f4f6;
    pointer-events: none;
}
```

### 3. Серверная логика
В `crud_controller.go` строка 247:
```go
// Skip readonly fields - they should not be updated from form data
if field.Readonly() {
    continue
}
```

## План действий для полного исправления

### Приоритет 1 (критично):
1. ✅ `components/base/select.templ` - ГОТОВО
2. ✅ `components/base/selects/search_select.templ` - ГОТОВО  
3. ❌ `components/base/combobox.templ` - НУЖНО ИСПРАВИТЬ

### Приоритет 2 (важно):
4. ❌ `components/base/input/input.templ` (Checkbox)
5. ❌ `components/base/radio/radio.templ`
6. ❌ `components/base/input/switch.templ`
7. ❌ `components/base/slider/slider.templ`

### Приоритет 3 (желательно):
8. ❌ Обновить placeholder реализации в `components/scaffold/form/fields.go`
9. ❌ Добавить поддержку readonly в ручные формы модулей

## Тестирование

### Автоматические тесты:
- ✅ `crud_controller_readonly_css_test.go` - CSS тесты
- ✅ `crud_readonly_behavior_test.go` - поведенческие тесты  
- ✅ `e2e/cypress/e2e/readonly-fields.cy.js` - E2E тесты

### Ручное тестирование:
1. Открыть `demo-readonly-select.html` в браузере
2. Протестировать currencies форму в приложении
3. Проверить DevTools - должен быть атрибут `disabled="true"`

## Заключение

**Основная проблема решена** для базовых select компонентов. Readonly селекты теперь:
- Визуально отображаются как отключенные
- Блокируют пользовательское взаимодействие  
- Игнорируются при отправке формы
- Имеют правильные CSS стили

**Для полного решения** нужно применить тот же подход к остальным интерактивным компонентам (combobox, checkbox, radio, switch, slider).