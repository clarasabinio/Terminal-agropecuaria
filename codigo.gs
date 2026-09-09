function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Terminal Kiosco Agropecuaria')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getTodayString() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
}

function sanitizeSheetName(name) {
  return (name || 'CONTRATO').toString().replace(/[\[\]\*\?:\\\/]/g, '-').trim().slice(0, 30);
}

function getOrCreatePaymentFolder(contractId) {
  const MAIN_FOLDER_NAME = 'Comprobantes_Pagos_Agro';
  let mainFolder;
  const folders = DriveApp.getFoldersByName(MAIN_FOLDER_NAME);
  if (folders.hasNext()) {
    mainFolder = folders.next();
  } else {
    mainFolder = DriveApp.createFolder(MAIN_FOLDER_NAME);
  }
  
  const subName = 'Contrato_' + sanitizeSheetName(contractId);
  const subFolders = mainFolder.getFoldersByName(subName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  } else {
    return mainFolder.createFolder(subName);
  }
}

function savePaymentVoucher(fileData, contractId, fecha) {
  if (!fileData || !fileData.base64) return '';
  try {
    const folder = getOrCreatePaymentFolder(contractId);
    const contentType = fileData.mimeType || 'application/pdf';
    const bytes = Utilities.base64Decode(fileData.base64);
    const cleanFecha = (fecha || getTodayString()).replace(/-/g, '');
    const cleanName = (fileData.name || 'comprobante.pdf').replace(/[^a-zA-Z0-9_\.-]/g, '_');
    const fileName = 'PAGO_' + sanitizeSheetName(contractId) + '_' + cleanFecha + '_' + cleanName;
    
    const blob = Utilities.newBlob(bytes, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log('Error al guardar comprobante en Drive: ' + err.message);
    return '';
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Contratos');
  if (!sheet) {
    sheet = ss.insertSheet('Contratos', 0);
    sheet.appendRow([
      'ID', 'Codigo', 'Establecimiento', 'Ubicacion', 'Arrendador', 
      'Arrendatario', 'Superficie_Ha', 'Cultivo', 'Modalidad', 
      'Kg_Pactados', 'Kg_Pagados', 'Saldo_Kg', 'Precio_USD_Tn', 
      'Total_USD_Pagar', 'Total_USD_Pagado', 'Saldo_USD', 
      'Factura_Recibida', 'Campana', 'Porcentaje_Pagado', 'Estado', 'Observaciones', 'Fecha_Modificacion', 'Fecha_Vencimiento'
    ]);
    sheet.getRange(1, 1, 1, 23).setBackground('#0f2744').setFontColor('#ffffff').setFontWeight('bold');
    
    const today = getTodayString();
    const sampleData = [
      ['CTR-2025-001', 'AGRO-LP-01', 'Establecimiento La Posta', 'Pergamino, Bs. As.', 'Agrícola Ganadera Los Ombúes S.A.', 'Administración Rural', 450, 'Soja', '12.0 qq/ha', 540000, 360000, 180000, 295, 159300, 106200, 53100, 'SI', '2024/2025', '66.7%', 'PARCIAL', 'Entrega en acopio Pergamino', today, '2026-09-25'],
      ['CTR-2025-002', 'AGRO-VT-02', 'Campo Los Aromos', 'Venado Tuerto, Sta. Fe', 'Sucesión Fernández', 'Cresud S.A.', 600, 'Maíz', '40.0 qq/ha', 2400000, 2400000, 0, 180, 432000, 432000, 0, 'SI', '2024/2025', '100.0%', 'PAGADO', 'Cancelado 100%', today, '2026-08-31'],
      ['CTR-2025-003', 'AGRO-BAL-03', 'Estancia Santa María', 'Balcarce, Bs. As.', 'Fideicomiso Agro del Sud', 'Cerealera del Plata', 320, 'Trigo', '25.0 qq/ha', 800000, 400000, 400000, 215, 172000, 86000, 86000, 'NO', '2025/2026', '50.0%', 'PARCIAL', 'Entrega Puerto Quequén', today, '2026-10-31'],
      ['CTR-2025-004', 'AGRO-RC-04', 'Lote Las Palmeras', 'Río Cuarto, Cba.', 'Don Héctor Morales', 'Cooperativa Central', 200, 'Girasol', '10.0 qq/ha', 200000, 0, 200000, 310, 62000, 0, 62000, 'NO', '2025/2026', '0.0%', 'PENDIENTE', 'Cosecha gruesa', today, '2027-05-31']
    ];
    sampleData.forEach(row => {
      sheet.appendRow(row);
      const cObj = {
        id: row[0],
        codigo: row[1],
        establecimiento: row[2],
        ubicacion: row[3],
        arrendador: row[4],
        superficieHa: row[6],
        cultivoPactado: row[7],
        modalidad: row[8],
        kgPactados: row[9],
        kgPagados: row[10],
        saldoKg: row[11],
        precioTn: row[12],
        totalUSD: row[13],
        pagadoUSD: row[14],
        saldoUSD: row[15],
        facturaRecibida: row[16] === 'SI',
        campana: row[17],
        observaciones: row[20],
        fechaModificacion: row[21],
        fechaVencimiento: row[22]
      };
      logContractMovement(cObj, {
        fecha: today,
        tipo: 'ALTA CONTRATO',
        detalle: 'Carga inicial del contrato',
        kg: 0,
        precioChicagoUSD: row[12],
        tipoCambioARS: 1350,
        totalUSD: 0,
        totalARS: 0,
        medioPago: '-',
        nroRef: '-',
        factura: row[16],
        comprobanteUrl: '',
        observaciones: 'Firma de contrato'
      });
      if (row[10] > 0) {
        logContractMovement(cObj, {
          fecha: today,
          tipo: 'LIQUIDACION / PAGO',
          detalle: 'Entrega de granos y fijación de precio',
          kg: row[10],
          precioChicagoUSD: row[12],
          tipoCambioARS: 1350,
          totalUSD: row[14],
          totalARS: row[14] * 1350,
          medioPago: 'Transferencia',
          nroRef: 'TRF-INICIAL',
          factura: row[16],
          comprobanteUrl: '',
          observaciones: 'Pago inicial registrado'
        });
      }
    });
  }
  return sheet;
}

function getOrCreateContractTab(c) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = sanitizeSheetName(c.codigo || c.id || 'CONTRATO');
  let tab = ss.getSheetByName(sheetName);
  
  if (!tab) {
    tab = ss.insertSheet(sheetName);
    tab.getRange('A1:N1').merge()
      .setValue('SOLAPA DE MOVIMIENTOS Y LIQUIDACIONES: ' + (c.establecimiento || '') + ' (' + (c.codigo || c.id || '') + ')')
      .setBackground('#0f2744').setFontColor('#ffffff').setFontWeight('bold').setFontSize(11)
      .setHorizontalAlignment('center');

    tab.getRange('A2:B2').setValues([['Establecimiento:', c.establecimiento || '']]).setFontWeight('bold');
    tab.getRange('C2:D2').setValues([['Arrendador:', c.arrendador || '']]).setFontWeight('bold');
    tab.getRange('E2:F2').setValues([['Campaña:', c.campana || '']]).setFontWeight('bold');

    tab.getRange('A3:B3').setValues([['Cultivo y Has:', (c.cultivoPactado || '') + ' (' + (c.superficieHa || 0) + ' Ha)']]).setFontWeight('bold');
    tab.getRange('C3:D3').setValues([['Precio Ref. (Tn):', 'USD ' + (c.precioTn || 0)]]).setFontWeight('bold');
    tab.getRange('E3:F3').setValues([['Vigencia Hasta:', (c.fechaVencimiento || '-') + ' (' + (c.modalidad || '') + ')']]).setFontWeight('bold');

    tab.getRange('A2:F3').setBackground('#f8fafc');

    tab.appendRow([]); // fila vacía separadora

    tab.appendRow([
      'Fecha Venta/Fijación', 
      'Tipo Movimiento', 
      'Detalle / Concepto', 
      'Kg Liquidados', 
      'Saldo Pendiente (Kg)', 
      'Precio Rosario ($ ARS/Tn)', 
      'Tipo Cambio (ARS)', 
      'Total Liquidado (USD)', 
      'Total Liquidado (ARS)', 
      'Forma de Pago', 
      'N° Ref / Cheque', 
      'Factura Alquiler', 
      'Comprobante (Drive)', 
      'Observaciones'
    ]);
    const headerRow = tab.getLastRow();
    tab.getRange(headerRow, 1, 1, 14).setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
    tab.setFrozenRows(headerRow);
  }
  return tab;
}

function logContractMovement(c, mov) {
  try {
    const tab = getOrCreateContractTab(c);
    const dateStr = mov.fecha || getTodayString();
    tab.appendRow([
      dateStr,
      mov.tipo || 'MOVIMIENTO',
      mov.detalle || '',
      mov.kg || 0,
      c.saldoKg || 0,
      mov.precioRosarioARS || mov.precioChicagoUSD || c.precioTn || 0,
      mov.tipoCambioARS || 0,
      mov.totalUSD || 0,
      mov.totalARS || 0,
      mov.medioPago || 'Transferencia',
      mov.nroRef || '-',
      mov.factura || (c.facturaRecibida ? 'SI' : 'NO'),
      mov.comprobanteUrl || '',
      mov.observaciones || ''
    ]);
  } catch (err) {
    Logger.log('Error al registrar movimiento en solapa: ' + err.message);
  }
}

function getContractsFromSheet() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const contracts = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const ha = parseFloat(row[6]) || 0;
    const kgPactados = parseInt(row[9], 10) || 0;
    const kgPagados = parseInt(row[10], 10) || 0;
    const saldoKg = Math.max(0, kgPactados - kgPagados);
    const precioTn = parseFloat(row[12]) || 0;
    const precioKg = precioTn / 1000;
    const totalPagar = kgPactados * precioKg;
    const totalPagado = kgPagados * precioKg;
    const saldoUSD = saldoKg * precioKg;
    const pct = kgPactados > 0 ? parseFloat(((kgPagados / kgPactados) * 100).toFixed(1)) : 0;
    const facturaRecibida = String(row[16]).toUpperCase() === 'SI';
    const fechaMod = row[21] ? Utilities.formatDate(new Date(row[21]), Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd') : getTodayString();
    let fechaVenc = '';
    if (row[22]) {
      if (row[22] instanceof Date) {
        fechaVenc = Utilities.formatDate(row[22], Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
      } else {
        fechaVenc = String(row[22]).trim().substring(0, 10);
      }
    }
    
    contracts.push({
      rowIndex: i + 1,
      id: row[0] || ('CTR-' + i),
      codigo: row[1] || ('AGRO-' + i),
      establecimiento: row[2] || 'Campo',
      ubicacion: row[3] || 'Zona',
      arrendador: row[4] || 'Arrendador',
      arrendatario: row[5] || 'Arrendatario',
      superficieHa: ha,
      cultivoPactado: row[7] || 'Soja',
      modalidad: row[8] || '12.0 qq/ha',
      kgPactados: kgPactados,
      kgPagados: kgPagados,
      saldoKg: saldoKg,
      precioTn: precioTn,
      totalUSD: totalPagar,
      pagadoUSD: totalPagado,
      saldoUSD: saldoUSD,
      facturaRecibida: facturaRecibida,
      campana: row[17] || '2024/2025',
      porcentajeCumplimiento: pct,
      estado: pct >= 100 ? 'PAGADO' : (pct > 0 ? 'PARCIAL' : 'PENDIENTE'),
      observaciones: row[20] || '',
      fechaModificacion: fechaMod,
      fechaVencimiento: fechaVenc
    });
  }
  return contracts;
}

function saveContractToSheet(c) {
  const sheet = getSheet();
  const ha = parseFloat(c.superficieHa) || 0;
  const qq = parseFloat(c.modalidad) || 12.0;
  const kgPactados = Math.round(ha * qq * 100);
  const kgPagados = parseInt(c.kgPagados, 10) || 0;
  const saldoKg = Math.max(0, kgPactados - kgPagados);
  const precioTn = parseFloat(c.precioTn) || 0;
  const precioKg = precioTn / 1000;
  const totalUSD = kgPactados * precioKg;
  const pagadoUSD = kgPagados * precioKg;
  const saldoUSD = saldoKg * precioKg;
  const pct = kgPactados > 0 ? ((kgPagados / kgPactados) * 100).toFixed(1) + '%' : '0%';
  const estado = kgPagados >= kgPactados ? 'PAGADO' : (kgPagados > 0 ? 'PARCIAL' : 'PENDIENTE');
  const factura = c.facturaRecibida ? 'SI' : 'NO';
  const fecha = c.fecha || getTodayString();
  const fechaVencimiento = c.fechaVencimiento || '';

  let contractObj = null;

  if (c.rowIndex && c.rowIndex > 1) {
    sheet.getRange(c.rowIndex, 1, 1, 23).setValues([[
      c.id, c.codigo, c.establecimiento, c.ubicacion, c.arrendador,
      c.arrendatario, ha, c.cultivoPactado, (qq.toFixed(1) + ' qq/ha'),
      kgPactados, kgPagados, saldoKg, precioTn, totalUSD, pagadoUSD, saldoUSD,
      factura, c.campana || '2024/2025', pct, estado, c.observaciones || '', fecha, fechaVencimiento
    ]]);

    contractObj = Object.assign({}, c, {
      kgPactados: kgPactados,
      kgPagados: kgPagados,
      saldoKg: saldoKg,
      totalUSD: totalUSD,
      pagadoUSD: pagadoUSD,
      saldoUSD: saldoUSD,
      facturaRecibida: c.facturaRecibida,
      modalidad: qq.toFixed(1) + ' qq/ha',
      fechaVencimiento: fechaVencimiento
    });

    logContractMovement(contractObj, {
      fecha: fecha,
      tipo: 'MODIFICACION',
      detalle: 'Actualización de condiciones del contrato (Vigencia: ' + (fechaVencimiento || 'No definida') + ')',
      kg: 0,
      precioChicagoUSD: precioTn,
      tipoCambioARS: 0,
      totalUSD: 0,
      totalARS: 0,
      medioPago: '-',
      nroRef: '-',
      factura: factura,
      comprobanteUrl: '',
      observaciones: c.observaciones || ''
    });
  } else {
    const id = 'CTR-2025-' + new Date().getTime().toString().slice(-4);
    const codigo = c.codigo || id;
    sheet.appendRow([
      id, codigo, c.establecimiento, c.ubicacion, c.arrendador,
      c.arrendatario, ha, c.cultivoPactado, (qq.toFixed(1) + ' qq/ha'),
      kgPactados, 0, kgPactados, precioTn, totalUSD, 0, totalUSD,
      factura, c.campana || '2024/2025', '0%', 'PENDIENTE', c.observaciones || '', fecha, fechaVencimiento
    ]);

    contractObj = {
      id: id,
      codigo: codigo,
      establecimiento: c.establecimiento,
      ubicacion: c.ubicacion,
      arrendador: c.arrendador,
      arrendatario: c.arrendatario,
      superficieHa: ha,
      cultivoPactado: c.cultivoPactado,
      modalidad: qq.toFixed(1) + ' qq/ha',
      kgPactados: kgPactados,
      kgPagados: 0,
      saldoKg: kgPactados,
      precioTn: precioTn,
      totalUSD: totalUSD,
      pagadoUSD: 0,
      saldoUSD: totalUSD,
      facturaRecibida: !!c.facturaRecibida,
      campana: c.campana || '2024/2025',
      observaciones: c.observaciones || '',
      fechaModificacion: fecha,
      fechaVencimiento: fechaVencimiento
    };

    logContractMovement(contractObj, {
      fecha: fecha,
      tipo: 'ALTA CONTRATO',
      detalle: 'Creación y firma inicial del contrato de arrendamiento',
      kg: 0,
      precioChicagoUSD: precioTn,
      tipoCambioARS: 0,
      totalUSD: 0,
      totalARS: 0,
      medioPago: '-',
      nroRef: '-',
      factura: factura,
      comprobanteUrl: '',
      observaciones: c.observaciones || ''
    });
  }
  return getContractsFromSheet();
}

function recordPaymentToSheet(payment) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const fechaVenta = payment.fechaVenta || payment.fecha || getTodayString();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == payment.contractId) {
      const kgActuales = parseInt(values[i][10], 10) || 0;
      const kgPactados = parseInt(values[i][9], 10) || 0;
      const saldoActual = Math.max(0, kgPactados - kgActuales);
      const kgNuevos = parseInt(payment.kg, 10) || 0;

      if (kgNuevos > saldoActual) {
        throw new Error('No se pueden entregar ' + kgNuevos + ' Kg. El saldo pendiente máximo es ' + saldoActual + ' Kg.');
      }

      const precioRosario = parseFloat(payment.precioRosarioARS) || 0;
      const tipoCambio = parseFloat(payment.tipoCambioARS) || 1;
      const precioChicago = parseFloat(payment.precioChicagoUSD) || (tipoCambio > 0 && precioRosario > 0 ? (precioRosario / tipoCambio) : (parseFloat(values[i][12]) || 0));
      const nuevoTotalPagado = kgActuales + kgNuevos;
      const nuevoSaldoKg = Math.max(0, kgPactados - nuevoTotalPagado);
      
      const pagadoMovARS = precioRosario > 0 ? Math.round((kgNuevos / 1000) * precioRosario) : (parseFloat(payment.totalARS) || 0);
      const pagadoMovUSD = tipoCambio > 0 ? Math.round(pagadoMovARS / tipoCambio) : Math.round(kgNuevos * (precioChicago / 1000));
      const nuevoTotalPagadoUSD = (parseFloat(values[i][14]) || 0) + pagadoMovUSD;
      const precioKgUSD = (tipoCambio > 0 && precioRosario > 0) ? (precioRosario / tipoCambio / 1000) : (precioChicago / 1000);
      const saldoUSD = nuevoSaldoKg * precioKgUSD;
      
      const pct = kgPactados > 0 ? ((nuevoTotalPagado / kgPactados) * 100).toFixed(1) + '%' : '0%';
      const estado = nuevoTotalPagado >= kgPactados ? 'PAGADO' : (nuevoTotalPagado > 0 ? 'PARCIAL' : 'PENDIENTE');
      const factura = payment.facturaRecibida ? 'SI' : 'NO';

      // Guardar comprobante en Google Drive si se adjuntó archivo
      let comprobanteUrl = '';
      if (payment.comprobanteFile && payment.comprobanteFile.base64) {
        comprobanteUrl = savePaymentVoucher(payment.comprobanteFile, values[i][1] || values[i][0], fechaVenta);
      }

      // Actualizar hoja maestra
      sheet.getRange(i + 1, 11).setValue(nuevoTotalPagado);
      sheet.getRange(i + 1, 12).setValue(nuevoSaldoKg);
      sheet.getRange(i + 1, 15).setValue(nuevoTotalPagadoUSD);
      sheet.getRange(i + 1, 16).setValue(saldoUSD);
      sheet.getRange(i + 1, 17).setValue(factura);
      sheet.getRange(i + 1, 19).setValue(pct);
      sheet.getRange(i + 1, 20).setValue(estado);
      sheet.getRange(i + 1, 22).setValue(fechaVenta);

      const contractObj = {
        id: values[i][0],
        codigo: values[i][1],
        establecimiento: values[i][2],
        arrendador: values[i][4],
        campana: values[i][17],
        cultivoPactado: values[i][7],
        superficieHa: values[i][6],
        precioTn: precioChicago,
        modalidad: values[i][8],
        kgPagados: nuevoTotalPagado,
        saldoKg: nuevoSaldoKg,
        saldoUSD: saldoUSD,
        facturaRecibida: payment.facturaRecibida,
        observaciones: values[i][20] || ''
      };

      logContractMovement(contractObj, {
        fecha: fechaVenta,
        tipo: 'LIQUIDACION / PAGO',
        detalle: 'Fijación precio Rosario BCR y entrega de granos',
        kg: kgNuevos,
        precioRosarioARS: precioRosario,
        precioChicagoUSD: precioChicago,
        tipoCambioARS: tipoCambio,
        totalUSD: pagadoMovUSD,
        totalARS: pagadoMovARS,
        medioPago: payment.medioPago || 'Transferencia',
        nroRef: payment.nroReferencia || payment.nroFactura || '-',
        factura: factura + (payment.nroFactura ? ' (N° ' + payment.nroFactura + ')' : ''),
        comprobanteUrl: comprobanteUrl,
        observaciones: payment.observaciones || ('Fijación Rosario a $' + precioRosario + ' ARS/Tn - Total $' + pagadoMovARS + ' ARS')
      });
      break;
    }
  }
  return getContractsFromSheet();
}

