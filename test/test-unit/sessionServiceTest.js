/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const createRequest = require('../seedData/createRequest.json')
const sessionRequest = require('../seedData/sessionRequest.json')
describe('APP SESSION API REST (USER ABM)', () => {
    it('POST /app/user/create debe crear un usuario nuevo, y devolverlo como resultado ', async () => {
        const responseClient = await fetch(req + 'user/create', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createRequest),
            cache: 'no-cache'
        })
        expect(responseClient.status).to.be.equal(200)
        const post = await expectResult(responseClient)
        expect(post.data).to.be.an('Object')

        /** Return the same element that persist */
        const dataClient = post.data
        expect(dataClient.userId).to.be.equal(1)
    })

    it('PUT /app/user/login debe verificar que el cliente exista y devolverlo ', async () => {
        const responseClient = await fetch(req + 'user/login', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionRequest),
            cache: 'no-cache'
        })
        expect(responseClient.status).to.be.equal(200)
        const post = await expectResult(responseClient)
        expect(post.data).to.be.a('array')

        /** Return the same element that persist */
        const dataClient = post.data
        expect(dataClient[0].userId).to.be.equal(1)
    })

    it('GET /app/user debe buscar un usuario x id y devolverlo ', async () => {
        const responseClient = await fetch(req + 'user/' + 1, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-cache'
        })
        expect(responseClient.status).to.be.equal(200)
        const post = await expectResult(responseClient)
        expect(post.data).to.be.a('array')
        expect(post.data.length).to.be.equal(1)

        /** Return the same element that persist */
        const dataClient = post.data
        expect(dataClient[0].userId).to.be.equal(1)
    })

    it('DELETE /app/user debe eliminar un usuario por su id ', async () => {
        const responseClient = await fetch(req + 'user/' + 1, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-cache'
        })
        expect(responseClient.status).to.be.equal(200)
    })

    it('GET /app/user debe buscar y no devolverte ningun registro, ya que fue borrado ', async () => {
        const responseClient = await fetch(req + 'user/' + 1, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
        expect(responseClient.status).to.be.equal(200)
        const post = await expectResult(responseClient)
        expect(post.data).to.be.an('array')
        expect(post.data.length).to.be.equal(0)
    })
})

async function expectResult (responseClient) {
    const post = await responseClient.json()
    expect(post).to.have.property('status')
    expect(post).to.have.property('data')
    return post
}
