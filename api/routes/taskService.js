'use strict'
const { getTasksByUser, updateTask, unassignedTask, assignLocation } = require('../controller/taskController')

const taskService = () => ({
    get: {
        '/app/tasks/user/:id': (req, res) => {
            var usrId = req.params.id
            getTasksByUser(usrId, res)
        }
    },

    put: {
        '/app/tasks/update': (req, res) => {
            updateTask(req, res)
        },

        '/app/task/unassign': (req, res) => {
            unassignedTask(req, res)
        },

        '/app/task/coordinates': (req, res) => {
            assignLocation(req, res)
        }
    },

})

module.exports = taskService
