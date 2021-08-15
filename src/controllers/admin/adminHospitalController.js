const Hospital = require('../../models/hospital');

const axios = require('axios');

const {modifyLocationResults} = require('../utility');

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

const getMapboxURL = (search) => {
    return `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=${MAPBOX_API_KEY}`;
}

exports.getLocation_POST = (req, res) => {
    // send location object using mapbox api

    const {search} = req.body;

    if(!search) {
        return res.status(400).json({
            error: "no search query"
        })
    }

    const url = getMapboxURL(search);

    axios.get(url)
    .then(response => {
        // console.log(response);
        const results = response.data.features.slice(0,5);
        const modified = modifyLocationResults(results);
        console.log(modified);
        return res.json(modified);
        // return res.json(results);
    })

}

exports.addHospital_POST = (req, res) => {
    // get location object to fill up the hospital model
    const {
        name, 
        text,
        district, 
        region, 
        country, 
        place, 
        coordinates,
        contact
    } = req.body;

    Hospital.findOne({$and: [{name},{"location.place": place}, {"location.region": region}]}).exec((err, exist) => {
        if(err || exist) {
            return res.status(400).json({
                error: "Could not create the required hospital with the details provided."
            });
        }

        const newHospital = new Hospital({
            name,
            location: {
                coordinates: {
                    latitude: coordinates[0],
                    longitude: coordinates[1]
                },
                country,
                region,
                place,
                district,
                contact,
                text
            },
        })

        newHospital.save()
        .then(savedHospital => {
            return res.status(201).json({
                message: "Hospital created successfully",
                hospital: savedHospital
            })
        })
        .catch(error => {
            return res.status(400).json({
                error: "Error during creation of hospital"
            })
        })
    })
}