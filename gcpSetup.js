let fs = require('fs');

fs.writeFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, process.env.GOOGLE_CREDENTIALS, (err) => {
    throw err;
});