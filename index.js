const express = require('express')
const nodemon = require('nodemon')
const morgan = require('morgan')
const app = express()

app.use(express.json())
//Loads static content from dist directory
app.use(express.static('dist'))

morgan.token('input', (req, res) => {
    return JSON.stringify(req.body)
})

/**
 * Logs every Request to the Console in the predefined 'tiny' format + input format 
 * 
 */
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :input'))

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

app.get('/info', (request, response) => {
    console.log(new Date().toString());
    response.send(`
        <p>
            Phonebook has info for ${phonebook.length} people.
        </p>
        <p>
            ${new Date().toString()}
        </p>
        `
    )
})

app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = phonebook.find(person => person.id === id)
    if (person)
        response.json(person)
    else
        response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(person => person.id !== id)
    response.status(204).end()
})

const generateID = () => {
    return Math.floor(Math.random() * 99999999)
}

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
    if (phonebook.map(p => p.name).includes(body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }


    const newPerson = {
        id: generateID(),
        name: body.name,
        number: body.number
    }

    phonebook = phonebook.concat(newPerson)
    response.json(newPerson)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on Port: ${PORT}`);
})