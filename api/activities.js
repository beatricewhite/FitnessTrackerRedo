const express = require('express');
const activitiesRouter = express.Router();
const {requireUser} = require('./utils')
const jwt = require('jsonwebtoken');


const { getUserById, getAllActivities, createActivity, getPublicRoutinesByActivity, getActivityById, updateActivity} = require('../db');

// console.log("A request is being made to /activities");

// activitiesRouter.use((req, res, next) => {
//     // console.log("A request is being made to /activities");

//     res.status(403).send();
// });



// GET /activities
    // return list of all activities in database
activitiesRouter.get('/', async(req, res, next) => {
    try {
        const allActivities = await getAllActivities();
        res.send(
            allActivities
        )
    } catch ({name, message}) {
        next({ name, message })
    }
});


//POST /activities
    //create new activity
activitiesRouter.post('/', requireUser, async (req, res, next) => {
    const { name, description } = req.body;
    try {
        const newActivity = await createActivity({name, description})
        res.send(
            newActivity
        )
    } catch ({ name, message }) {
      next({ name, message });
    }
});

//PATCH /activities/:activityId

activitiesRouter.patch('/:activityId', async(req, res) => {
    const updateFields = {};
    updateFields.id = req.params.activityId;
    updateFields.name = req.body.name;
    updateFields.description = req.body.description;

    try {

            const updatedActivity = await updateActivity(updateFields);
            console.log("updatedActivty result", updatedActivity)
            
            return res.send(updatedActivity) 

    } catch (error) {
        throw error
    }

})



//GET /activities/:activityId/routines

activitiesRouter.get('/:activityId/routines', async (req, res) => {
    // console.log("A request is being made to /activities");
    const allPublicRoutinesByActivity = await getPublicRoutinesByActivity();

    res.send(allPublicRoutinesByActivity);
})


module.exports = activitiesRouter;