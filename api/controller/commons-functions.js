'use strict'

const { storeMaterials, uncountMaterials } = require('../dao/utilizationQueries')

module.exports = {

    storeMaterialsForTask: async  (task) => {
        //store materials
        if (task.materiales.length > 0) {
            for (const material of task.materiales) {
                await storeMaterials(task.Tipo_Trabajo_id, task.Fecha_Emision_id, task.Numero_Parte,
                    material, task.fechaRealizado, task.Ngn_id, task.Tipo_Contrato_id)
            }

            await uncountMaterials(task.materiales, task.codOperario, task.Tipo_Contrato_id, task.fechaRealizado)
        }
    }

}


