'use strict'

const { storeT104, updateT106 } = require('../dao/generalsQueries')


const log4js = require('log4js')
const logger = log4js.getLogger('acometidasController')

const { notifyAcometida, addAusentChangeReason } = require('../dao/acometidasQueries')
const { getNewReason } = require('../dao/generalsQueries')
const { storeMaterialsForTask } = require('./commons-functions')


module.exports = {

    updateAcometidas: async (task) => {
        logger.info('Actualizando Acometida para el núemero de parte : ' + task.Numero_Parte)

        if (task.realizado) {
            await notifyTaskDone(task)
        }
        else {
            await notifiyTaskFailed(task)
        }
    }
}

async function notifyTaskDone(task) {
    let actionNotResolved = task.actions[0].id;
    let observations = (task.observations) ? task.observations : ''

    await updateT106(actionNotResolved, task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
        task.Tipo_Contrato_id, task.Ngn_id)

    for (const action of task.actions) {
        await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, action.id,
            task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, 0)
    }

    await notifyAcometida(task.Numero_Parte, task.Fecha_Emision_id, task.Tipo_Trabajo_id, task.Motivo_id, task.fechaRealizado, task.Ngn_id, task.codOperario, observations, task.pipeVO, 'R')
    await storeMaterialsForTask(task)
}

async function notifiyTaskFailed(task) {
    const observations = (task.observations) ? task.observations : ''
    const actionNotResolved = task.actions[0].id;
    const isSigned = (task.signature && task.signature.signature) ? 'SI' : 'NO'
    const conformidad = (task.signature && task.signature.conformidad) ? 'SI' : 'NO'
    const aclaracion = task.signature ? task.signature.aclaracion : ''
    const dni = task.signature ? task.signature.dni : ''

    let reason = task.Motivo_id

    for (const action of task.actions) {
        await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, action.id,
            task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, 0)

        let reasonCurrent = await getNewReason(task.Tipo_Contrato_id, action.id , reason)

        if (reasonCurrent) {
            reason = reasonCurrent
        }
    }

    await updateT106(actionNotResolved, task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
        task.Tipo_Contrato_id, task.Ngn_id)

    if (reason === task.Motivo_id) {
        await notifyAcometida(task.Numero_Parte, task.Fecha_Emision_id, task.Tipo_Trabajo_id, task.Motivo_id,
            task.fechaRealizado, task.Ngn_id, task.codOperario, observations, task.pipeVO, 'R',
            isSigned, conformidad, aclaracion, dni)
    }
    else {
        addAusentChangeReason(task.Numero_Parte, reason, task.Motivo_id, task.Fecha_Emision_id, observations, task.Ngn_id, task.Tipo_Contrato_id)
    }
}
