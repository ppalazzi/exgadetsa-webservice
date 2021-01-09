'use strict'

const log4js = require('log4js')
const logger = log4js.getLogger('crcIlicitosController')

const { updateT106, getFlags, storeT104 } = require('../dao/generalsQueries')
const { addAusentChangeReason } = require('../dao/acometidasQueries')
const { traerAdicionalEQ, comunicarCRC, store123, storeT10, store135, getActionComunication, comunicarC900} = require('../dao/crcIlicitosQueries')
const { storeMaterialsForTask } = require('./commons-functions')
const { getGFromMeter, storeMeter } = require('../dao/meterQueries')
const { getValidationPaperByAction } = require('../dao/paperQueries')
const { getNewReason } = require('../dao/motivosQueries')


module.exports = {

    notifiyCRC: async (task) => {
        let keepMeter = false
        let removeMeter = false
        let validePaper = false
        let photosAmount = (task.signature) ? task.signature.uris.length : 0
        let accionCierre = new Array()
        let accionAdicionales = new Array()
        let accionNuevas = new Array()
        let validateMeter = false;

        for (const action of task.actions) {
            const flagsValues = await getFlags(task.Tipo_Contrato_id, action.id)

            if (flagsValues) {
                if (!removeMeter) {
                    removeMeter = removeMeter || flagsValues.RMED
                }
                if (!keepMeter) {
                    keepMeter = keepMeter || flagsValues.CMED
                }
            }


            //validando papel
            logger.debug('Debo validar ' + validePaper)

            let valida = await retrieveValidations(action.id, '003', task.Motivo_id, action.resultado)

            if (valida) {
                validePaper = validePaper || (valida.Papel === 1)

                if (valida.Adicional === 0) {
                    accionCierre.push(action)
                } else if (valida.Adicional === 1) {
                    accionAdicionales.push(action)
                } else if (valida.Adicional === 2) {
                    accionNuevas.push(action)
                }
            }

            await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, action.id,
                task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, photosAmount)
        }

        if (task.realizado) {
            await storeDoneTask(task, keepMeter, removeMeter, accionCierre, validePaper, validateMeter)
        }

        await comunicateActions(task, accionCierre, validateMeter, validePaper)

        if (task.Numero_Recorrido) {
            const actionNotResolved = (accionCierre.length > 0) ? accionCierre[0].id : ''

            await updateT106(actionNotResolved, task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
                task.Tipo_Contrato_id, task.Ngn_id)
        }

        await storeMaterialsForTask(task)
    }
}

async function retrieveValidations (actionId, contractId, jobType, result) {
    return await getValidationPaperByAction(actionId, contractId, jobType, result)
}

async function comunicateActions(task, accionCierre, validateMeter, validePaper) {
    let actionNotResolved = (accionCierre.length > 0) ? accionCierre[0].id : ''

    const newMeter = task.meterVO ? task.meterVO.estado : ''
    const oldMeter = task.dataVO ? task.dataVO.value : ''
    const serialNewMeter = task.meterVO ? task.meterVO.serial : ''
    const capacity = task.meterVO ? task.meterVO.capacity : ''
    const aclaracion = task.signature ? task.signature.aclaracion : ''
    const dni = task.signature ? task.signature.dni : ''
    let photosAmount = (task.signature) ? task.signature.uris.length : 0

    logger.info(`Task . Visita ${task.Ausente}`)

    let actionByAnomaly = await getActionComunication(actionNotResolved, parseInt(task.Ausente) + 1, task.Numero_Parte)

    logger.info(`El switch me da ${actionByAnomaly.ACTION}`)

    switch (actionByAnomaly.ACTION) {
        case 0:
            await addAusentChangeReason(task.Numero_Parte, task.Motivo_id, task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.observations, '0', '003')
            break;
        case 1:
            let date = new Date()
            date.setHours(date.getHours() - 3)
            await comunicarCRC(task.Numero_Parte, task.Fecha_Emision_id, task.Tipo_Trabajo_id, task.Motivo_id, task.fechaRealizado,
                serialNewMeter, oldMeter, task.Numero_Medidor , newMeter, '', task.Poliza, '', task.codOperario,
                task.observations, '' , '', task.Ngn_id, aclaracion, dni, validateMeter, validePaper, photosAmount, date.toTimeString().substring(0, 11), capacity)
            await comunicarC900(task.fechaRealizado, task.codOperario, task.Numero_Parte, task.Tipo_Trabajo_id, task.Ngn_id)
            break;
        case 3:
            let reasonCurrent = await getNewReason(task.Tipo_Contrato_id, actionNotResolved , task.Motivo_id)

            if (reasonCurrent) {
                logger.info(`el nuevo motivo es ${reasonCurrent.Motivo}`)
                await addAusentChangeReason(task.Numero_Parte, reasonCurrent.Motivo, task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.observations, '0', '003')
            }

            break;
        default:
            await addAusentChangeReason(task.Numero_Parte, task.Motivo_id, task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.observations, '0',  '003')
            break;
    }
}

