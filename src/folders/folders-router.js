const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')


const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    title: xss(folder.title)
})

foldersRouter
    .route('/')

    .get((req, res, next) => {
        FoldersService.getAllFolders(req.app.get('db'))
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })

    .post(jsonParser, (req, res, next) => {
        const { title } = req.body;
        const newFolder = { title }

        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })


foldersRouter
    .route('/:folder_id')

    .get((req, res, next) => {
        FoldersService.getById(
            req.app.get('db'),
            req.params.folder_id
        )
            .then(folder => {
                if (!folder) {
                    return res
                        .status(404)
                        .json({
                            error: {
                                message: `Folder with id ${req.params.folder_id} does not exist`
                            }
                        })
                }
                res
                    .status(200)
                    .json(folder)
            })
    })

    .delete((req, res, next) => {
        FoldersService.deleteFolder(
            req.app.get('db'),
            req.params.folder_id
        )

            .then(rowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = foldersRouter;