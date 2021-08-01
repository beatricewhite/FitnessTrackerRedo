const client = require("./client")


async function getRoutineActivityById(id) {
    try {
        const { rows: [routine_activities] } = await client.query(`
        SELECT *
        FROM routine_activities
        WHERE id=${id};
        `);
        return routine_activities;
    } catch (error) {
        console.error("Error in getRoutineById")
        throw error;
    }
}

async function addActivityToRoutine({
    routineId,
    activityId,
    count,
    duration
}) {
    try {
        const { rows: [routine_activity] } = await client.query(`
        INSERT INTO routine_activities("routineId", "activityId", count, duration)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("routineId", "activityId") DO NOTHING 
        RETURNING *;
        `, [routineId, activityId, count, duration]);

        return routine_activity;
    } catch (error) {
        console.error("Error in addActivityToRoutine");
        console.log(error)
        throw error;
    }
}



async function updateRoutineActivity({ id, count, duration }) {
    try {
        const { rows: [routine_activity] } = await client.query(`
        UPDATE routine_activities
        SET count='${count}', duration='${duration}'
        WHERE id=${id}
        RETURNING *;
        `)

        return routine_activity;
    } catch (error) {
        console.error("there was an error", error)
    }
}

async function destroyRoutineActivity(id) {
    try {
        const { rows: [routine_activity] }= await client.query(`
        DELETE
        FROM routine_activities
        WHERE id=${id} RETURNING *;
        `)


        return routine_activity
    } catch (error) {
        throw error
    }
}



async function getRoutineActivitiesByRoutine({ id }) {
    try {

        const activity_ids = await client.query(`
        SELECT routine_activities."activityId"
        FROM routine_activities
        WHERE "routineId"=${id};
        `)
        const routine_activities = []
        for (var i = 0; i < activity_ids.rows.length; i++) {
            let act_id = activity_ids.rows[i].activityId
            let result = await client.query(`
            select * from activities where id=$1
            `, [act_id])
            //check for multiple tied to id
            routine_activities.push(result.rows[0])
        }
        return routine_activities

    } catch (error) {
        console.error('there is an error', error)
    }
}




module.exports = {
    getRoutineActivityById,
    addActivityToRoutine,
    updateRoutineActivity,
    destroyRoutineActivity,
    getRoutineActivitiesByRoutine
}