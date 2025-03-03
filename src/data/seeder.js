const { generateFakeData } = require('../utils/fakerGen');
const { createUserRepo } = require('./repos/userRepos');

exports.seedUsers = async (amount = 100) => {
    let durations = [];
    let successfullySeeded = 0;
    console.log(`Seeding ${amount} users...`);
    for (let i = 0; i < amount; i++) {
        const { name, email, latitude, longitude } = generateFakeData();
        try {
            const user = await createUserRepo({ name, email, latitude, longitude });
            durations.push(user.duration);
            successfullySeeded++;
        } catch (error) {
            if (error.code === "SQLITE_CONSTRAINT") {
                i--;
            }
        }
    }

    const duration = durations.reduce((a, b) => a + b, 0);
    const meanDuration = duration / durations.length;
    return { duration, successfullySeeded, meanDuration };
};