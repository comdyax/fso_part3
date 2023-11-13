require('dotenv').config()
const express = require('express')
require('nodemon')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.json())
//Loads static content from dist directory with production build
app.use(express.static('dist'))

morgan.token('input', (request) => {
  return JSON.stringify(request.body)
})

/**
 * Logs every Request to the Console in the predefined 'tiny' format + input format
 *
 */
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :input'))

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(length => {
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
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end()
  })
    .catch(error => {
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' })
    .then(update => {
      response.json(update)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })
  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => { next(error) })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint!' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`)
})