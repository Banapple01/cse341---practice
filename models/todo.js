const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
    todoTitle: {
        type: String,
        required: true
    },
    todoDesc: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'public',
        enum: ['public','private']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Todo', TodoSchema)