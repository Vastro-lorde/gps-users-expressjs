const { createUserRepo, getAllUsersRepo, findUsersNearLocationRepo } = require("../data/repos/userRepos");
const { seedUsers } = require("../data/seeder");
const redisHelper = require("../utils/cache");
const { ElasticLogger } = require("../utils/elastic-search-logger");

exports.createUser = async (req, res) => {
    const { seed = false, seedAmount = 100 } = req.query;
    if (seed) {
        try {
            const result = await seedUsers(seedAmount);
            ElasticLogger.info("Users seeded successfully", { result });
            res.status(201).json({ result ,message: "Users seeded successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
        return;
    }
    const { name, email, latitude, longitude } = req.body;
    try {
        if (!name || !email || !latitude || !longitude) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = await createUserRepo({ name, email, latitude, longitude });
        ElasticLogger.info("User created successfully", { user });
        res.status(201).json(user);
    } catch (error) {
        ElasticLogger.error("Error creating user", { error });
        if (error.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const cacheKey = `users:${page}:${limit}`;
    try {
        const cachedData = await redisHelper.get(cacheKey)
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        const { users, duration } = await getAllUsersRepo({ page: +page, limit: +limit });
        const result = {
            users: users,
            duration: duration,
            page: +page,
            limit: +limit
        }
        await redisHelper.set(cacheKey, result, 60);
        res.status(200).json(result);
    } catch (error) {
        ElasticLogger.error("Error getting all users", { error });
        res.status(500).json({ error: error.message });
    }
};

exports.getUsersNearLocation = async (req, res) => {
    const { latitude, longitude, radius = 5 } = req.query;
    if (!latitude || !longitude) {
        ElasticLogger.error("Missing required fields", { payload: req.query });
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const users = await findUsersNearLocationRepo({ latitude, longitude, radius });
        res.status(200).json(users);
    } catch (error) {
        ElasticLogger.error("Error finding users near location", { error, payload: req.query });
        res.status(500).json({ error: error.message });
    }
};