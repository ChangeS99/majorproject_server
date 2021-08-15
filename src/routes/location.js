const router = require('express').Router();
//url = https://api.mapbox.com/geocoding/v5/mapbox.places/kamrup.json?access_token=pk.eyJ1IjoiY2hhbmdlczk5IiwiYSI6ImNrcjUxdXphcTMxcjQycG82bDU1OGRyeGUifQ.uIC7dUAkwVS9TmnEgVIGWg

//controller
const {
    searchLocation_POST,
    searchCoordinateLocation_POST,
    searchPincode
} = require('../controllers/locationController');

//middleware
const {
    requireUserSignin
} = require('../middlewares/authMiddlewares');

//POST api/location/search
router.post("/search", requireUserSignin, searchLocation_POST);

//POST api/location/coordinate/search
router.post("/coordinate/search", requireUserSignin, searchCoordinateLocation_POST);

//POST /api/location/pincode/search
router.post("/pincode/search", searchPincode);

module.exports = router;