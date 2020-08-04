require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./modules/mongoosePerson')
// const { response } = require('express')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
// app.use(logger)

// this prints GET/POST etc. stuff to console
morgan.token('post-body', (req) => { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

// get all persons
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

// get specific person using id
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                next('Person not found')
            }
        })
        .catch(error => next(error))
})

// delete specific person using id
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then( () => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

// add person
app.post('/api/persons', (req, res, next) => {
    console.log('Post beginning')
    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            res.json(savedPerson)
        })
        .catch(error => next(error))
})

// update person
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        const phonebookLength = persons.length
        const timeStamp = new Date()
        res.send(`
            <p>Phonebook has info for ${phonebookLength} people.
            </p> <p>${timeStamp}</p>
            `)
    })
})

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error === 'Person not found') {
        return res.status(404).send({ error: 'Person not found' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`)
})