/**
 * ==============================================================================
 * TERMINAL AGROPECUARIA - BACKEND GOOGLE APPS SCRIPT (codigo.gs)
 * ==============================================================================
 * Sistema Multi-Base de Datos para 3 Hojas de Cálculo de Google Drive:
 * 1. Exaltación de la Cruz (ID: 14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ)
 * 2. Salto                (ID: 1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc)
 * 3. San Andrés de Giles  (ID: 1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic)
 * ==============================================================================
 */

const MUNICIPIOS_DB = {
  exaltacion: {
    key: 'exaltacion',
    nombre: 'Exaltación de la Cruz',
    id: '14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ',
    url: 'https://docs.google.com/spreadsheets/d/14TDx506Vqy2urOyiyn6mtHx7vcc170snJpEozqm4FDQ/edit',
    cabecera: 'Capilla del Señor',
    colorHex: '#2563eb'
  },
  salto: {
    key: 'salto',
    nombre: 'Salto',
    id: '1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc',
    url: 'https://docs.google.com/spreadsheets/d/1i1uAaXBAnjpr8ryUNqeEreix02lcJp70RbwhKbyJIWc/edit',
    cabecera: 'Salto',
    colorHex: '#059669'
  },
  giles: {
    key: 'giles',
    nombre: 'San Andrés de Giles',
    id: '1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic',
    url: 'https://docs.google.com/spreadsheets/d/1herQyCsr6fpyNxjroY74EMw4R-G3v0JfOAWJz3s46ic/edit',
    cabecera: 'San Andrés de Giles',
    colorHex: '#d97706'
  }
};

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

function getMunicipiosConfig() {
  return MUNICIPIOS_DB;
}

/**
 * Resuelve la hoja de cálculo (Spreadsheet) correspondiente al municipio o ID dado.
 */
function resolveSpreadsheet(municipioKeyOrId) {
  if (!municipioKeyOrId) {
    try {
      const active = SpreadsheetApp.getActiveSpreadsheet();
      if (active) return active;
    } catch (e) {}
    return SpreadsheetApp.openById(MUNICIPIOS_DB.exaltacion.id);
  }

  // Buscar por clave ('exaltacion', 'salto', 'giles')
  const lower = String(municipioKeyOrId).toLowerCase().trim();
  if (MUNICIPIOS_DB[lower]) {
    return SpreadsheetApp.openById(MUNICIPIOS_DB[lower].id);
  }

  // Buscar por ID exacto o coincidencia de nombre
  for (const k in MUNICIPIOS_DB) {
    const item = MUNICIPIOS_DB[k];
    if (item.id === municipioKeyOrId || item.nombre.toLowerCase() === lower || lower.indexOf(k) !== -1) {
      return SpreadsheetApp.openById(item.id);
    }
  }

  // Si se envió un ID de Google Sheet directamente
  try {
    return SpreadsheetApp.openById(municipioKeyOrId);
  } catch (err) {
    try {
      return SpreadsheetApp.getActiveSpreadsheet();
    } catch (e2) {
      throw new Error('No se pudo resolver la Hoja de Cálculo para: ' + municipioKeyOrId);
    }
  }
}

/**
 * Identifica la metadata del municipio a partir del objeto contrato, ID o nombre.
 */
