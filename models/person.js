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
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        validate: {
            validator: function(val) {
                return /[\d{2,3}-\d{5,}]{9,}/.test(val)
            },
            message: props => `Not a valid phone number`
        },
        required: [true, 'Phone number required']
    }
})

personSchema.set('toJSON', {
    transform: (document, retO) => {
        retO.id = retO._id.toString()
        delete retO._id
        delete retO.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
