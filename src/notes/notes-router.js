const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    title: xss(note.title),
    content: xss(note.content),
    modified: note.modified,
    folder: Number(note.folder),
})

notesRouter
    .route('/')

    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => {
                res
                    .status(200)
                    .json(notes.map(serializeNote))
            })
            .catch(next)
    })

    .post(jsonParser, (req, res, next) => {
        const { title, content, folder } = req.body
        const newNote = { title, content, folder }

        for (const [key, value] of Object.entries(newNote))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body` }
                })

        NotesService.insertNotes(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .json(serializeNote(note))
            })
            .catch(next)
    })



notesRouter
    .route('/:note_id')

    .get((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res
                        .status(404)
                        .json({
                            error: {
                                message: `Note with id ${req.params.note_id} does not exist`
                            }
                        })
                }
                res
                    .status(200)
                    .json(note)
            })
            .catch(next)
    })


    .delete((req, res, next) => {
        NotesService.deleteNotes(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res
                        .status(404)
                        .json({
                            error: {
                                message: `Note with id ${req.params.note_id} does not exist`
                            }
                        });
                }
                res
                    .status(204)
                    .end();
            })
            .catch(next)
    })


module.exports = notesRouter;