async function storeDoneTask(task, keepMeter, removeMeter, accionCierre, validePaper, validateMeter) {
    const newMeterSerial = (task.meterVO && task.meterVO.serial) ?  task.meterVO.serial : ''
    const photosAmount = (task.signature) ? task.signature.uris.length : 0
    let adicional = ''


    if (keepMeter && newMeterSerial) {
        const nuevoMedidor = await getMeterBySerial(task.meterVO.serial)

        if (nuevoMedidor && nuevoMedidor.Estado === 1 && nuevoMedidor.Operario == task.codOperario) {
            const gMeter = await getGFromMeter(task.meterVO.serial)

            //recurpero el g del medidor para saber si corresponden item adicionales de certificacion
            if (gMeter) {
                if (gMeter.CODG < 16) {
                    adicional = 'NO'
                }
                else if (gMeter.CODG < 40) {
                    adicional = '15'
                }
                else {
                    adicional = '16'
                }
            }

            const ad = await traerAdicionalEQ(nuevoMedidor.Material, accionCierre)

            if (ad && ad.Codigo && ad.Codigo.toString() != '-') {
                await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, ad.Codigo,
                    task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, photosAmount)
            }


            let material = { 'id': nuevoMedidor.Material, 'decimal' : '1' }
            task.materiales.push(material)
            await updateMaterBySerial(task.fechaRealizado, task.meterVO.serial)

        } else {
            validateMeter = true
        }
    }

    if (removeMeter) {
        const numeroMedidor = (task.Numero_Medidor === '0') ? task.Numero_Parte : task.Numero_Medidor

        let medidorRetiradoNumber = await removeMeter(numeroMedidor)

        if (!medidorRetiradoNumber) {
            let tipoRet = '36'

            if (task.meterVO && (task.meterVO.serial === '' || task.meterVO.serial === '0')) {
                tipoRet = '41'
            }

            await storeMeter(numeroMedidor, '0', '0', task.Capacidad,
                task.Numero_Parte, '01', task.fechaRealizado, 0, 0, tiporet, task.codOperario)
        }
    }

    if (keepMeter && removeMeter) {
        await storeZ017(task.Tipo_Contrato_id, '36', task.Fecha_Emision_id, task.Numero_Parte, task.codOperario,
            task.fechaRealizado, '36', serial, oldMeter, task.Numero_Medidor, validateMeter, validePaper, task.observations,
            isSigned, '', aclaracion, dni, '', '', '')
    }

    if (adicional != 'NO') {
        await store123(task.Fecha_Emision_id, task.Tipo_Trabajo_id, task.Numero_Parte, task.fechaRealizado, task.Ngn_id, adicional)
    }

    for (const action of task.actions) {
        await store123(task.Fecha_Emision_id, task.Tipo_Trabajo_id, task.Numero_Parte, task.fechaRealizado, task.Ngn_id, action.id)
        await storeT10(task.Numero_Parte, action.id, task.fechaRealizado)
        await store135(task.Numero_Parte, task.Fecha_Emision_id, action.id)
    }
}
