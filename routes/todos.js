const express = require('express')
const router = express.Router()
const { ensureAuth} = require('../middleware/auth')

const Todo = require('../models/todo')

// @desc    Show add page
// @route   GET /todo_m/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('todos/add')
})

// @desc    Process add form
// @route   POST /todo_m
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Todo.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc    Show all todos
// @route   GET /todo_m
router.get('/', ensureAuth, async (req, res) => {
    try {
        const todos = await Todo.find({ status: 'public'})
            .populate('user')
            .sort({ createdAt: 'desc'})
            .lean()

        res.render('todos/index', {
            todos
        })
    } catch (error) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc    Show single todo
// @route   GET /todo_m/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id)
            .populate('user')
            .lean()

        if(!todo) {
            return res.render('error/404')
        }

        res.render('todos/show', {
            todo
        })
    } catch (error) {
        console.error(error)
        res.render('error/404')
    }
})

// @desc    Show edit page
// @route   GET /todo_m/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id
        }).lean()
    
        if(!todo) {
            return res.render('error/404')
        }
    
        if (todo.user != req.user.id) {
            res.redirect('/todos')
        } else {
            res.render('todos/edit', {
                todo,
            })
        }
    } catch (error) {
        console.error(error)
        return res.render('error/500')
    }
})

// @desc    Update Todo
// @route   PUT /todo_m/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id).lean()
    
        if (!todo) {
            return res.render('error/404')
        }
    
        if (todo.user != req.user.id) {
            res.redirect('/todos')
        } else {
            todo = await Todo.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true
            })
    
            res.redirect('/dashboard')
        }
    } catch (error) {
        console.error(error)
        return res.render('error/500')
    }
})

// @desc    Delete todo
// @route   DELETE /todo_m/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Todo.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        return res.render('error/500')
    }
})

// @desc    User todos
// @route   GET /todo_m/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const todos = await Todo.find({
            user: req.params.userId,
            status: 'public',
        })
        .populate('user')
        .lean()

        res.render('todos/index', {
            todos
        })
    } catch (error) {
        console.error(error)
        res.render('error/404')
    }
})

module.exports = router