function toggleInvoiceStatus(contractId, fecha) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const dateStr = fecha || getTodayString();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == contractId) {
      const actual = String(values[i][16]).toUpperCase();
      const nuevo = actual === 'SI' ? 'NO' : 'SI';
      sheet.getRange(i + 1, 17).setValue(nuevo);
      sheet.getRange(i + 1, 22).setValue(dateStr);

      const contractObj = {
        id: values[i][0],
        codigo: values[i][1],
        establecimiento: values[i][2],
        arrendador: values[i][4],
        campana: values[i][17],
        cultivoPactado: values[i][7],
        superficieHa: values[i][6],
        precioTn: values[i][12],
        modalidad: values[i][8],
        kgPagados: values[i][10],
        saldoKg: values[i][11],
        saldoUSD: values[i][15],
        facturaRecibida: nuevo === 'SI',
        observaciones: values[i][20] || ''
      };

      logContractMovement(contractObj, {
        fecha: dateStr,
        tipo: 'CAMBIO FACTURA',
        detalle: 'Estado de factura cambiado a: ' + (nuevo === 'SI' ? 'RECIBIDA' : 'PENDIENTE'),
        kg: 0,
        precioChicagoUSD: values[i][12],
        tipoCambioARS: 0,
        totalUSD: 0,
        totalARS: 0,
        medioPago: '-',
        nroRef: '-',
        factura: nuevo === 'SI' ? 'SI' : 'NO',
        comprobanteUrl: '',
        observaciones: 'Actualización estado de factura'
      });
      break;
    }
  }
  return getContractsFromSheet();
}

