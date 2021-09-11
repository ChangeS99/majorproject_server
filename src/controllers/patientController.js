const Hospital = require('../models/hospital');
const Patient = require('../models/patient');
const HospitalDep = require('../models/hospitalDep');
const Stage = require('../models/stage');

//POST /api/hospital/patient/create
exports.createPatient_POST = async (req, res) => {
    const { data } = req.body;
    const hospitalId = req.hospitalId;

    // console.log(data);

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital"
        })
    });

    if (data.contact) {
        if (data.contact.email === hospital.email) {
            return res.status(500).json({
                error: "The email provided cannot be used."
            })
        }
    }


    if (!hospital) {
        return res.status(404).json({
            error: "Hospital not found."
        })
    }

    let depExist = null;
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
        departments: [
            depExist.name
        ],
        diagnosis: data.diagnosis,
        contact: {
            email: data.email,
            phone: data.phone
        },
        admitted: data.admitted,
        discharged: data.discharged,
        hospitalId
    })

    newPatient.save(async (err, patient) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: "Error saving patient"
            })
        }

        try {
            await depExist.insertPeople(patient._id);
        } catch (error) {
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

    Patient.findById(patientId).populate("stages").exec((err, pat) => {
        if (err || !pat) {
            return res.status(404).json({
                error: "Patient not found."
            })
        }
        const {
            _id,
            firstName,
            middleName,
            lastName,
            departments,
            contact,
            dob,
            address,
            admitted,
            stages,
            discharged
        } = pat;

        return res.json({
            message: "Patient found.",
            patient: {
                name: {
                    firstName,
                    middleName,
                    lastName,
                },
                detail: {
                    address,
                    _id,
                    dob
                },
                hospital: {
                    departments,
                },
                dates: {
                    admitted,
                    discharged
                },
                contact,
                stages
            }
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

// PUT /api/hospital/patient/update
exports.updatePatient_PUT = async (req, res) => {
    const hospitalId = req.hospitalId;
    const hospitalEmail = req.hospitalEmail;

    const { patientId, data, tab } = req.body;

    if (data.contact) {
        if (data.contact.email === hospitalEmail) {
            return res.status(500).json({
                error: "The email provided cannot be used."
            })
        }
    }

    const patient = await Patient.findById(patientId).populate("stages").catch(_ => {
        return res.status(500).json({
            error: "Error finding patient"
        })
    });

    if (!patient) {
        return res.status(404).json({
            error: "Patient not found."
        })
    }

    Object.keys(data).map(prop => {
        patient[prop] = data[prop]
    });

    try {
        await patient.save();
        console.log(patient);

        const {
            _id,
            firstName,
            middleName,
            lastName,
            departments,
            contact,
            dob,
            address,
            admitted,
            stages,
            discharged
        } = patient;

        return res.status(201).json({
            message: `${tab} properties of the patient updated successfully`,
            raw: patient,
            patient: {
                name: {
                    firstName,
                    middleName,
                    lastName,
                },
                detail: {
                    address,
                    _id,
                    dob
                },
                hospital: {
                    departments,
                },
                dates: {
                    admitted,
                    discharged
                },
                contact,
                stages
            }
        });
    } catch (error) {
        return res.status(400).json({
            error: "Could not update patient"
        })
    }

}

//DELETE /api/hospital/patient/delete
exports.deletePatient_DELETE = async (req, res) => {
    const hospitalId = req.hospitalId;
    const { _id } = req.body;

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(404).json({
            error: "Hospital not found."
        })
    })

    Patient.deleteOne({ _id }).exec(async (err, patient) => {
        if (err) {
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

//POST /api/hospital/patient/stage/create
exports.patientStageCreate_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const { stage } = req.body;

    if (!stage) {
        return res.status(400).json({
            error: "Required params not provided."
        })
    }

    const newStage = new Stage({
        ...stage
    });

    const patient = await Patient.findById(stage.patientId).populate("stages").catch(_ => {
        return res.status(400).json({
            error: "Error finding patient."
        })
    });

    try {

        const saved = await newStage.save();
        const idList = [];
        patient.stages.forEach(item => idList.push(item._id));
        const newStageList = [...idList, saved._id];
        const stages = [...patient.stages, saved];
        patient.stages = [...newStageList];
        const pat = await patient.save();

        const {
            _id,
            firstName,
            middleName,
            lastName,
            departments,
            contact,
            dob,
            address,
            admitted,
            discharged
        } = pat;

        return res.status(201).json({
            message: "stage created.",
            stage: saved,
            patient: {
                name: {
                    firstName,
                    middleName,
                    lastName,
                },
                detail: {
                    address,
                    _id,
                    dob
                },
                hospital: {
                    departments,
                },
                dates: {
                    admitted,
                    discharged
                },
                contact,
                stages
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error creating stage."
        })
    }
}


//DELETE /api/hospital/patient/stage/delete
exports.patientStageDelete_DELETE = async (req, res) => {
    const { _id, patientId } = req.body;

    const stage = await Stage.findByIdAndDelete(_id);
    const patient = await Patient.findById(patientId);

    const newStageList = patient.stages.filter(item => !item.equals(_id));
    patient.stages = [...newStageList];

    try {
        patient.save(function (err, pat) {
            pat
                .populate('stages')
                .execPopulate()
                .then(patient => {
                    const {
                        _id,
                        firstName,
                        middleName,
                        lastName,
                        departments,
                        contact,
                        dob,
                        address,
                        admitted,
                        discharged
                    } = patient;

                    return res.status(200).json({
                        message: "Stage deleted successfully",
                        patient: {
                            name: {
                                firstName,
                                middleName,
                                lastName,
                            },
                            detail: {
                                address,
                                _id,
                                dob
                            },
                            hospital: {
                                departments,
                            },
                            dates: {
                                admitted,
                                discharged
                            },
                            contact,
                        },
                        stages: patient.stages
                    })
                })
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error deleting stage."
        })
    }
}
