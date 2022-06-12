const express = require('express')
const router = express.Router()
const mongodb = require("../config/connect")
const { ensureAuth, ensureGuest } = require('../middleware/auth')

const Todo = require('../models/todo')

// @desc    Login/Landing Page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).lean()
        res.render('dashboard', {
            name: req.user.firstName,
            todos
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }

})

// @desc    SWAGGER Process add form
// @route   POST /todo_m/createData
router.post('/createData', async (req, res) => {
	try {
		const newTodo = {
			todoTitle: req.body.todoTitle,
			todoDesc: req.body.todoDesc,
            completed: req.body.completed,
            status: req.body.status,
            user: req.body.user
		};
		console.log(newTodo)
		await Todo.create(newTodo)
        res.status(201).json(newTodo);
	} catch (err) {
		res.status(500).json(err || 'Some error occurred while creating the todo.');
	}
});

// @desc    SWAGGER Show all todos
// @route   GET /todo_m/getData
router.get('/getData', async (req, res, next) => {
	const result = await mongodb
        .getDb()
        .db()
        .collection("todos")
        .find();
	result.toArray().then((lists) => {
		// console.log(lists)
		res.setHeader("Content-Type", "application/json");
		res.status(200).json(lists);
	});
});

// @desc    SWAGGER Show single todo
// @route   GET /todo_m/getSingleData/:id
router.get('/getSingleData/:id', async (req, res, next) => {
	try {
		const result = await Todo.findById(req.params.id)
            .lean()
		console.log(result)
        // res.setHeader("Content-Type", "application/json");
        res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err || 'Some error occurred while getting a single todo.');
	}
});

// @desc    SWAGGER Update Todo
// @route   PUT /todo_m/updateData/:id
router.put('/updateData/:id', async (req, res) => {
	try {
        let todo = await Todo.findById(req.params.id).lean()
		const upTodo = {
			todoTitle: req.body.todoTitle,
			todoDesc: req.body.todoDesc,
            completed: req.body.completed,
            status: req.body.status,
		};
        console.log(todo)
        console.log(upTodo)

        if (!todo) {
            res.status(500).json(
				result.error || "Something went wrong with the update."
			);
        }
        
        todo = await Todo.findOneAndUpdate({ _id: req.params.id }, upTodo, {
            new: true,
            runValidators: true
        })
        console.log(todo)
		if (todo.todoTitle == upTodo.todoTitle && todo.todoDesc == upTodo.todoDesc && todo.completed == upTodo.completed && todo.status == upTodo.status) {
			res.status(204).send();
		} else {
			res.status(500).json(
				result.error || "Something went wrong with the update."
			);
		}
	} catch (err) {
		res.status(500).json(err || 'Some error occurred while updating the todo.');
	}
});

// @desc    SWAGGER Delete todo
// @route   DELETE /todo_m/deleteData/:id
router.delete('/deleteData/:id', async (req, res) => {
	try {
        await Todo.deleteOne({ _id: req.params.id })
        res.status(204).send();
	} catch (err) {
		res.status(500).json(err || 'Some error occurred while deleting the todo.');
	}
});

module.exports = router