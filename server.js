const { appReady } = require("./src/app");
const PORT = 5009;

 // Start server
 appReady.then( app=> {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
});