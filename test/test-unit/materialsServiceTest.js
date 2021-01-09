/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deleteMaterials,
    setMaterials
} = require('../../api/dao/materialsQueries')

const materialsRequest = require('../seedData/materialsRequest')
describe('RECUPERACION DE GRUPO DE Materiales - API REST', () => {
    let materialId = ''

    before('Se crea listado de materiales para el testeo ', async () => {
        const result = await setMaterials(materialsRequest)
        materialId = result._id
        console.log(materialId)
    })

    it('[ GET - /app/materials ] Recupera todas los materiales para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'materials', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-cache'
        })
        expect(responseClient.status).to.be.equal(200)

        const post = await responseClient.json()
        expect(post).to.have.property('status')
        expect(post).to.have.property('data')
        expect(post.data.length).to.be.greaterThan(0)

        const dataClient = post.data[0]
        expect(dataClient).to.have.property('_id')
        expect(dataClient).to.have.property('descripcion')
    })

    after('Se eliminan los registros testeados ', async () => {
        console.log('ELIMINAR' + materialId)
        await deleteMaterials(materialId)
    })
})
