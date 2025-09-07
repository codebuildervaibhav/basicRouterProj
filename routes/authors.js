const express = require('express')
const router = express.Router()
const Author = require('../models/author');
const e = require('express');

// all authors route 
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i') // 'i' for case insensitive
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// new author
router.get('/new', (req, res) => {
    res.render('authors/new' , {author: new Author()});
})

//create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const newAuthor = await author.save()
        res.redirect('/authors')
        // or: res.redirect(`/authors/${newAuthor.id}`)
    } catch (err) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
})

router.get('/:id', async (req, res) => {
  res.send('Show author ' + req.params.id)

})
router.get('/:id/edit', async (req, res) => {
    res.send('Edit author ' + req.params.id)
})

router.put('/:id', async (req, res) => {
    res.send('Update author ' + req.params.id)
})

router.delete('/:id', async (req, res) => {
    res.send('Delete author ' + req.params.id)
})


module.exports = router