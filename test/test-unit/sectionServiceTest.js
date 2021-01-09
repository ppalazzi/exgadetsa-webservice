/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deleteSections,
    setSections
} = require('../../api/dao/sectionsQueries')

const sectionsRequest = require('../seedData/sectionsRequest')
describe('RECUPERACION DE GRUPO DE Sectores - API REST', () => {
    let sectionsId = ''

    before('Se crea listado de artefactos para el testeo ', async () => {
        const result = await setSections(sectionsRequest)
        sectionsId = result._id
        console.log(sectionsId)
    })

    it('[ GET - /app/sections ] Recupera todas los sectores para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'sections', {
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
        console.log('ELIMINAR' + sectionsId)
        await deleteSections(sectionsId)
    })
})
