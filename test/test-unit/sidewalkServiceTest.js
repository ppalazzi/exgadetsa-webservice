/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deleteSidewalk,
    setSidewalk
} = require('../../api/dao/sidewalkQueries')

const genericRequest = require('../seedData/genericRequest')
describe('RECUPERACION DE GRUPO DE Tipos de Vereda - API REST', () => {
    let genericId = ''

    before('Se crea listado de tipos de vereda para el testeo ', async () => {
        const result = await setSidewalk(genericRequest)
        genericId = result._id
        console.log(genericId)
    })

    it('[ GET - /app/sidewalk ] Recupera todas los tipos de vereda para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'sidewalk', {
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
        await deleteSidewalk(genericId)
    })
})
