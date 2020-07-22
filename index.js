// for .env file
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
// Person constructor module
const Person = require('./modules/person')

// required for using react production build
app.use(express.static('build'))

app.use(express.json())

app.use(cors())

// this prints GET/POST etc. stuff to console
morgan.token('post-body', (req, res) => { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res) => {
    // const id = Number(req.params.id)
    // const person = persons.find(note => note.id === id)

    // if (person) {
    //     res.json(person)
    // } else {
    //     res.status(404).end()
    // }
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.get('/info', (req, res) => {
    const phonebookLength = persons.length
    const timeStamp = new Date()
    res.send(`
        <p>Phonebook has info for ${phonebookLength} people.
        </p> <p>${timeStamp}</p>
        `)
})

const PORT = process.env.PORT
app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`)
})