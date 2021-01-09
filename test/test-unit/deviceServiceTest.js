/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deleteDeviceInfo
} = require('../../api/dao/deviceQueries')

const deviceRequest = require('../seedData/deviceInfoRequest')
describe('REGISTRO DE DISPOSITIVO PARA NOTIFICACIONES - API REST', () => {
    let deviceInfoId = ''

    it('[ POST - /app/materials ] Registra un nuevo dispositivo', async () => {
        const responseClient = await fetch(req + 'register/device', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deviceRequest),
            cache: 'no-cache'
        })
        expect(responseClient.status).to.be.equal(200)

        const post = await responseClient.json()
        expect(post).to.have.property('status')
        expect(post).to.have.property('data')
        expect(post.data).to.be.a('object')

        /** Return the same element that persist */
        const deviceInfo = post.data
        expect(deviceInfo).to.have.property('_id')
        expect(deviceInfo).to.have.property('usuario')
        expect(deviceInfo).to.have.property('token')
        deviceInfoId = deviceInfo._id
    })

    after('Se eliminan los registros testeados ', async () => {
        await deleteDeviceInfo(deviceInfoId)
    })
})