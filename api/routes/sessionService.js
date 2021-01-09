'use strict'
const {
    userLogin,
    deleteUser,
    createUser,
    findUserById
} = require('../controller/sessionController')

const sessionService = () => ({
    put: {
        '/app/user/login': (req, res) => {
            userLogin(req, res)
        }
    },

    post: {
        '/app/user/create': (req, res) => {
            createUser(req, res)
        }
    },

    delete: {
        '/app/user/:id': (req, res) => {
            var id = req.params.id
            deleteUser(id, res)
        }
    },

    get: {
        '/app/user/:id': (req, res) => {
            var id = req.params.id
            findUserById(id, res)
        }
    }
})

module.exports = sessionService
