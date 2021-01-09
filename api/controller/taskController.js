'use strict'
const config = require('config')
const { genericResponse, parseJSONObject, createEntityFromBody } = require('../common/commonFunctions')
const { retrieveTasksByUser, asssingCoordinates } = require('../dao/taskQueries')
const { retrieveTabsRelation } = require('../dao/tabsRelationQueries')
const { getMeterByActionAndContract, getMeterBySerial, updateMaterBySerial, getMeterRemoved, storeMeter } = require('../dao/meterQueries')
const { getValidationPaperByAction } = require('../dao/paperQueries')
const { updateUTI, newutilization, changeReason, storeArtifacts, storeMaterials, uncountMaterials, storeAditional } = require('../dao/utilizationQueries')
const { storeT104, storeZ017, updateT106, unassignedTask } = require('../dao/generalsQueries')
const { getTaskByActionAndContract } = require('../dao/actionTaskQueries')
const { getMotivosByActionAndContract, getNewReason } = require('../dao/motivosQueries')
const { getNewActivity, addAusentChangeReason, comunicateMaintenance, storeScapes, storeHoles, updateC900, updateC905 } = require('../dao/maintenance')
const { storeRejections, getRejectiosByPartNumber } = require('../dao/rejectionsQueries')
const { updateAcometidas } = require('./acometidasController')
const { notifiyCRC } = require('./crcIlicitosController')
const { updateSeguimiento } = require('./seguimientoController')
const { storeMaterialsForTask } = require('./commons-functions')