function getMunicipioMeta(val) {
  if (!val) return MUNICIPIOS_DB.exaltacion;
  const str = String(val).toLowerCase().trim();
  for (const k in MUNICIPIOS_DB) {
    const m = MUNICIPIOS_DB[k];
    if (m.key === str || m.id === val || m.nombre.toLowerCase() === str || str.indexOf(k) !== -1 || str.indexOf(m.cabecera.toLowerCase()) !== -1) {
      return m;
    }
  }
  return MUNICIPIOS_DB.exaltacion;
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

/**
 * Obtiene la solapa 'Contratos' de la hoja de cálculo del municipio indicado.
 */
function getSheet(municipioKeyOrId) {
  const ss = resolveSpreadsheet(municipioKeyOrId);
  let sheet = ss.getSheetByName('Contratos');
  if (!sheet) {
    sheet = ss.insertSheet('Contratos', 0);
    sheet.appendRow([
      'ID', 'Codigo', 'Establecimiento', 'Ubicacion', 'Arrendador', 
      'Arrendatario', 'Superficie_Ha', 'Cultivo', 'Modalidad', 
      'Kg_Pactados', 'Kg_Pagados', 'Saldo_Kg', 'Precio_USD_Tn', 
      'Total_USD_Pagar', 'Total_USD_Pagado', 'Saldo_USD', 
      'Factura_Recibida', 'Campana', 'Porcentaje_Pagado', 'Estado', 'Observaciones', 
      'Fecha_Modificacion', 'Fecha_Vencimiento', 'Municipio', 'Municipio_ID'
    ]);
    sheet.getRange(1, 1, 1, 25).setBackground('#0f2744').setFontColor('#ffffff').setFontWeight('bold');
  }
  return sheet;
}

function getOrCreateContractTab(c, ssOrMunicipio) {
  const ss = (ssOrMunicipio && typeof ssOrMunicipio.getSheetByName === 'function') 
    ? ssOrMunicipio 
    : resolveSpreadsheet(c.municipioKey || c.municipioId || c.municipio || ssOrMunicipio);

  const sheetName = sanitizeSheetName(c.codigo || c.id || 'CONTRATO');
  let tab = ss.getSheetByName(sheetName);
  
  if (!tab) {
    tab = ss.insertSheet(sheetName);
    const munMeta = getMunicipioMeta(c.municipioKey || c.municipioId || c.municipio);
    tab.getRange('A1:N1').merge()
      .setValue('SOLAPA DE MOVIMIENTOS: ' + (c.establecimiento || '') + ' (' + (c.codigo || c.id || '') + ') - ' + munMeta.nombre)
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

function logContractMovement(c, mov, ssOrMunicipio) {
  try {
    const tab = getOrCreateContractTab(c, ssOrMunicipio);
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

/**
 * Lee los contratos de una hoja de cálculo dada.
 */
function getContractsFromSheet(municipioKeyOrId) {
  const sheet = getSheet(municipioKeyOrId);
  const munMeta = getMunicipioMeta(municipioKeyOrId);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const contracts = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0] && !row[2]) continue;

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
    const fechaMod = row[21] ? (row[21] instanceof Date ? Utilities.formatDate(row[21], Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd') : String(row[21]).substring(0, 10)) : getTodayString();
    
    let fechaVenc = '';
    if (row[22]) {
      if (row[22] instanceof Date) {
        fechaVenc = Utilities.formatDate(row[22], Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
      } else {
        fechaVenc = String(row[22]).trim().substring(0, 10);
      }
    }

    const munNombre = row[23] || munMeta.nombre;
    const munId = row[24] || munMeta.id;
    const specificMeta = getMunicipioMeta(munId || munNombre);

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
      campana: row[17] || '2025/2026',
      porcentajeCumplimiento: pct,
      estado: pct >= 100 ? 'PAGADO' : (pct > 0 ? 'PARCIAL' : 'PENDIENTE'),
      observaciones: row[20] || '',
      fechaModificacion: fechaMod,
      fechaVencimiento: fechaVenc,
      municipio: specificMeta.nombre,
      municipioKey: specificMeta.key,
      municipioId: specificMeta.id,
      sheetUrl: specificMeta.url
    });
  }
  return contracts;
}

/**
 * Lee y consolida los contratos de las 3 hojas de cálculo de Google Drive.
 */
function getAllContractsAcrossMunicipios() {
  let all = [];
  for (const k in MUNICIPIOS_DB) {
    try {
      const list = getContractsFromSheet(k);
      all = all.concat(list);
    } catch (err) {
      Logger.log('Aviso al leer contratos de ' + k + ': ' + err.message);
    }
  }
  return all;
}

/**
 * Guarda o modifica un contrato en la hoja de cálculo del municipio respectivo.
 */
function saveContractToSheet(c, optMunicipio) {
  const munMeta = getMunicipioMeta(c.municipioKey || c.municipioId || c.municipio || optMunicipio);
  const sheet = getSheet(munMeta.key);
  
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
    sheet.getRange(c.rowIndex, 1, 1, 25).setValues([[
      c.id, c.codigo, c.establecimiento, c.ubicacion, c.arrendador,
      c.arrendatario, ha, c.cultivoPactado, (qq.toFixed(1) + ' qq/ha'),
      kgPactados, kgPagados, saldoKg, precioTn, totalUSD, pagadoUSD, saldoUSD,
      factura, c.campana || '2025/2026', pct, estado, c.observaciones || '', 
      fecha, fechaVencimiento, munMeta.nombre, munMeta.id
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
      fechaVencimiento: fechaVencimiento,
      municipio: munMeta.nombre,
      municipioKey: munMeta.key,
      municipioId: munMeta.id
    });

    logContractMovement(contractObj, {
      fecha: fecha,
      tipo: 'MODIFICACION',
      detalle: 'Actualización en ' + munMeta.nombre + ' (Vigencia: ' + (fechaVencimiento || 'No definida') + ')',
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
    }, munMeta.key);
  } else {
    const id = 'CTR-' + munMeta.key.slice(0, 3).toUpperCase() + '-' + new Date().getTime().toString().slice(-4);
    const codigo = c.codigo || id;
    sheet.appendRow([
      id, codigo, c.establecimiento, c.ubicacion, c.arrendador,
      c.arrendatario, ha, c.cultivoPactado, (qq.toFixed(1) + ' qq/ha'),
      kgPactados, 0, kgPactados, precioTn, totalUSD, 0, totalUSD,
      factura, c.campana || '2025/2026', '0%', 'PENDIENTE', c.observaciones || '', 
      fecha, fechaVencimiento, munMeta.nombre, munMeta.id
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
      campana: c.campana || '2025/2026',
      observaciones: c.observaciones || '',
      fechaModificacion: fecha,
      fechaVencimiento: fechaVencimiento,
      municipio: munMeta.nombre,
      municipioKey: munMeta.key,
      municipioId: munMeta.id
    };

    logContractMovement(contractObj, {
      fecha: fecha,
      tipo: 'ALTA CONTRATO',
      detalle: 'Alta en base de datos de ' + munMeta.nombre,
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
    }, munMeta.key);
  }
  return getAllContractsAcrossMunicipios();
}

/**
 * Registra un pago / liquidación en la hoja de cálculo del contrato correspondiente.
 */
function recordPaymentToSheet(payment, optMunicipio) {
  const munMeta = getMunicipioMeta(payment.municipioKey || payment.municipioId || optMunicipio);
  const sheet = getSheet(munMeta.key);
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

      let comprobanteUrl = '';
      if (payment.comprobanteFile && payment.comprobanteFile.base64) {
        comprobanteUrl = savePaymentVoucher(payment.comprobanteFile, values[i][1] || values[i][0], fechaVenta);
      }

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
        observaciones: values[i][20] || '',
        municipio: munMeta.nombre,
        municipioId: munMeta.id,
        municipioKey: munMeta.key
      };

      logContractMovement(contractObj, {
        fecha: fechaVenta,
        tipo: 'LIQUIDACION / PAGO',
        detalle: 'Fijación Rosario BCR y entrega de granos (' + munMeta.nombre + ')',
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
      }, munMeta.key);
      break;
    }
  }
  return getAllContractsAcrossMunicipios();
}

function toggleInvoiceStatus(contractId, fecha, optMunicipio) {
  const munMeta = getMunicipioMeta(optMunicipio);
  const sheet = getSheet(munMeta.key);
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
        observaciones: values[i][20] || '',
        municipio: munMeta.nombre,
        municipioId: munMeta.id
      };

      logContractMovement(contractObj, {
        fecha: dateStr,
        tipo: 'CAMBIO FACTURA',
        detalle: 'Estado de factura: ' + (nuevo === 'SI' ? 'RECIBIDA' : 'PENDIENTE'),
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
      }, munMeta.key);
      break;
    }
  }
  return getAllContractsAcrossMunicipios();
}

