#!/bin/bash

# Префикс тегов резервных копий
TAG_PREFIX="backup-"

# Получаем самый последний тег, сортируя по дате создания
latest_tag=$(git tag --sort=-creatordate | grep "^$TAG_PREFIX" | head -n 1)

# Проверка: существует ли такой тег
if [[ -z "$latest_tag" ]]; then
  echo "❌ Не найдено ни одного тега с префиксом '$TAG_PREFIX'."
  exit 1
fi

echo "🔄 Последний резервный тег найден: $latest_tag"

# Подтверждение
read -p "Вы действительно хотите восстановиться к этой версии? Это удалит текущие изменения. (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "❌ Операция отменена."
  exit 0
fi

# Сброс ветки на найденный тег
git reset --hard "$latest_tag"

echo "✅ Восстановление завершено. Вы на версии: $latest_tag"