const log4js = require('log4js')
const logger = log4js.getLogger('taskController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    getTasksByUser: async (userId, response) => {
        logger.info('getTaskByUser - User: ' + userId)
        try {
            const [relations, resultList] = await Promise.all([retrieveTabsRelation(), retrieveTasksByUser(userId)])

            var tasks = new Array()
            for (const task of resultList) {
                let values = await getRejectiosByPartNumber(task.Numero_Parte)
                addRejectionsCodes(task, values)
                addTabsRelationToTask(task, relations)
                tasks.push(task)
            }

            let resturnMsj = text.EMPTY
            if (tasks.length === 0) {
                resturnMsj = 'No se encontraron TAREAS para el usuario: ' + userId
            }
            logger.info('getTaskByUser - Se recuperaron [' + tasks.length + '] tareas para el usuario: ' + userId)
            genericResponse(response, resturnMsj, status.OK, parseJSONObject(tasks))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    },

    updateTask: async (request, response) => {
        logger.info('Actualizando Tarea')

        try {
            const element = createEntityFromBody(request)

            if (element.Tipo_Contrato_id === '001') {
                await updateContact001(element)
            }
            if (element.Tipo_Contrato_id === '002') {
                await updateSeguimiento(element)
            }
            if (element.Tipo_Contrato_id === '003') {
                await notifiyCRC(element)
            }
            if (element.Tipo_Contrato_id === '005') {
                await updateContract005(element)
            }
            if (element.Tipo_Contrato_id === '004') {
                await updateAcometidas(element)
            }

            logger.info('Tarea Actualizada : ' + element.Numero_Parte)
            genericResponse(response, text.EMPTY, status.OK, 'Tarea actualizada correctamente')
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }

    },

    unassignedTask: async (request, response) => {
        logger.info('Tarea no será realizada')

        try {
            const element = createEntityFromBody(request)

            await unassignedTaskFrom(element)

            logger.info('Tarea desasignada')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(element))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    },

    assignLocation: async (request, response) => {
        logger.info('Asignando coordenadas a la tarea')

        try {
            const coordinates = createEntityFromBody(request)
            await asssingCoordinates(coordinates)

            logger.info('Asignacion exitosa : ' + coordinates.poliza)
            genericResponse(response, text.EMPTY, status.OK, 'Exito al desasignar')
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}

function addTabsRelationToTask (task, relations) {
    task.relation = []
    relations.map((relation) => {
        if (relation.id === task.Motivo_id && relation.contractId === task.Tipo_Contrato_id) {
            task.relation = relation.tabs
        }
    })
    return task
}

function addRejectionsCodes(task, rejections) {
    task.Rechazos = []
    rejections.map((rejection) => {
        task.Rechazos.push(rejection.Codigo)
    })
}

async function unassignedTaskFrom (task) {
    const result = await unassignedTask(task.Numero_Parte, task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Tipo_Contrato_id,
        task.Numero_Recorrido, task.Ngn_id)

    if (result) {
        await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, 'NV',
            task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, 0)

        await updateT106('NV', task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
            task.Tipo_Contrato_id, task.Ngn_id)
    }
}

async function updateContract005 (task) {
    logger.info('Tipo de Contrato : 005')

    try {
        if (task.realizado) {
            await comunicarRealizado(task)
        } else {
            await comunicarFallido(task)
        }
    } catch (error) {
        throw error
    }
}

async function updateContact001 (task) {
    logger.info('Tipo de Contrato : 001')

    var keepMeter = true
    var validePaper = false
    var accionCierre = new Array()
    var accionAdicionales = new Array()
    var accionNuevas = new Array()
    let validateMeter = false

    for (const action of task.actions) {
        logger.info('Mantengo medidor ? : ' + keepMeter)

        if (keepMeter) {
            keepMeter = !(await retrieveMeter(action.id, '001'))
        }

        //validando papel
        logger.debug('Debo validar ' + validePaper)

        let valida = await retrieveValidations(action.id, '001', task.Motivo_id, action.resultado)

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
    }

    if (task.meterVO && task.meterVO.serial) {
        const nuevoMedidor = await getMeterBySerial(task.meterVO.serial)

        if (nuevoMedidor && nuevoMedidor.Operario === task.codOperario && nuevoMedidor.Estado === 1) {
            let material = {
                'id': nuevoMedidor.Material,
                'decimal': '1'
            }
            task.materiales.push(material)
            await updateMaterBySerial(task.fechaRealizado, task.meterVO.serial)
        } else {
            validateMeter = true
        }
    }

    await notifyTask(task, accionCierre, validateMeter, validePaper, accionAdicionales, accionNuevas)
    await storeArtifacs(task)
    await storeMaterialsForTask(task)
    await storeRejectionsForTask(task)

    if (!keepMeter) {
        let neeNumber = await getMeterRemoved(task.Numero_Medidor)
        let newSerial = (task.meterVO && task.meterVO.serial) ? task.meterVO.serial : ''

        if (!neeNumber) {
            let tiporet = '36'

            if (newSerial === '' || newSerial === '0') {
                tiporet = '41'
            }

            storeMeter(task.Numero_Medidor, '0', '0', task.Capacidad,
                task.Numero_Parte, task.Tipo_Contrato_id, task.fechaRealizado, 0, 0, tiporet, task.codOperario)
        }

    }

    logger.info('Accion cierre : ' + accionCierre.length)
    logger.info('Accion Adicionales : ' + accionAdicionales.length)
    logger.info('Accion Nueva : ' + accionNuevas.length)
    logger.info('Materiales :' + task.materiales)
}

async function storeArtifacs (task) {
    // store artifacts
    let index = 1
    for (const artifac of task.artifacts) {
        await storeArtifacts(task.Numero_Parte, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
            task.Ngn_id, artifac, task.Tipo_Contrato_id, index)
        index++
    }
}

async function storeRejectionsForTask (task) {
    if (task.rejections.length > 0) {
        for (const rejection of task.rejections) {
            await storeRejections(task.Numero_Parte, task.Fecha_Emision_id, task.Tipo_Trabajo_id, task.Ngn_id, rejection.id, task.fechaRealizado)
        }
    }
}

async function notifyTask (task, accionCierre, validateMeter, validePaper, accionAdicionales, accionNuevas) {
    let actionNotResolved = (accionCierre.length > 0) ? accionCierre[0].id : ''
    let isSigned = (task.signature && task.signature.signature) ? 'SI' : 'NO'
    let serial = (task.meterVO && task.meterVO.serial) ? task.meterVO.serial : ''
    let lecture = (task.dataVO && task.dataVO.value) ? task.dataVO.value : ''
    let photosAmount = (task.signature) ? task.signature.uris.length : 0
    let peopleAmount = (task.addressVO && task.addressVO.numberPeople) ? task.addressVO.numberPeople : 0
    let incorrectAddress = (task.addressVO && task.addressVO.isWrongAddress) ? 'SI' : 'NO'
    let isAnotherMeter = (task.addressVO && task.addressVO.isAnotherMeter) ? 'SI' : 'NO'
    let scapeInsentity = (task.addressVO && task.addressVO.escapeIntensity) ? task.addressVO.escapeIntensity : 0
    let observations = (task.observations) ? task.observations : ''
    let conformidad = (task.signature && task.signature.conformidad) ? 'SI' : 'NO'

    if (task.realizado) {
        // comunicar uti
        await updateUTI(task.fechaRealizado, task.codOperario, observations, task.Numero_Parte, task.Motivo_id, task.Ngn_id)
        await newutilization(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte, task.Ngn_id, task.Motivo_id, actionNotResolved,
            task.fechaRealizado, task.codOperario, observations, '', 'R', isSigned, '', task.codOperario,
            task.Numero_Medidor, lecture, serial, '0', validateMeter, validePaper, photosAmount,
            peopleAmount, scapeInsentity, incorrectAddress, isAnotherMeter, conformidad)
        // fin comunicar uti

        await updateT106(actionNotResolved, task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
            task.Tipo_Contrato_id, task.Ngn_id)

        for (const action of task.actions) {
            await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, action.id,
                task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, photosAmount)
        }

        for (const action of accionAdicionales) {
            await storeAditional(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte, task.Ngn_id, action.id, task.fechaRealizado, '001')
        }

        storeNewsActions(accionNuevas, task, 'R', serial, lecture, validateMeter, validePaper, observations,
            isSigned)
    } else {
        // task con acciones no realizadas
        await updateT106(actionNotResolved, task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
            task.Tipo_Contrato_id, task.Ngn_id)

        for (const action of task.actions) {
            await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, action.id,
                task.Tipo_Contrato_id, '1', '1', task.Motivo_id, task.Ngn_id, task.Tipo_Trabajo_id, photosAmount)
        }

        for (const action of accionAdicionales) {
            await storeAditional(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte, task.Ngn_id, action.id, task.fechaRealizado, '001')
        }

        storeNewsActions(accionNuevas, task, 'F', serial, lecture, validateMeter, validePaper, observations,
            isSigned)

        let actionByTask = await getTaskByActionAndContract(actionNotResolved, task.Tipo_Contrato_id)
        if (actionByTask && actionByTask.ActionValue === 0) {
            // comunicar UTI
            await updateUTI(task.fechaRealizado, task.codOperario, observations, task.Numero_Parte, task.Motivo_id, task.Ngn_id)
            await newutilization(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte, task.Ngn_id, task.Motivo_id, actionNotResolved,
                task.fechaRealizado, task.codOperario, observations, '', 'F', isSigned, '', task.codOperario,
                task.Numero_Medidor, lecture, serial, '0', validateMeter, validePaper, photosAmount,
                peopleAmount, scapeInsentity, incorrectAddress, isAnotherMeter, conformidad)
        } else {
            let visitaValue = await getMotivosByActionAndContract(actionNotResolved, task.Tipo_Contrato_id)

            if (visitaValue && (task.Ausente + 1 <= actionByTask.Visita)) {
                // comunicar UTI
                await updateUTI(task.fechaRealizado, task.codOperario, observations, task.Numero_Parte, task.Motivo_id, task.Ngn_id)
                await newutilization(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte, task.Ngn_id, task.Motivo_id, actionNotResolved,
                    task.fechaRealizado, task.codOperario, observations, '', 'F', isSigned, '', task.codOperario,
                    task.Numero_Medidor, lecture, serial, '0', validateMeter, validePaper, photosAmount,
                    peopleAmount, scapeInsentity, incorrectAddress, isAnotherMeter, conformidad)
            } else {
                let newReason = ''

                if (task.Ausente + 1 <= (actionByTask && actionByTask.Cantidad)) {

                    if (actionByTask && actionByTask.ActionValue === 1) {
                        let reasonFromBase = await getNewReason(task.Tipo_Contrato_id, actionNotResolved, task.Tipo_Trabajo_id)

                        if (reasonFromBase) {
                            newReason = reasonFromBase.Motivo
                        }
                    } else {
                        newReason = task.Motivo_id
                    }

                    await changeReason(task.Numero_Parte, newReason, task.Motivo_id, task.Fecha_Emision_id, task.Ngn_id, task.Tipo_Contrato_id)
                } else {
                    await changeReason(task.Numero_Parte, newReason, task.Motivo_id, task.Fecha_Emision_id, task.Ngn_id, task.Tipo_Contrato_id)
                }
            }
        }
    }
}

