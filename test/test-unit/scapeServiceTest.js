/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deleteScape,
    setScape
} = require('../../api/dao/scapeQueries')

const scapeRequest = require('../seedData/scapeRequest')
describe('RECUPERACION DE GRUPO DE Fugas - API REST', () => {
    let scapeId = ''

    before('Se crea listado de fugas para el testeo ', async () => {
        const result = await setScape(scapeRequest)
        scapeId = result._id
        console.log(scapeId)
    })

    it('[ GET - /app/scape ] Recupera todas las fugas para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'scape', {
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
        console.log('ELIMINAR' + scapeId)
        await deleteScape(scapeId)
    })
})
