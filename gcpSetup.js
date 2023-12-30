let fs = require('fs');

fs.writeFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, process.env.GOOGLE_CREDENTIALS, (err) => {
    if (err) {
        console.error('Error writing Google Cloud credentials:', err);
        process.exit(1);
    } else {
        console.log('Google Cloud credentials written successfully');
    }
});
