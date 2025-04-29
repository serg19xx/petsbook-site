#!/bin/bash

TAG_PREFIX="backup-"

# Считываем все теги
all_tags=$(git tag)

# Фильтруем нужные теги
filtered_tags=()
while IFS= read -r tag; do
  if [[ "$tag" == "$TAG_PREFIX"* ]]; then
    filtered_tags+=("$tag")
  fi
done <<< "$all_tags"

# Проверка наличия
if [[ ${#filtered_tags[@]} -eq 0 ]]; then
  echo "❌ Нет ни одного тега с префиксом '$TAG_PREFIX'."
  exit 1
fi

# Сортируем по имени (алфавитно = по дате в вашем формате)
IFS=$'\n' sorted=($(printf "%s\n" "${filtered_tags[@]}" | sort -r))
unset IFS

latest_tag="${sorted[0]}"
echo "🔄 Восстанавливаем последний бэкап: $latest_tag"

# Предупреждение об изменениях
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  Есть незакоммиченные изменения. Они будут УДАЛЕНЫ!"
fi

# Подтверждение
read -p "Точно восстановить эту версию? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "❌ Операция отменена."
  exit 0
fi

# Откат
git reset --hard "$latest_tag"

echo "✅ Готово. Вы на версии: $latest_tag"