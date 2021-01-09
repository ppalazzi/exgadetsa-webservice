const taskService = require('./taskService')
const sessionService = require('./sessionService')
const anomaliesService = require('./anomaliesService')
const actionsService = require('./actionsService')
const materialsService = require('./materialsService')
const artifacsService = require('./artifacsService')
const sectionsService = require('./sectionsService')
const scapeService = require('./scapeService')
const pipeMaterialsService = require('./pipeMaterialsService')
const pipePressureService = require('./pipePressureService')
const pipeSizeService = require('./pipeSizeService')
const serviceSizeService = require('./serviceSizeService')
const sidewalkService = require('./sidewalkService')
const validationService = require('./validationService')
const rejectionsService = require('./rejectionsService')
const tokenService = require('./tokenService')

const routes = Application => {
    const Elements = [
        taskService(), 
        sessionService(), 
        anomaliesService(), 
        actionsService(), 
        materialsService(), 
        artifacsService(), 
        sectionsService(),
        scapeService(), 
        pipeMaterialsService(), 
        pipePressureService(), 
        pipeSizeService(), 
        serviceSizeService(), 
        sidewalkService(), 
        validationService(),
        rejectionsService(),
        tokenService()
    ]

    Elements.forEach(element => {
        sync(element, Application)
    })
}

const sync = (Element, Application) => {
    Object.entries(Element)
        .forEach(item => {
            const method = item[0]
            const paths = Object.entries(item[1])
            paths.forEach(p => {
                Application.app[method](p[0], p[1])
            })
        })
}

module.exports = routes
