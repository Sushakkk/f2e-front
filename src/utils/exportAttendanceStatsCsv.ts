import type { AttendanceStats } from 'config/teacher';
import { formatRu } from 'utils/dateUtils';

const escapeCsvField = (value: string): string => {
  if (/[;"\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

/**
 * Текст CSV в двух секциях, как на экране «Статистика»: таблица «По занятиям», затем «По ученикам».
 * Разделитель — точка с запятой (удобно для Excel с русской локалью). В начале — BOM UTF-8.
 */
export function buildAttendanceStatsCsvContent(stats: AttendanceStats): string {
  const lines: string[] = [];

  lines.push('По занятиям');
  lines.push(['Дата', 'Присут.', 'Отсут.', 'Всего учеников', '%'].join(';'));

  for (const row of stats.perLesson) {
    lines.push(
      [
        escapeCsvField(row.date),
        String(row.present),
        String(row.absent),
        String(row.total),
        `${row.percent}%`,
      ].join(';')
    );
  }

  lines.push('');
  lines.push('По ученикам');
  lines.push(['Имя', 'Присут.', 'Отсут.', 'Всего занятий', '%'].join(';'));

  for (const row of stats.perStudent) {
    lines.push(
      [
        escapeCsvField(row.studentName),
        String(row.attended),
        String(row.missed),
        String(row.total),
        `${row.percent}%`,
      ].join(';')
    );
  }

  return `\uFEFF${lines.join('\n')}`;
}

/**
 * Имя файла: название курса + диапазон дат фильтра (ДД.ММ.ГГГГ, читаемо в проводнике).
 */
export function buildAttendanceStatsExportFileName(
  courseName: string,
  dateFromIso: string,
  dateToIso: string,
  fallbackId: number
): string {
  const stripForFile = (name: string): string => {
    const trimmed = name.trim().slice(0, 80);

    if (!trimmed) {
      return `курс_${fallbackId}`;
    }

    const sanitized = trimmed.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '_');

    if (sanitized === '') {
      return `курс_${fallbackId}`;
    }

    return sanitized;
  };

  const isoToRuDdMmYyyy = (iso: string): string => formatRu(iso.trim().slice(0, 10));

  const fromRu = dateFromIso.trim() ? isoToRuDdMmYyyy(dateFromIso) : '';
  const toRu = dateToIso.trim() ? isoToRuDdMmYyyy(dateToIso) : '';

  let rangeLabel = '';

  if (fromRu && toRu) {
    rangeLabel = `${fromRu}-${toRu}`;
  } else if (fromRu) {
    rangeLabel = `от_${fromRu}`;
  } else if (toRu) {
    rangeLabel = `до_${toRu}`;
  } else {
    rangeLabel = 'период_не_задан';
  }

  return `${stripForFile(courseName)}_${rangeLabel}.csv`;
}
