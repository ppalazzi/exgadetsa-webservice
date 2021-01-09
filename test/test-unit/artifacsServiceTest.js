/* eslint-disable no-undef */
'use strict'
const {
    expect,
    fetch,
    req
} = require('../config')

const {
    deleteArtifacs,
    setArtifacs
} = require('../../api/dao/artifacsQueries')

const artifacsRequest = require('../seedData/artifacsRequest')
describe('RECUPERACION DE GRUPO DE Artefactos - API REST', () => {
    let artifactId = ''

    before('Se crea listado de artefactos para el testeo ', async () => {
        const result = await setArtifacs(artifacsRequest)
        artifactId = result._id
        console.log(artifactId)
    })

    it('[ GET - /app/artifacs ] Recupera todas los artefactos para pintar la solapa', async () => {
        const responseClient = await fetch(req + 'artifacs', {
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
        console.log('ELIMINAR' + artifactId)
        await deleteArtifacs(artifactId)
    })
})
