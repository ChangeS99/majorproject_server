
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

    if(data.email === hospital.email) {
        return res.status(500).json({
            error: "The email provided cannot be used."
        })
    }

    if (!hospital) {
        return res.status(404).json({
            error: "Hospital not found."
        })
    }
    let roleExist = null, depExist = null
    try {
        roleExist = await HospitalRole.findOne({ $and: [{ name: data.role }, { hospitalId }] });
        depExist = await HospitalDep.findOne({ $and: [{ name: data.department }, { hospitalId }] });
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
        contact: {
            email: data.email
        },
        role: [roleExist.name],
        departments: [depExist.name],
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

//POST /api/hospital/employee/read
exports.readEmployee_POST = (req, res) => {
    const { employeeId } = req.body;

    Employee.findById(employeeId).exec((err, emp) => {
        if (err || !emp) {
            return res.status(404).json({
                error: "employee not found."
            })
        }

        const {
            _id,
            firstName,
            middleName,
            lastName,
            roles,
            departments,
            contact,
            dob,
            joined,
            left,
            timing,
        } = emp;

        return res.status(201).json({
            message: `employee found.`,
            raw: emp,
            employee: {
                name: {
                    firstName,
                    middleName,
                    lastName,
                },
                detail: {
                    _id,
                    dob,
                    roles,
                    departments
                },
                hospital: {
                    joined,
                    left,
                    timing
                },
                contact,
            }
        });
    })
}

// PUT /api/hospital/employee/update
exports.updateEmployee_PUT = async (req, res) => {
    const hospitalId = req.hospitalId;
    const hospitalEmail = req.hospitalEmail;

    const { employeeId, data, tab } = req.body;

    if(data.contact) {
        if(data.contact.email === hospitalEmail) {
            return res.status(500).json({
                error: "The email provided cannot be used."
            })
        }
    }

    const employee = await Employee.findById(employeeId).catch(_ => {
        return res.status(500).json({
            error: "Error finding employee"
        })
    });

    if (!employee) {
        return res.status(404).json({
            error: "employee not found."
        })
    }

    Object.keys(data).map(prop => {
        employee[prop] = data[prop]
    });

    try {
        await employee.save();

        const {
            _id,
            firstName,
            middleName,
            lastName,
            roles,
            departments,
            contact,
            dob,
            joined,
            left,
            timing,
        } = employee;

        return res.status(201).json({
            message: `${tab} properties of the employee updated successfully`,
            raw: employee,
            employee: {
                name: {
                    firstName,
                    middleName,
                    lastName,
                },
                detail: {
                    _id,
                    dob,
                    roles,
                    departments
                },
                hospital: {
                    departments,
                    joined,
                    left,
                    timing
                },
                contact,
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: "Could not update employee"
        })
    }

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