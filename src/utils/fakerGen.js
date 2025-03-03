const { faker } = require("@faker-js/faker");

exports.generateFakeData = () => {
        const name = faker.person.firstName();
        const email = faker.internet.email();
        const latitude = faker.location.latitude();
        const longitude = faker.location.longitude();

        return { name, email, latitude, longitude };
};