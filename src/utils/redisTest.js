// redisTest.js
const redisHelper = require('./cache');

exports.testRedis = async () => {
    try {
        // Wait for Redis to be ready
        if (!redisHelper.isConnected()) {
            console.log('Waiting for Redis to be ready...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Test setting a value
        console.log('Setting test value...');
        const setResult = await redisHelper.set('test', { name: 'test value' }, 60);
        console.log('Set result:', setResult);

        // Test getting the value
        console.log('Getting test value...');
        const value = await redisHelper.get('test');
        console.log('Retrieved value:', value);

        // Test deleting the value
        console.log('Deleting test value...');
        const deleteResult = await redisHelper.delete('test');
        console.log('Delete result:', deleteResult);

        // Verify deletion
        const afterDelete = await redisHelper.get('test');
        console.log('Value after deletion:', afterDelete);

        if (afterDelete === null && value?.name === 'test value') {
            console.log('Redis tests passed successfully!');
            return true;
        } else {
            console.log('Redis tests failed: Unexpected values');
            return false;
        }

    } catch (error) {
        console.error('Redis test failed:', error);
        return false;
    }
};