const client = require("./client");

async function getActivityById(id) {
    try {
        const {rows: [activities]} = await client.query(`
        SELECT id, name, description
        FROM activities
        WHERE id=${id};
        `);
        return activities
    } catch(error) {
        console.error("Error in getActivityById", error);
        throw error;
    }
}

async function getAllActivities() {
    try {
    const {rows: activities} = await client.query(`
    SELECT *
    FROM activities;
    `)
    return activities;
    } catch(error) {
        console.log("Error in getAllActivities", error);
    }
}

async function createActivity({
    name,
    description
}) {
    try {
        const {rows: [activities]} = await client.query(`
        INSERT INTO activities(name, description)
        VALUES ($1, $2)
        RETURNING *;
        `, [name, description])

        return activities;
    } catch(error) {
        console.error("Error in createActivity.")
        throw error;
    }
}

async function updateActivity(fields = {}) {
    const { id } = fields;
    const setString = Object.keys(fields)
      .map((key) => `"${key}"='${fields[key]}'`)
      .join(",");
    if (setString.length === 0) {
      return "";
    }
    try {
      const {
        rows: [updatedActivity],
      } = await client.query(
        `
              UPDATE activities
              SET ${setString}
              WHERE id=${id}
              RETURNING *;
              `,
      );
      return updatedActivity;
    } catch (error) {
      throw error;
    }
}


module.exports = {
    getActivityById,
    getAllActivities,
    createActivity,
    updateActivity
}