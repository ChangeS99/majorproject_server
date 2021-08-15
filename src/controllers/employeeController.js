
//models
const Hospital = require('../models/hospital');
const Employee = require('../models/employee');
const HospitalRole = require('../models/hospitalRole');
const HospitalDep = require('../models/hospitalDep');

// POST /api/hospital/employee/create
exports.createEmployee_POST = async (req, res) => {
    const { data } = req.body;
    const hospitalId = req.hospitalId;

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital."
        })
    });

    if (!hospital) {
        return res.status(404).json({
            error: "Hospital not found."
        })
    }
    let roleExist = null, depExist = null
    try {
        roleExist = await HospitalRole.findOne({$and: [{name: data.role}, {hospitalId}]});
        depExist = await HospitalDep.findOne({$and: [{name: data.department}, {hospitalId}]});
    } catch (error) {
        return res.status(400).json({
            error: "Error finding role and department"
        })
    }


    if (!roleExist) {
        return res.status(404).json({
            error: "Given role not found. Please create one from dashboard"
        })
    }

    if (!depExist) {
        return res.status(404).json({
            error: "Given department not found. Please create one from dashboard"
        })
    }

    const newEmployee = new Employee({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        role: roleExist.name,
        department: depExist.name,
        joined: data.joined,
        left: data.left,
        timing: {
            arrival: data.timing.arrival,
            leaving: data.timing.leaving
        },
        hospitalId: hospitalId
    });



    newEmployee.save(async (err, emp) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: "Couldn't save the employee doc."
            })
        }
        try {
            await roleExist.insertPeople(emp._id);
            await depExist.insertPeople(emp._id)
        } catch (error) {
            return res.status(400).json({
                error: "Couldn't update the role and department document."
            })
        }


        Hospital.findById(hospitalId).exec((err, hosp) => {

            if (err || !hosp) {
                return res.status(400).json({
                    error: "No hospital found."
                })
            }
            const empList = [...hosp.employees, emp._id];
            hosp.employees = empList;
            hosp.save(async (err, _) => {
                if (err) {
                    return res.status(400).json({
                        error: "Couldn't update the hospital doc."
                    })
                }

                return res.status(201).json({
                    message: "Employee successfully created.",
                    employee: emp
                })
            })
        })
    })
}

// POST /api/hospital/employee/read
exports.readEmployee_POST = (req, res) => {
    const { employeeId } = req.body;
    Employee.findOne({ _id: employeeId }).exec((err, emp) => {
        if (err || !emp) {
            return res.status(404).json({
                error: "Employee not found."
            })
        }

        return res.json({
            employee: emp
        })
    })
}

//POST /api/hospital/employee/search
exports.employeeHospitalSearch_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const { filter, search } = req.body;

    if (search.trim().length < 1) {
        return res.json([]);
    }

    const employees = await Employee.find({ hospitalId })
        .fuzzySearch({ query: search, minSize: 3 });

    return res.json(employees);

}

//POST /api/hospital/employee/list
exports.hospitalEmployeeList_POST = (req, res) => {
    const hospitalId = req.hospitalId;

    Employee.find({ hospitalId }).exec((err, emp) => {
        // console.log("emp: ", emp);
        if (err || !emp) {
            return res.status(400).json({
                error: "Server error."
            })
        }

        return res.json({
            employees: emp
        })
    })
}

// PUT /api/hospital/employee/update
exports.updateEmployee_PUT = (req, res) => {
    const { employeeId, updateData } = req.body;

    Employee.findOne({ _id: employeeId }).exec((err, emp) => {
        if (err || !emp) {
            return res.status(404).json({
                error: "Employee not found."
            })
        }

        Object.keys(updateData).forEach(key => {
            emp[key] = updateData[key];
        });

        emp.save((err, saved) => {
            if (err) {
                return res.status(400).json({
                    error: "Couldn't update the employee"
                });
            }

            return res.json({
                message: "Employee updated successfully.",
                employee: saved
            })
        })
    })
}

// DELETE /api/hospital/employee/delete
exports.deleteEmployee_DELETE = async (req, res) => {
    const { _id } = req.body;
    const hospitalId = req.hospitalId;
    // console.log(_id);
    const emp = await Employee.findById(_id);
    // console.log(emp);

    const employee = await Employee.findByIdAndDelete(_id).catch(_ => {
        return res.status(400).json({
            error: "Employee delete error."
        })
    });

    // console.log(employee);

    if (!employee) {
        return res.status(404).json({
            error: "Employee not found."
        })
    }

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "hospital find error."
        })
    });

    if (!hospital) {
        return res.status(404).json({
            error: "hospital not found."
        })
    }

    const newEmpList = hospital.employees.filter(item => !item.equals(_id));
    hospital.employees = [...newEmpList];

    await hospital.save().catch(_ => {
        return res.status(400).json({
            error: "Couldn't update the hospital."
        })
    })

    return res.json({
        message: "Successfully deleted employee.",
        employee
    })

}