const mongoose = require('mongoose')

// TODO Prompt for Password en Params
const arguments = process.argv.length
if (arguments < 3) {
    console.log('give password as argument')
}
const password = process.argv[2]


const url = `mongodb+srv://Cody:${password}@testfso.kflgwcn.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (arguments === 5) {
    const name = process.argv[3]
    const number = process.argv[4]
    const person = new Person({
        name: name,
        number: number
    })

    person.save().then(result => {
        console.log('Added Person to Phonebook')
        console.log(result)
        mongoose.connection.close()
    })
}
else if (arguments === 3) {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}
else {
    console.log('Too many arguments')
    console.log('Add new Person: <password> <name> <number>')
    console.log('Show all Phonebook entries: <password>')
    mongoose.connection.close()
}