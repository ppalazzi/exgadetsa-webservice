/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deletePipePressures,
    setPipePressures
} = require('../../api/dao/pipePressureQueries')

const genericRequest = require('../seedData/genericRequest')
describe('RECUPERACION DE GRUPO DE MAteriales de Caño - API REST', () => {
    let genericId = ''

    before('Se crea listado de materiales para el testeo ', async () => {
        const result = await setPipePressures(genericRequest)
        genericId = result._id
        console.log(genericId)
    })

    it('[ GET - /app/pipe_pressure ] Recupera todas los materiales para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'pipe_pressure', {
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
        console.log('ELIMINAR' + genericId)
        await deletePipePressures(genericId)
    })
})