function deleteContractFromSheet(contractId) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == contractId) {
      const codigo = values[i][1] || values[i][0];
      sheet.deleteRow(i + 1);
      
      try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const tab = ss.getSheetByName(sanitizeSheetName(codigo));
        if (tab) {
          tab.setName(sanitizeSheetName('ARCH-' + codigo));
        }
      } catch (e) {}
      break;
    }
  }
  return getContractsFromSheet();
}

function getContractMovementsFromSheet(codigoOrId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tab = ss.getSheetByName(sanitizeSheetName(codigoOrId));
  if (!tab) return [];
  const rows = tab.getDataRange().getValues();
  if (rows.length < 6) return [];
  
  const movements = [];
  for (let i = 5; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[1]) continue;
    movements.push({
      fecha: r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd') : '',
      tipo: r[1] || '',
      detalle: r[2] || '',
      kgMov: r[3] || 0,
      saldoKg: r[4] || 0,
      precioChicagoUSD: r[5] || 0,
      tipoCambioARS: r[6] || 0,
      usdMov: r[7] || 0,
      arsMov: r[8] || 0,
      medioPago: r[9] || 'Transferencia',
      nroRef: r[10] || '',
      factura: r[11] || '',
      comprobanteUrl: r[12] || '',
      observaciones: r[13] || ''
    });
  }
  return movements;
}

