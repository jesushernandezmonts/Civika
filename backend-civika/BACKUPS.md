# 🗄️ Guía de Respaldos y Restauración - CIVIKA

Este documento describe la estrategia de respaldo y restauración de la base de datos PostgreSQL del sistema Civika.

## Crear un respaldo

```bash
./scripts/backup.sh
```

El archivo generado tendrá el formato:

```
civika_backup_YYYYMMDD_HHMMSS.sql.gz
```

## Restaurar un respaldo

```bash
./scripts/restore.sh ./backups/civika_backup_20260721_120000.sql.gz
```

## Automatizar con cron

```bash
0 3 * * * /bin/bash /ruta/al/proyecto/backend-civika/scripts/backup.sh >> /var/log/civika_backup.log 2>&1
```

## Subir a S3 (opcional)

```bash
aws s3 sync ./backups/ s3://tu-bucket-civika-backups/ --delete
```
