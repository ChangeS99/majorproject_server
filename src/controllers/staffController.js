//models
const Hospital = require('../models/hospital');
const Staff = require('../models/staff');

//POST /api/hospital/staff/create
exports.createStaff_POST = (req, res) => {
    const {data} = req.body;
    const hospital = req.hospital;

    const newStaff = new Staff({
        name: {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName
        },
        joined: data.joined,
        left: data.left,
        timing: {
            arrival: data.timing.arrival,
            leaving: data.timing.leaving
        },
        hospitalId: hospital._id
    });

    newStaff.save((err, stf) => {
        if(err) {
            return res.status(400).json({
                error: "Couldn't save the staff doc."
            })
        }
        Hospital.findById(hospital._id).exec((err, hosp) => {

            if(err || !hosp) {
                return res.status(400).json({
                    error: "No hospital found."
                })
            }
            const stfList = [...hosp.staffs, stf._id];
            hosp.employees = stfList;
            hosp.save((err, _) => {
                if(err) {
                    return res.status(400).json({
                        error: "Couldn't update the hospital doc."
                    })
                }

                return res.status(201).json({
                    message: "Staff successfully created.",
                    staff: stf
                })
            })
        })
    })
}

// POST /api/hospital/staff/read
exports.readStaff_POST = (req, res) => {
    const {staffId} = req.body;
    Staff.findOne({_id: staffId}).exec((err, stf) => {
        if(err || !stf) {
            return res.status(404).json({
                error: "Staff not found."
            })
        }

        return res.json({
            message: "Staff found.",
            staff: stf
        })
    })
}

//POST /api/hospital/staff/update
exports.updateStaff_PUT = (req, res) => {
    const {staffId, updateData} = req.body;
    
    Staff.findOne({_id: staffId}).exec((err, stf) => {
        if(err || !stf) {
            return res.status(404).json({
                error: "Employee not found."
            })
        }

        Object.keys(updateData).forEach(key => {
            stf[key] = updateData[key];
        });

        stf.save((err, saved) => {
            if(err) {
                return res.status(400).json({
                    error: "Couldn't update the staff."
                });
            }

            return res.json({
                message: "Staff updated successfully.",
                staff: saved
            })
        })
    })
}

// DELETE /api/hospital/staff/delete
exports.deleteStaff_DELETE = (req, res) => {
    const {staffId, hospitalId} = req.body;

    Staff.deleteOne({_id: staffId}).exec((err, stf) => {
        if(err || !emp) {
            return res.status(400).json({
                error: "staff not found."
            })
        }

        Hospital.findById(hospitalId).exec((err, hospital) => {

            if(err || !hospital) {
                return res.status(404).json({
                    error: "Hospital with the given id not found."
                })
            }
            const newStfList = hospital.staffs.filter(item => item !== ObjectId(staffId));
            hospital.readStaff_POST = newEmpList;

            hospital.save((err, hosp) => {
                if(err) {
                    return res.status(400).json({
                        error: "Error deleting the staff from hospital."
                    })
                }

                return res.status(200).json({
                    message: "Successfully deleted staff."
                })
            })
        })
    })
}

//POST /api/hospital/staff/list
exports.hospitalStaffList_POST = (req, res) => {
    const hospitalId = req.hospitalId;

    Staff.find({hospitalId}).exec((err, stf) => {
        console.log("stf: ", stf);
        if(err || !stf) {
            return res.status(400).json({
                error: "Server error."
            })
        }

        return res.json({
            staffs: stf
        })
    })
    
} 