function deleteContractFromSheet(contractId, optMunicipio) {
  const munMeta = getMunicipioMeta(optMunicipio);
  const sheet = getSheet(munMeta.key);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == contractId) {
      const codigo = values[i][1] || values[i][0];
      sheet.deleteRow(i + 1);
      
      try {
        const ss = resolveSpreadsheet(munMeta.key);
        const tab = ss.getSheetByName(sanitizeSheetName(codigo));
        if (tab) {
          tab.setName(sanitizeSheetName('ARCH-' + codigo));
        }
      } catch (e) {}
      break;
    }
  }
  return getAllContractsAcrossMunicipios();
}

function getContractMovementsFromSheet(codigoOrId, optMunicipio) {
  const ss = resolveSpreadsheet(optMunicipio);
  const tab = ss.getSheetByName(sanitizeSheetName(codigoOrId));
  if (!tab) return [];
  const rows = tab.getDataRange().getValues();
  if (rows.length < 6) return [];
  
  const movements = [];
  for (let i = 5; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[1]) continue;
    movements.push({
      fecha: r[0] ? (r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone() || 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd') : String(r[0]).substring(0, 10)) : '',
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

/**
 * Función para inicializar y poblar automáticamente las 3 hojas de cálculo
 * de Google Drive con ejemplos característicos de cada municipio.
 */
function initializeSampleDataAllMunicipios() {
  const today = getTodayString();
  
  const sampleExaltacion = [
    ['CTR-EX-001', 'AGRO-EX-01', 'Establecimiento La Negrita', 'Capilla del Señor, Exaltación de la Cruz', 'Agropecuaria Capilla S.A.', 'Administración Rural', 350, 'Soja', '14.0 qq/ha', 490000, 320000, 170000, 298, 146020, 95360, 50660, 'SI', '2024/2025', '65.3%', 'PARCIAL', 'Acopio Cooperativa Capilla del Señor', today, '2026-10-15', 'Exaltación de la Cruz', MUNICIPIOS_DB.exaltacion.id],
    ['CTR-EX-002', 'AGRO-EX-02', 'Campo Los Cardales', 'Los Cardales, Exaltación de la Cruz', 'Sucesión Cardales', 'Cresud S.A.', 280, 'Maíz', '38.0 qq/ha', 1064000, 1064000, 0, 185, 196840, 196840, 0, 'SI', '2024/2025', '100.0%', 'PAGADO', 'Liquidación total finalizada', today, '2026-08-31', 'Exaltación de la Cruz', MUNICIPIOS_DB.exaltacion.id],
    ['CTR-EX-003', 'AGRO-EX-03', 'Chacra El Pavón', 'Pavón, Exaltación de la Cruz', 'Fideicomiso Ruta 8 Norte', 'Cerealera del Plata', 190, 'Trigo', '24.0 qq/ha', 456000, 150000, 306000, 218, 99408, 32700, 66708, 'NO', '2025/2026', '32.9%', 'PARCIAL', 'Entrega a granel planta Pavón', today, '2026-11-30', 'Exaltación de la Cruz', MUNICIPIOS_DB.exaltacion.id]
  ];

  const sampleSalto = [
    ['CTR-SA-001', 'AGRO-SA-01', 'Estancia La Invencible', 'Inés Indart, Salto', 'Agrícola Ganadera Indart S.A.', 'Los Grobo Agropecuaria', 650, 'Maíz', '42.0 qq/ha', 2730000, 1800000, 930000, 182, 496860, 327600, 169260, 'SI', '2024/2025', '65.9%', 'PARCIAL', 'Planta Silos Salto Central', today, '2026-09-28', 'Salto', MUNICIPIOS_DB.salto.id],
    ['CTR-SA-002', 'AGRO-SA-02', 'Lote Arroyo Dulce', 'Arroyo Dulce, Salto', 'Familia Rossi Hnos.', 'Administración Rural', 520, 'Soja', '15.0 qq/ha', 780000, 780000, 0, 295, 230100, 230100, 0, 'SI', '2024/2025', '100.0%', 'PAGADO', 'Cancelado 100% campaña gruesa', today, '2026-07-31', 'Salto', MUNICIPIOS_DB.salto.id],
    ['CTR-SA-003', 'AGRO-SA-03', 'Campo El Rincón de Berdier', 'Berdier, Salto', 'Don Valerio Berdier', 'Cooperativa Agrícola de Salto', 310, 'Trigo', '26.0 qq/ha', 806000, 0, 806000, 215, 173290, 0, 173290, 'NO', '2025/2026', '0.0%', 'PENDIENTE', 'Lote de fina próximo a cosecha', today, '2026-12-15', 'Salto', MUNICIPIOS_DB.salto.id]
  ];

  const sampleGiles = [
    ['CTR-GI-001', 'AGRO-GI-01', 'Establecimiento Cucullú', 'Cucullú, San Andrés de Giles', 'Agropecuaria Cucullú S.R.L.', 'Administración Rural', 420, 'Soja', '13.5 qq/ha', 567000, 350000, 217000, 295, 167265, 103250, 64015, 'SI', '2024/2025', '61.7%', 'PARCIAL', 'Entrega en acopio Giles Ruta 7', today, '2026-10-20', 'San Andrés de Giles', MUNICIPIOS_DB.giles.id],
    ['CTR-GI-002', 'AGRO-GI-02', 'Chacra Villa Ruiz', 'Villa Ruiz, San Andrés de Giles', 'Don Horacio Ruiz', 'Molinos Río de la Plata', 240, 'Girasol', '11.0 qq/ha', 264000, 264000, 0, 315, 83160, 83160, 0, 'SI', '2024/2025', '100.0%', 'PAGADO', 'Liquidado según fijación Rosario', today, '2026-08-15', 'San Andrés de Giles', MUNICIPIOS_DB.giles.id],
    ['CTR-GI-003', 'AGRO-GI-03', 'Campo Don Segundo', 'Azcuénaga, San Andrés de Giles', 'Fideicomiso Azcuénaga Rural', 'Cerealera del Plata', 480, 'Maíz', '40.0 qq/ha', 1920000, 800000, 1120000, 180, 345600, 144000, 201600, 'NO', '2025/2026', '41.7%', 'PARCIAL', 'Fijación parcial con BCR', today, '2026-11-10', 'San Andrés de Giles', MUNICIPIOS_DB.giles.id]
  ];

  const datasets = [
    { key: 'exaltacion', data: sampleExaltacion },
    { key: 'salto', data: sampleSalto },
    { key: 'giles', data: sampleGiles }
  ];

  datasets.forEach(item => {
    try {
      const ss = resolveSpreadsheet(item.key);
      const sheet = getSheet(item.key);
      // Limpiar filas anteriores si existen más de los encabezados
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      item.data.forEach(row => {
        sheet.appendRow(row);

        // Crear la solapa individual de seguimiento para este contrato
        try {
          const cObj = {
            id: row[0],
            codigo: row[1],
            establecimiento: row[2],
            ubicacion: row[3],
            arrendador: row[4],
            arrendatario: row[5],
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
            porcentajeCumplimiento: row[18],
            estado: row[19],
            observaciones: row[20],
            fechaModificacion: row[21],
            fechaVencimiento: row[22],
            municipio: row[23],
            municipioId: row[24],
            municipioKey: item.key
          };

          const tab = getOrCreateContractTab(cObj, ss);
          // Si es nueva y solo tiene encabezados (<= 5 filas), poblar movimientos de ejemplo
          if (tab.getLastRow() <= 5) {
            tab.appendRow([
              cObj.fechaModificacion || today,
              'ALTA CONTRATO',
              'Alta de contrato en ' + cObj.municipio + ' (' + cObj.establecimiento + ')',
              0,
              cObj.kgPactados,
              cObj.precioTn,
              1535,
              0,
              0,
              '-',
              '-',
              cObj.facturaRecibida ? 'SI' : 'NO',
              cObj.sheetUrl || '',
              cObj.observaciones || 'Firma inicial de contrato'
            ]);

            if (cObj.kgPagados > 0) {
              tab.appendRow([
                cObj.fechaModificacion || today,
                'LIQUIDACION / PAGO',
                'Entrega y fijación parcial en acopio local',
                cObj.kgPagados,
                cObj.saldoKg,
                cObj.precioTn,
                1535,
                cObj.pagadoUSD,
                Math.round(cObj.pagadoUSD * 1535),
                'Transferencia',
                'TRF-' + cObj.codigo,
                cObj.facturaRecibida ? 'SI' : 'NO',
                '',
                'Pago computado según cotización pactada'
              ]);
            }
          }
        } catch (tabErr) {
          Logger.log('Error creando solapa individual ' + row[1] + ': ' + tabErr.message);
        }
      });
      Logger.log('Inicializados ejemplos y solapas en ' + item.key);
    } catch (e) {
      Logger.log('Error inicializando ' + item.key + ': ' + e.message);
    }
  });

  return getAllContractsAcrossMunicipios();
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