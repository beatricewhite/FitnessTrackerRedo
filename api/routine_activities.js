const express = require('express');
const { destroyRoutineActivity, getRoutineActivityById, updateRoutineActivity } = require('../db');
const routine_activitiesRouter = express.Router();
const {requireUser} = require('./utils')

routine_activitiesRouter.use((req, res, next) => {
    console.log("A request is being made to /routine_activities");

    next();
});

routine_activitiesRouter.get('/', (req, res, next) => {
    res.sendStatus(200)
})

// PATCH /routine_activities/:routineActivity
routine_activitiesRouter.patch('/:routineActivityId', requireUser, async(req, res) => {
    const {routineActivityId} = req.params;
    const{duration, count} = req.body;
    const updatedFields = {duration, count};

    console.log("updatedFields", updatedFields)


    try {
        const originalRoutineActivity = await getRoutineActivityById(routineActivityId);
        console.log("get RoutineActivityByID ", getRoutineActivityById)
        if (originalRoutineActivity.id === req.user.id) {
        const updatedRoutineActivity = await updateRoutineActivity(updatedFields);
        return res.send(updatedRoutineActivity)
        } 
    } catch (error) {
        throw error;
    }

})



//DELETE /routine_activities/:routineActivityId

routine_activitiesRouter.delete('/:routineActivityId', async (req, res, next) => {
    try {
        const {routineActivityId} = req.params;
        // const{ password} = req.body;

        const deleteRoutineActivity = await destroyRoutineActivity(routineActivityId);
        res.send(deleteRoutineActivity);
    } catch(error) {
        next(error);
    }
})



module.exports = routine_activitiesRouter;