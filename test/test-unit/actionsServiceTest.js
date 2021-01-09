/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deleteActionsGroups,
    setActionsGroups
} = require('../../api/dao/actionsQueries')

const actionsRequest = require('../seedData/actionsRequest')
describe('RECUPERACION DE GRUPO DE ACCIONES - API REST', () => {
    let actionId = ''

    before('Se crea listado de grupos para el testeo ', async () => {
        const result = await setActionsGroups(actionsRequest)
        actionId = result._id
        console.log(actionId)
    })

    it('[ GET - /app/actions ] Recupera todas las Actions para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'actions', {
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
        console.log('ELIMINAR' + actionId)
        await deleteActionsGroups(actionId)
    })
})
