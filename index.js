require('dotenv').config()
const express = require('express')
const nodemon = require('nodemon')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.json())
//Loads static content from dist directory with production build
app.use(express.static('dist'))

morgan.token('input', (req, res) => {
    return JSON.stringify(req.body)
})

/**
 * Logs every Request to the Console in the predefined 'tiny' format + input format 
 * 
 */
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :input'))
/**
let phonebook = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]
*/

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(length => {
        console.log(length)
        response.send(`
        <p>
            Phonebook has info for ${length} people.
        </p>
        <p>
            ${new Date().toString()}
        </p>
        `
        )
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })

})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person)
            response.json(person)
        else
            response.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(person => {
        response.status(204).end()
    })
        .catch(error => {
            console.log('Here is the problem');
            next(error)
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true }).then(update => {
        response.json(update)
    })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }
    const newPerson = new Person({
        name: body.name,
        number: body.number
    })
    newPerson.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint!' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on Port: ${PORT}`);
})