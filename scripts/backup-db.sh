#!/bin/sh
# Sauvegarde quotidienne de la base Postgres du conteneur `db`.
# Installation sur le VPS (crontab -e) :
#   0 3 * * * /chemin/vers/scripts/backup-db.sh >> /var/log/egbm-backup.log 2>&1
set -eu

BACKUP_DIR="${BACKUP_DIR:-/var/backups/egbm}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

docker compose exec -T db pg_dump -U egbm egbm | gzip > "$BACKUP_DIR/egbm_$STAMP.sql.gz"

find "$BACKUP_DIR" -name "egbm_*.sql.gz" -mtime "+$KEEP_DAYS" -delete

echo "Backup written to $BACKUP_DIR/egbm_$STAMP.sql.gz"
