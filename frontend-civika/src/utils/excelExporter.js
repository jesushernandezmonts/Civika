import * as XLSX from 'xlsx';

/**
 * Exportador profesional a Excel (.xlsx) para tablas de Colegio Cívika
 * @param {Array} data - Lista de objetos a exportar
 * @param {string} fileName - Nombre del archivo descargado
 * @param {string} sheetName - Nombre de la pestaña de la hoja
 * @param {Array} columnsMap - [{ key: 'campo', label: 'Encabezado' }]
 */
export function exportToExcel({
  data = [],
  fileName = 'Reporte_Civika',
  sheetName = 'Datos',
  columnsMap = [],
}) {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No hay datos disponibles para exportar.');
    return;
  }

  // Mapear los datos con los encabezados limpios
  const formattedData = data.map((item, index) => {
    const row = {};
    if (columnsMap.length > 0) {
      columnsMap.forEach(col => {
        let val = item[col.key];
        if (typeof col.format === 'function') {
          val = col.format(val, item);
        } else if (typeof val === 'boolean') {
          val = val ? 'Activo / Sí' : 'Inactivo / No';
        } else if (val === null || val === undefined) {
          val = '—';
        }
        row[col.label] = val;
      });
    } else {
      // Si no se especifica mapa, exportar objeto directo
      Object.keys(item).forEach(k => {
        row[k] = item[k] ?? '—';
      });
    }
    return row;
  });

  // Crear Workbook y Worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Calcular ancho automático para cada columna
  const colWidths = Object.keys(formattedData[0] || {}).map(key => {
    const maxLen = Math.max(
      key.length,
      ...formattedData.map(row => String(row[key] || '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  // Generar fecha actual para el nombre
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFileName = `${fileName}_${dateStr}.xlsx`;

  // Descarga directa
  XLSX.writeFile(workbook, fullFileName);
}
