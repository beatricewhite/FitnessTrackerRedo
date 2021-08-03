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

    const { routineId } = req.params;
    const { isPublic, name, goal } = req.body;
    const { id: userId } = req.user;

    const updateFields = {};
    updateFields.id = routineId

    if (isPublic) {
        updateFields.isPublic = isPublic;
      }
      if (name) {
        updateFields.name = name;
      }
      if (goal) {
        updateFields.goal = goal;
      }

    try {
        const originalRoutine = await getRoutineById(routineId);

        if (originalRoutine.creatorId === userId) {
            const updatedRoutine = await updateRoutine(updatedFields);
            if(updatedRoutine) {
                res.send(updatedRoutine)
            }
        }

    } catch (error) {
        throw error;
    }

})

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