async function storeNewsActions (accionNuevas, task, resultValue, serial, lecture, validateMeter, validePaper,
                                 observations, isSigned) {
    if (accionNuevas.length >= 0) {
        for (const action of accionNuevas) {
            const result = await retrieveValidations(action.id, task.Motivo_id, task.Tipo_Trabajo_id, resultValue)
            let newTask = (result && result[0].Tarea) ? result[0].Tarea : ''
            await storeZ017(task.Tipo_Contrato_id, newTask, task.Fecha_Emision_id, task.Numero_Parte, task.codOperario,
                task.fechaRealizado, action.id, serial, lecture, task.Numero_Medidor, validateMeter, validePaper, observations,
                isSigned, '', '', task.codOperario, '', '', '')
        }
    }
}

async function retrieveMeter (actionId, contractId) {
    const medidor = await getMeterByActionAndContract(actionId, contractId)
    return (medidor && medidor.Medidor == '1')

}

async function retrieveValidations (actionId, contractId, jobType, result) {
    return await getValidationPaperByAction(actionId, contractId, jobType, result)
}

async function comunicarRealizado (task) {
    let canoMaterial = task.pipeVO ? task.pipeVO.pipeExternalId : 0
    let canoDiametro = task.pipeVO ? task.pipeVO.pipeSizeExternalId : 0
    let serviceMaterial = task.pipeVO ? task.pipeVO.serviceExternalId : 0
    let serviceSize = task.pipeVO ? task.pipeVO.serviceSizeExternalId : 0
    let canoEstado = task.pipeVO ? task.pipeVO.pipeStatusId : 0
    let photosAmount = task.signature ? task.signature.uris.length : 0

    let vereda = 'NO'
    let m2 = 0


    await updateT106('R', task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
        task.Tipo_Contrato_id, '0')

    await comunicateMaintenance(task.Numero_Parte, task.Fecha_Emision_id, task.Tipo_Trabajo_id, task.Motivo_id, task.fechaRealizado, '0',
        task.codOperario, '', canoMaterial, canoDiametro, serviceMaterial,
        serviceSize, canoEstado, '', vereda, m2, task.Actividad, 'M2', '')

    // guardo las acciones
    for (const action of task.actions) {
        await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, action.id,
            task.Tipo_Contrato_id, '1', '1', task.Motivo_id, '0', task.Tipo_Trabajo_id, photosAmount)
    }

    // guardo las fugas
    for (const scape of task.scapes) {
        await storeScapes(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte, scape)
    }

    // guardo los pozo
    for (const hole of task.holes) {
        if (hole.sideWalkId) {
            vereda = 'SI'
            m2 = hole.width * hole.height
            await storeHoles(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte, hole)
        }
    }
    await updateC900(task.fechaRealizado, task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte)
    await updateC905(task.fechaRealizado, '0', task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte)


    // guardar materiales
    if (task.materiales) {
        for (const material of task.materiales) {
            await storeMaterials(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte, material, task.fechaRealizado, '0', task.Tipo_Contrato_id)
        }

        await uncountMaterials(task.materiales, task.codOperario, task.Tipo_Contrato_id, task.fechaRealizado)
    }

}

async function comunicarFallido (task) {
    let photosAmount = (task.signature && task.signature.uris) ? task.signature.uris.length : 0

    let newReason = await getNewReason('005', 'F', task.Motivo_id)
    newReason = (newReason) ? newReason.Motivo : ''

    const newActivity = await getNewActivity(task.Motivo_id, newReason)


    for (const action of task.actions) {
        await storeT104(task.fechaRealizado, task.Fecha_Emision_id, task.codOperario, task.Numero_Parte, action.id,
            task.Tipo_Contrato_id, '1', '1', task.Motivo_id, '0', task.Tipo_Trabajo_id, photosAmount)
    }

    await updateT106('F', task.Numero_Parte, task.Numero_Recorrido, task.Fecha_Emision_id, task.Tipo_Trabajo_id,
        task.Tipo_Contrato_id, '0')

    await addAusentChangeReason(task.Numero_Parte, newReason, task.Motivo_id, task.Fecha_Emision_id, task.observations, '0', newActivity, '005')
}