function getMarketRates() {
  const defaultRates = {
    fecha: getTodayString(),
    dolarBNA: {
      compra: 1485,
      venta: 1535,
      mayorista: 1514,
      fechaActualizacion: new Date().toISOString()
    },
    rosario: {
      soja: 342000,
      maiz: 198000,
      trigo: 245000,
      girasol: 350000,
      moneda: '$ ARS/Tn'
    },
    chicago: {
      soja: 382.5,
      maiz: 176.4,
      trigo: 215.0,
      girasol: 310.0,
      moneda: 'USD/Tn'
    }
  };

  try {
    const resOficial = UrlFetchApp.fetch('https://dolarapi.com/v1/dolares/oficial', { muteHttpExceptions: true });
    if (resOficial.getResponseCode() === 200) {
      const data = JSON.parse(resOficial.getContentText());
      if (data.venta) defaultRates.dolarBNA.venta = data.venta;
      if (data.compra) defaultRates.dolarBNA.compra = data.compra;
      if (data.fechaActualizacion) defaultRates.dolarBNA.fechaActualizacion = data.fechaActualizacion;
    }
    const resMayorista = UrlFetchApp.fetch('https://dolarapi.com/v1/dolares/mayorista', { muteHttpExceptions: true });
    if (resMayorista.getResponseCode() === 200) {
      const dataM = JSON.parse(resMayorista.getContentText());
      if (dataM.venta) defaultRates.dolarBNA.mayorista = dataM.venta;
    }
  } catch (e) {
    Logger.log('Error obteniendo cotizaciones externas BNA: ' + e.message);
  }
  return defaultRates;
}