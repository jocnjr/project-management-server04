const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const uploader = require('../configs/cloudinary');
const Project = require('../models/project-model');
const Task = require('../models/task-model');


// GET route => all projects
router.get('/projects', (req, res, next) => {
  Project.find().populate('tasks')
    .then(allTheProjects => {
      res.status(200).json(allTheProjects);
    })
    .catch(err => {
      res.json(err);
    })
});

// POST route => to create a new project
router.post('/projects', (req, res, next) => {
  console.log(req.body)
  Project.create({
    title: req.body.title,
    description: req.body.description,
    tasks: [],
    owner: req.user._id,
    imageUrl: req.body.imageUrl
  })
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      res.json(err);
    })
});

router.post('/upload', uploader.single("imageUrl"), (req, res, next) => {
  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }
  // get secure_url from the file object and save it in the 
  // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
  res.json({ secure_url: req.file.secure_url });
})

// GET route => to get a specific project/detailed view
router.get('/projects/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  // our projects have array of tasks' ids and 
  // we can use .populate() method to get the whole task objects
  //                                   ^
  //                                   |
  //                                   |
  Project.findById(req.params.id).populate('tasks')
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => {
      res.json(err);
    })
})

// PUT route => to update a specific project
router.put('/projects/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Project.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then(() => {
      res.status(200).json({ message: `Project with ${req.params.id} is updated successfully.` });
    })
    .catch(err => {
      res.json(err);
    })
})

// DELETE route => to delete a specific project
router.delete('/projects/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Project.findByIdAndRemove(req.params.id)
    .then(() => {
      res.json({ message: `Project with ${req.params.id} is removed successfully.` });
    })
    .catch(err => {
      res.json(err);
    })
})

module.exports = router;
