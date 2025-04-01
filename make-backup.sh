#!/bin/bash

# === НАСТРОЙКИ ===
MAX_BACKUPS=5          # Сколько последних бэкапов хранить
TAG_PREFIX="backup-"   # Префикс тега
REMOTE_NAME="origin"   # Название удалённого репозитория

# === ПРОВЕРКА НЕЗАКОММИЧЕННЫХ ИЗМЕНЕНИЙ ===
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  У вас есть незакоммиченные изменения."
  read -p "Хотите закоммитить их перед созданием бэкапа? (y/n): " answer

  if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
    read -p "Введите комментарий к коммиту: " commit_msg
    git add .
    git commit -m "$commit_msg"
    echo "✅ Изменения закоммичены."
  else
    echo "❌ Бэкап прерван: необходимо чистое состояние или коммит."
    exit 1
  fi
fi

# === СОЗДАНИЕ ТЕГА ===
timestamp=$(date +"%Y%m%d-%H%M")
tag_name="${TAG_PREFIX}${timestamp}"

read -p "Введите комментарий для бэкапа (тега): " tag_msg

git tag -a "$tag_name" -m "$tag_msg"
git push "$REMOTE_NAME" "$tag_name"

echo "✅ Бэкап сохранён как тег: $tag_name"

# === ОЧИСТКА СТАРЫХ ТЕГОВ ===
echo "🧹 Проверка на количество старых бэкапов..."

# Получаем список всех тегов с нужным префиксом, отсортированный по дате
old_tags=$(git tag --sort=-creatordate | grep "^$TAG_PREFIX" | tail -n +$((MAX_BACKUPS + 1)))

if [[ -n "$old_tags" ]]; then
  echo "Удаляются старые теги:"
  echo "$old_tags"

  # Удаляем локально и на удалёнке
  for tag in $old_tags; do
    git tag -d "$tag"
    git push "$REMOTE_NAME" --delete "$tag"
  done

  echo "✅ Удалены старые теги, оставлено $MAX_BACKUPS последних бэкапов."
else
  echo "👌 Нет старых бэкапов для удаления."
fi