'use strict'

const log4js = require('log4js')
const logger = log4js.getLogger('seguimientoController')

const { getSeguimientoData, comunicarOdor, updateNegadosWithEquipment } = require('../dao/seguimientoQueries.js')
const { getMotivosByActionAndContract, getNewReason } = require('../dao/motivosQueries')
const { addAusentChangeReason } = require('../dao/maintenance')
const { getMeterRemoved, storeMeter } = require('../dao/meterQueries')
const { getValidationPaperByAction} = require('../dao/paperQueries')
const { storeT104, updateT106 } = require('../dao/generalsQueries')


module.exports = {

    updateSeguimiento: async (task) => {
        logger.info('Actualizando Seguimiento de deuda para poliza' + task.Numero_Parte)

        var accionCierre = new Array()
        var accionAdicionales = new Array()
        var accionNuevas = new Array()

        // llenar combos con acciones
        for (const action of task.actions) {
            let valida = await getValidationPaperByAction(action.id, '002', task.Tipo_Trabajo_id, action.resultado)

            if (valida) {
                if (valida.Adicional === 0) {
                    accionCierre.push(action)
                } else if (valida.Adicional === 1) {
                    accionAdicionales.push(action)
                } else if (valida.Adicional === 2) {
                    accionNuevas.push(action)
                }
            }
        }

        let actionNotResolved = (accionCierre.length > 0) ? accionCierre[0].id : ''
        const seguimientoValues = await getSeguimientoData(accionCierre[0])

        if (task.realizado) {
            await comunicarRealizado(task, actionNotResolved, seguimientoValues)
        }
        else {
            await comunicarFallido(task, actionNotResolved, seguimientoValues)
        }
    }
}

async function comunicarRealizado(task, actionNotResolved, seguimientoValues) {
    let lecture = (task.dataVO && task.dataVO.value) ? task.dataVO.value : 0
    let taskLecture = (task.Lectura) ? parseInt(task.Lectura) : 0
    let observations = (task.observations) ? task.observations : ''
    let photosAmount = (task.signature) ? task.signature.uris.length : 0

    if (taskLecture >= lecture) {
        observations = observations + ' Lectura verdadera ' + lecture
        lecture = taskLecture
    }

    await comunicarOdor(seguimientoValues.CGNF, seguimientoValues.CIERRE, task.fechaRealizado, lecture, task.codOperario, observations,
        actionNotResolved, '1', task.Numero_Parte, task.Motivo_id, task.Tipo_Trabajo_id,
        task.Fecha_Emision_id, task.Ngn_id, photosAmount)

    await store104And106(task, actionNotResolved, photosAmount)

    if (task.Tipo_Trabajo_id === 'OR') {
        let neeNumber = await getMeterRemoved(task.Numero_Medidor)

        if (!neeNumber) {
            await storeMeter(task.Numero_Medidor, '0', '0', task.Capacidad,
                task.Numero_Parte, '02', task.fechaRealizado, 0, 0, 'OR', task.codOperario)
        }
    }
}

async function comunicarFallido (task, actionNotResolved, seguimientoValues) {
    let observations = (task.observations) ? task.observations : ''
    let photosAmount = (task.signature) ? task.signature.uris.length : 0

    if (!task.Anulado) {
        if (seguimientoValues.Accion === 0) {
            await comunicateOdorInternal(task, actionNotResolved, seguimientoValues, photosAmount, observations)
        } else {
            const visitaValue = await getMotivosByActionAndContract(actionNotResolved, task.Tipo_Contrato_id)
            let visitavalue = (visitaValue) ? visitaValue.Visita : ''

            if ((task.Ausente + 1) === visitavalue) {
                await comunicateOdorInternal(task, actionNotResolved, seguimientoValues, photosAmount, observations)
            } else {
                let nuevoMotivo = task.Motivo_id
                if ((task.Ausente + 1) === seguimientoValues.Accion) {
                    if (seguimientoValues.Accion === 1) {
                        const reasonDate = await getNewReason(task.Tipo_Contrato_id, actionNotResolved, task.Motivo_id)
                        if (reasonDate) {
                            nuevoMotivo = reasonDate.Motivo
                        }
                    }
                }

                logger.info("Motivo es : " + nuevoMotivo)

                await addAusentChangeReason(task.Numero_Parte, nuevoMotivo, task.Motivo_id, task.Fecha_Emision_id, observations, '0', task.Actividad, '002')
                await store104And106(task, actionNotResolved, photosAmount)
            }
        }
    } else {
        await updateNegadosWithEquipment(task.fechaRealizado,'0', task.Numero_Parte,
            task.Fecha_Emision_id, task.Tipo_Trabajo_id, task.Motivo_id, observations, task.codOperario)

        await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, actionNotResolved,
            task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, photosAmount)
    }
}

async function comunicateOdorInternal(task, actionNotResolved, seguimientoValues, photosAmount, observations) {
    let lecture = (task.dataVO && task.dataVO.value) ? task.dataVO.value : ''

    await comunicarOdor(seguimientoValues.CGNF, seguimientoValues.CIERRE, task.fechaRealizado, lecture, task.codOperario, observations,
        actionNotResolved, '1', task.Numero_Parte, task.Motivo_id, task.Tipo_Trabajo_id,
        task.Fecha_Emision_id, task.Ngn_id, photosAmount)

    await store104And106(task, actionNotResolved, photosAmount)
}

async function store104And106 (task, actionNotResolved, photosAmount) {
    await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, actionNotResolved,
        task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, photosAmount)

    await updateT106(actionNotResolved, task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
        task.Tipo_Contrato_id, task.Ngn_id)
}
