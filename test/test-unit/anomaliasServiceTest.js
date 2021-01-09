/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deleteAnomaliesGroups,
    setAnomaliesGroups
} = require('../../api/dao/anomaliesQueries')

const anomaliaRequest = require('../seedData/anomaliaRequest')
describe('RECUPERACION DE GRUPO DE ANOMALIAS - API REST', () => {
    let anomaliaId = ''

    before('Se crea listado de anomalias para el testeo ', async () => {
        const result = await setAnomaliesGroups(anomaliaRequest)
        anomaliaId = result._id
        console.log(anomaliaId)
    })

    it('[ GET - /app/anomalias ] Recupera todas las anomalias para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'anomalias', {
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
        console.log('ELIMINAR' + anomaliaId)
        await deleteAnomaliesGroups(anomaliaId)
    })
})
