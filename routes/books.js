const express = require('express')
const router = express.Router()
const Book = require('../models/book');
const Author = require('../models/author');
const path = require('path');
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const multer = require('multer');
const fs = require('fs');
//const e = require('express');
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true)
        } else {
            callback(new Error('Only image files are allowed!'))
        }
    }
});

// all books route
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title !== '') {
        query.where('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !== '') {
        query.where('publishDate', '<', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== '') {
        query.where('publishDate', '>', req.query.publishedAfter)
    }
    try {
const books = await Book.find({})
    res.render('books/index',{
        books: books,
        searchOptions: req.query
    })
    } catch {
        res.redirect('/')
    }
})

// new book route
router.get('/new',async (req, res) => {
   renderNewPage(res, new Book())
})

//create book route
router.post('/', upload.single('cover'),async (req, res) => {
   const fileName =  req.file != null ? req.file.filename : null

    const book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        author: req.body.author
    })
    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
                res.redirect('/books')
    }
    catch {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }
           renderNewPage(res, book , true)

    }

})

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            params.errorMessage = 'Error Creating Book'
        }
        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }
}

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}


module.exports = router