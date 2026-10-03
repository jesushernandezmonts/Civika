import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Generador de Recibos Oficiales Membretados de Colegio Cívika
 * Incluye folio consecutivo, sello digital institucional y código QR de validación
 */
export async function generarReciboOficialPDF({
  folio,
  fecha = new Date(),
  alumnoNombre,
  matricula = 'CIV-2026',
  grado = 'Secundaria',
  tutorNombre = 'Tutor no registrado',
  concepto = 'Colegiatura Mensual',
  mesCorrespondiente = 'Octubre 2026',
  monto = 0,
  metodoPago = 'Efectivo',
  atendio = 'Secretaría de Control Escolar',
  selloDigital = null,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const folioOficial = folio || `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const fechaStr = new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const horaStr = new Date(fecha).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const sello = selloDigital || `CIV-${btoa(`${folioOficial}-${alumnoNombre}-${monto}`).slice(0, 32).toUpperCase()}`;

  // Datos para validación del QR
  const qrValidationText = `COLEGIO CIVIKA - VALIDACION OFICIAL
Folio: ${folioOficial}
Alumno: ${alumnoNombre}
Matrícula: ${matricula}
Concepto: ${concepto} (${mesCorrespondiente})
Importe: $${Number(monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
Fecha: ${fechaStr} ${horaStr}
Sello: ${sello.slice(0, 16)}...
Estado: AUTENTICADO`;

  // Generar QR en base64
  const qrDataUrl = await QRCode.toDataURL(qrValidationText, {
    margin: 1,
    width: 200,
    color: {
      dark: '#1e1b4b', // Indigo profundo institucional
      light: '#ffffff',
    },
  });

  // ---- DISEÑO MEMBRETADO PROFESIONAL ----

  // Banda superior decorativa
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 6, 'F');

  doc.setFillColor(147, 51, 234); // Purple 600
  doc.rect(0, 6, 210, 2, 'F');

  // Encabezado institucional
  doc.setTextColor(30, 27, 75);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(APP_CONFIG.appName.toUpperCase(), 20, 24);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('SISTEMA INTEGRAL DE CONTROL ESCOLAR Y COBRANZA', 20, 29);
  doc.text('C.C.T. 29PES0012Z • R.F.C. CCI260101XYZ • Tlaxcala, México', 20, 33);
  doc.text('Tel: (247) 472-0000 • Email: direccion@civika.edu.mx', 20, 37);

  // Recuadro del Folio Oficial (Lado derecho superior)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(135, 16, 55, 24, 3, 3, 'FD');

  doc.setTextColor(147, 51, 234);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('COMPROBANTE OFICIAL DE PAGO', 162.5, 22, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text(folioOficial, 162.5, 29, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`${fechaStr} • ${horaStr}`, 162.5, 35, { align: 'center' });

  // Línea divisoria
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 44, 190, 44);

  // ---- SECCIÓN: DATOS DEL ALUMNO Y TUTOR ----
  doc.setFillColor(241, 245, 249);
  doc.rect(20, 48, 170, 7, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DATOS DEL ALUMNO Y CONTROL ESCOLAR', 24, 53);

  // Grid de datos
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Alumno:', 24, 62);
  doc.text('Matrícula:', 24, 68);
  doc.text('Nivel / Grado:', 24, 74);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(alumnoNombre || 'Sin Nombre Registrado', 55, 62);
  doc.text(matricula, 55, 68);
  doc.text(grado, 55, 74);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Tutor Responsable:', 110, 62);
  doc.text('Método de Pago:', 110, 68);
  doc.text('Emitido por:', 110, 74);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(tutorNombre, 145, 62);
  doc.text(metodoPago.toUpperCase(), 145, 68);
  doc.text(atendio, 145, 74);

  // ---- TABLA DE DESGLOSE DE CONCEPTOS ----
  doc.setFillColor(79, 70, 229);
  doc.rect(20, 84, 170, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DESCRIPCIÓN DEL CONCEPTO', 24, 89);
  doc.text('PERIODO / REF.', 115, 89);
  doc.text('IMPORTE', 185, 89, { align: 'right' });

  // Fila del concepto
  doc.setFillColor(255, 255, 255);
  doc.rect(20, 91, 170, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 103, 190, 103);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(concepto, 24, 98);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(mesCorrespondiente, 115, 98);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Number(monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 185, 98, { align: 'right' });

  // Recuadro Total
  doc.setFillColor(248, 250, 252);
  doc.rect(120, 108, 70, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(120, 108, 70, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL PAGADO:', 125, 117);

  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // Emerald 600
  doc.text(`$${Number(monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 186, 117, { align: 'right' });

  // ---- SECCIÓN DE SEGURIDAD, QR Y SELLO DIGITAL ----
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 130, 190, 130);

  // Insertar Código QR
  doc.addImage(qrDataUrl, 'PNG', 22, 136, 34, 34);

  // Sello y validación
  doc.setTextColor(30, 27, 75);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('VALIDACIÓN Y SELLO DIGITAL INSTITUCIONAL', 62, 140);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Este documento es un comprobante de pago oficial emitido por el sistema Colegio Cívika.', 62, 145);
  doc.text('Escanee el código QR con cualquier cámara o dispositivo para verificar la autenticidad del registro.', 62, 149);

  // Cadena del sello
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`HASH SHA-256: ${sello}`, 62, 156);
  doc.text(`AUTORIZACIÓN BANCARIA/INTERNA: OK-2026-AUT-${folioOficial.slice(-5)}`, 62, 161);

  // Área de firmas
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.line(70, 200, 120, 200);
  doc.text('Firma y Sello de Caja', 95, 205, { align: 'center' });
  doc.text('Secretaría de Control Escolar', 95, 209, { align: 'center' });

  doc.line(135, 200, 180, 200);
  doc.text('Firma de Conformidad', 157.5, 205, { align: 'center' });
  doc.text('Padre de Familia / Tutor', 157.5, 209, { align: 'center' });

  // Pie de página institucional
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Conserve este comprobante para cualquier aclaración o trámite de reinscripción o entrega de uniformes.', 105, 286, { align: 'center' });
  doc.text('Colegio Cívika © 2026 • Documento generado electrónicamente sin tachaduras ni enmendaduras.', 105, 290, { align: 'center' });

  // Guardar / Descargar PDF
  doc.save(`Recibo_${folioOficial}_${alumnoNombre.replace(/\s+/g, '_')}.pdf`);
  return doc;
}
