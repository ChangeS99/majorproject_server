const cors = require('cors');

module.exports = (mode, app) => {

    switch (mode) {
        case "development": app.use(cors({
            origin: 'http://localhost:3000'
        })); break;
        case "production" : break;
        default: return;
    }
}