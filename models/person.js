const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting', url);

mongoose.connect(url)
    .then(result => {
        console.log('connected to MONGODB')
    })
    .catch((error) => {
        console.log('error connecting to MONGOBD:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

personSchema.set('toJSON', {
    transform: (document, retO) => {
        retO.id = retO.toString()
        delete retO._id
        delete retO.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
