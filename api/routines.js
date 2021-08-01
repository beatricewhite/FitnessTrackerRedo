const express = require('express');
const { createRoutine, getRoutineById, destroyRoutine, updateRoutine, getAllPublicRoutines, updateActivity, addActivityToRoutine } = require('../db');
const routineRouter = express.Router();
const { requireUser } = require('./utils')



//GET /routines
routineRouter.get('/', async (req, res, next) => {
    const allPublicRoutines = await getAllPublicRoutines();

    res.send(allPublicRoutines);
})

// POST /routines *

routineRouter.post('/', requireUser, async (req, res, next) => {
    const {
        creatorId,
        isPublic,
        name,
        goal = "" } = req.body;

    const routineData = {};
    try {
        routineData.creatorId = req.user.id;
        routineData.isPublic = isPublic;
        routineData.name = name;
        routineData.goal = goal;
        const routine = await createRoutine(routineData);

        return res.send(routine);

    } catch ({ name, message }) {
        next({ name, message });
    }
});



// PATCH /routines/:routineId
//     update a routine

routineRouter.patch('/:routineId', requireUser, async (req, res) => {
    const updateFields = {};
    // const {routineId} = req.params;
    updateFields.id = req.params.routineId;
    updateFields.name = req.body.name;
    updateFields.goal = req.body.goal;
    updateFields.isPublic = req.body.isPublic;

    try {
        const originalRoutine = await getRoutineById(req.params.routineId);

        if (originalRoutine.creatorId === req.user.id) {
            const updatedRoutine = await updateRoutine(updatedFields);
            return res.send(updatedRoutine)
        }

    } catch (error) {
        throw error;
    }

})

// activitiesRouter.patch('/:activityId', async(req, res) => {
//     const updateFields = {};
//     updateFields.id = req.params.activityId;
//     updateFields.name = req.body.name;
//     updateFields.description = req.body.description;

//     try {

//             const updatedActivity = await updateActivity(updateFields);
//             console.log("updatedActivty result", updatedActivity)
            
//             return res.send(updatedActivity) 

//     } catch (error) {
//         throw error
//     }

// })


// DELETE /routines/:routineId/
routineRouter.delete('/:routineId', requireUser, async (req, res, next) => {
    try {
        const { routineId } = req.params
        console.log('routine id', routineId)
        routineToDelete = await getRoutineById(routineId)
        console.log('routine to delete', routineToDelete)

        const deletedRoutine = await destroyRoutine(routineId);
        console.log("deletedRoutine", destroyRoutine)
        res.send({
            deletedRoutine
        })
    } catch (error) {
        console.error('There is an error', error)
    }
})



//POST /routines/:routineId/activities
// routineRouter.post('/:routineId/activities', async(res, req) => {
//     const addToRoutine = addActivityToRoutine();

//     return res.send({
//         addToRoutine
//     })
// })

module.exports = routineRouter