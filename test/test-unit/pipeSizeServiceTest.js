/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deletePipeSizes,
    setPipeSizes
} = require('../../api/dao/pipeSizeQueries')

const genericRequest = require('../seedData/genericRequest')
describe('RECUPERACION DE GRUPO DE dimensiones de Caño - API REST', () => {
    let genericId = ''

    before('Se crea listado de dimensiones de caño para el testeo ', async () => {
        const result = await setPipeSizes(genericRequest)
        genericId = result._id
        console.log(genericId)
    })

    it('[ GET - /app/pipe_size ] Recupera todas las dimensiones del caño para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'pipe_size', {
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
        await deletePipeSizes(genericId)
    })
})
