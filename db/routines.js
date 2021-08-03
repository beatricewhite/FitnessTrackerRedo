const client = require("./client");
const { getRoutineActivitiesByRoutine } = require("./routine_activities");
const { getUserByUserName } = require("./users");

async function getRoutineById(id) {
    try {
        console.log("id from getRoutineById", id)
        const {rows: [routine]} = await client.query(`
        SELECT *
        FROM routines
        WHERE id=${id};
        `);
        if (!routine) {
            return null;
        }
        console.log("routine from getRoutineById", routine)
        return routine
    } catch(error) {
        console.error("Error in getRoutineById", error)
        // throw error;
    }
}
async function getRoutinesWithoutActivities() {
    try {
        const {rows: routines} = await client.query (`
        SELECT *
        FROM routines;
        `)

        return routines;
    } catch(error) {
        console.log("Error in getRoutinesWithoutActivities")
        throw error;
        
    }
}
async function getAllRoutines() {
    try {
        //this gets routines
        const {rows: routines} = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON routines."creatorId" = users.id;
        `);
        //this gets activities and includes routineId on them using the inner join table
        const {rows: joinedActivities} = await client.query(`
        SELECT activities.*, "routineId", routine_activities.id AS "routineActivityId", routine_activities.count, routine_activities.duration
        FROM routine_activities
        INNER JOIN activities
        ON "activityId" = activities.id;
        `);

        const routinesWithActivities = routines.map((routine) => {
            routine.activities = joinedActivities.filter((activity) => activity.routineId === routine.id);
            return routine;
        });
        return routinesWithActivities;

    } catch(error) {
        console.log("Error in getAllRoutines")
        throw error;
    }
}
async function getAllPublicRoutines() {
    try {
        const {rows: routines} = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON routines."creatorId" = users.id
        WHERE "isPublic" = true;
        `,);

        const {rows: joinedPublicActivities} = await client.query(`
        SELECT activities.*, "routineId", routine_activities.id AS "routineActivityId", routine_activities.count, routine_activities.duration
        FROM routine_activities
        INNER JOIN activities
        ON "activityId" = activities.id;
        `) 
        const publicRoutinesWithActivities = routines.map((routine) => {
            routine.activities = joinedPublicActivities.filter((activity) => activity.routineId = routine.id);
            return routine
        })
        return publicRoutinesWithActivities;

    } catch(error) {
        console.error("Error in getAllPublicRoutines")
        throw error;
    }
}
async function getAllRoutinesByUser({username}) {
    try {
        const user = await getUserByUserName(username);
        const {rows: routines} = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON routines."creatorId" = users.id
        WHERE "creatorId" = $1;
        `, [user.id]);

        const {rows: byUserJoinedActivities} = await client.query(`
        SELECT activities.*, "routineId", routine_activities.id AS "routineActivityId", routine_activities.count, routine_activities.duration
        FROM routine_activities
        INNER JOIN activities
        ON "activityId" = activities.id;
        `) 

        const byUserRoutinesWithActivities = routines.map((routine) => {
            routine.activities = byUserJoinedActivities.filter((activity) => activity.routineId = routine.id);
            return routine
        })
        return byUserRoutinesWithActivities;

    } catch(error) {
        console.error("Error in getAllRoutinesByUser");
        throw error;
    }
}
async function getPublicRoutinesByUser({username}) {
    try {
        const {rows: routines} = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON routines."creatorId" = users.id
        WHERE "isPublic" = true;
        `,);
        

        const {rows: joinedPublicActivities} = await client.query(`
        SELECT activities.*, "routineId", routine_activities.id AS "routineActivityId", routine_activities.count, routine_activities.duration
        FROM routine_activities
        INNER JOIN activities
        ON "activityId" = activities.id;
        `) 
        const publicRoutinesWithActivities = routines.map((routine) => {
            routine.activities = joinedPublicActivities.filter((activity) => activity.routineId = routine.id);
            return routine
        })
        return publicRoutinesWithActivities;

    } catch(error) {
        console.log("Error in getPublicRoutinesByUser");
        throw Error;
    }

}
async function getPublicRoutinesByActivity() {
    try {
        const { rows: routines } = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        INNER JOIN routine_activities ON routine_activities."routineId" = routines.id
        JOIN users ON routines."creatorId" = users.id
        WHERE "isPublic" = true;
        `)

        const {rows: joinedPublicActivities} = await client.query(`
        SELECT activities.*, "routineId", routine_activities.id AS "routineActivityId", routine_activities.count, routine_activities.duration
        FROM routine_activities
        INNER JOIN activities
        ON "activityId" = activities.id;
        `) 
        const publicRoutinesWithActivities = routines.map((routine) => {
            routine.activities = joinedPublicActivities.filter((activity) => activity.routineId = routine.id);
            return routine
        })
        return publicRoutinesWithActivities;

    } catch(error) {
        console.error("Error in getPublicRoutinesByActivity")
        throw error
    }
}
async function createRoutine({
    creatorId,
    isPublic,
    name,
    goal
}) {
    try {
        const {rows: [routine]} = await client.query(`
        INSERT INTO routines("creatorId", "isPublic", "name", "goal")
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `, [creatorId, isPublic, name, goal])
        return routine;
    } catch (error) {
        console.error("Error in createRoutine", error);
        throw error;
    }
}

async function updateRoutine(fields = {}) {
    const {id} = fields;
    delete fields.id;
    const setString = Object.keys(fields)
      .map((key) => `"${key}"='${fields[key]}'`)
      .join(",");
    if (setString.length === 0) {
      return "";
    }
    try {
      const {rows: [updatedRoutine]} = await client.query(
        `
              UPDATE routines
              SET ${setString}
              WHERE id=${id}
              RETURNING *;
              `
      );

      return updatedRoutine;
    } catch (error) {
      throw error;
    }
}


async function destroyRoutine(id) {

    try {
        const routines = await client.query(`
        DELETE
        FROM routines
        WHERE id=${id};
        `)


        //destroy activities for this routine
        const queriedRoutineActivities = await getRoutineActivitiesByRoutine({id})


        for(var i = 0; i < queriedRoutineActivities.length; i++) {
            var currentRoutineActivity = queriedRoutineActivities[i]
            var routineActivityId = currentRoutineActivity.id
        await client.query(`
            DELETE
            FROM activities
            WHERE id=${routineActivityId};
            `)
        }

        return routines;
    } catch (error) {
        throw error
    }
}


module.exports = {
    getRoutineById,
    getRoutinesWithoutActivities,
    getAllRoutines,
    getAllPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    createRoutine,
    updateRoutine,
    destroyRoutine
}