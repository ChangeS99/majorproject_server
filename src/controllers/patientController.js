const Hospital = require('../models/hospital');
const Patient = require('../models/patient');
const HospitalDep = require('../models/hospitalDep');

//POST /api/hospital/patient/create
exports.createPatient_POST = async (req, res) => {
    const { data } = req.body;
    const hospitalId = req.hospitalId;

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital"
        })
    });

    if (!hospital) {
        return res.status(404).json({
            error: "Hospital not found."
        })
    }

    let  depExist = null;
    try {
        depExist = await HospitalDep.findOne({ name: data.department });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: "Error finding role and department"
        })
    }


    if (!depExist) {
        return res.status(404).json({
            error: "Given department not found. Please create one from dashboard"
        })
    }

    const newPatient = new Patient({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        department: depExist.name,
        diagnosis: data.diagnosis,
        admitted: data.admitted,
        discharged: data.discharged,
        hospitalId
    })

    newPatient.save(async (err, patient) => {
        if(err) {
            console.log(err);
            return res.status(400).json({
                error: "Error saving patient"
            })
        }

        try {
            await depExist.insertPeople(patient._id);
        } catch(error) {
            return res.status(400).json({
                error: "Error updating department document."
            })
        }

        const newPatientList = [...hospital.patients, patient];
        hospital.patients = [...newPatientList];
        // const dep = hospital.departments.filter(item => item.name === data.department);
        // const people = [...dep.people, patient._id];
        // dep.people = 
        await hospital.save().catch(_ => {
            return res.status(400).json({
                error: "Error saving hospital."
            })
        })

        return res.status(201).json({
            message: "Patient created successfully.",
            patient
        })
    })

}

//POST /api/hospital/patient/search
exports.patientHospitalSearch_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const { filter, search } = req.body;

    if (search.trim().length < 1) {
        return res.json([]);
    }

    const patients = await Patient.find({ hospitalId })
        .fuzzySearch({ query: search, minSize: 3 });

    return res.json(patients);

}

//POST /api/hospital/patient/read
exports.readPatient_POST = (req, res) => {
    const { patientId } = req.body;

    Patient.findById(patientId).exec((err, pat) => {
        if (err || !pat) {
            return res.status(404).json({
                error: "Patient not found."
            })
        }

        return res.json({
            message: "Patient found.",
            patient: pat
        })
    })
}

//POST /api/hospital/patient/list
exports.hospitalPatientList_POST = (req, res) => {
    const hospitalId = req.hospitalId;

    Patient.find({ hospitalId }).exec((err, pat) => {
        // console.log("patient: ", pat);
        if (err || !pat) {
            return res.status(400).json({
                error: "Server error."
            })
        }

        return res.json({
            patients: pat
        })
    })
}

//DELETE /api/hospital/patient/delete
exports.deletePatient_DELETE = async (req, res) => {
    const hospitalId = req.hospitalId;
    const {_id} = req.body;

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(404).json({
            error: "Hospital not found."
        })
    })

    Patient.deleteOne({_id}).exec(async (err, patient) => {
        if(err) {
            return res.status(400).json({
                error: "Error deleting patient."
            })
        }

        const newPatientList = hospital.patients.filter(item => !item.equals(_id));
        hospital.patients = [...newPatientList];

        await hospital.save().catch(_ => {
            return res.status(400).json({
                error: "Error saving hospital."
            })
        })

        return res.status(200).json({
            message: "Patient deleted successfully.",
            patient
        })
    })   

}

