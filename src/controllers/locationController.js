const axios = require('axios');

const {modifyLocationResults, modifyCoordinateResult} = require('./utility');

const getMapboxPlaceURL = (search) => {
    return `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=${MAPBOX_API_KEY}`;
}

const getMapboxCoordUrl = (lng, lat) => {
    return `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${MAPBOX_API_KEY}`;
}

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

//POST api/location/search
exports.searchLocation_POST = (req, res) => {
    // send location object using mapbox api

    const {search} = req.body;

    if(!search) {
        return res.status(400).json({
            error: "no search query"
        })
    }

    const url = getMapboxPlaceURL(search);

    axios.get(url)
    .then(response => {
        // console.log(response);
        const results = response.data.features.slice(0,5);
        const modified = modifyLocationResults(results);
        // console.log(modified);
        return res.json(modified);
        // return res.json(results);
    })
    .catch(err => {
        console.log(err);
        return res.status(400).json({
            error: err.message
        })
    })
}

//POST api/location/coordinate/search
exports.searchCoordinateLocation_POST = (req, res) => {
    const {lat, lng} = req.body;

    if(!lat || !lng) {
        return res.status(400).json({
            error: "Latitude and Longitude not provided."
        })
    }

    const url = getMapboxCoordUrl(lng, lat);

    axios.get(url)
    .then(response => {
        // return res.json(response.data);
        const modified = modifyCoordinateResult(response.data);
        return res.json({
            location: {
                ...modified
            }
        })
    })
    .catch(err => {
        // console.log(err);
        return res.status(400).json({
            error: err.message
        })
    })

} 

//POST /api/location/pincode/search
exports.searchPincode = (req, res) => {
    const {pincode, state, country} = req.body;

    if(!pincode || !state || !country) {
        return res.status(400).json({
            error: "required parameters not provided"
        })
    }
    const pincodeCheckUrl = pin =>  `https://api.postalpincode.in/pincode/${pin}`
    axios.get(pincodeCheckUrl(pincode))
    .then(response => {
        const result = response.data[0];

        if(result.Status === "404"){
            throw new Error("bad api");
        }

        const postOfficeArray = result.PostOffice;
        const isExist = postOfficeArray.find(item => {
            return item.State === state && item.Country === country; 
        });

        if(!isExist) {
            throw new Error("pincode not found");
        }

        return res.json({
            exist: isExist
        });
    })
    .catch(error => {
        return res.status(404).json({
            error: "Pincode not found"
        })
    })

}