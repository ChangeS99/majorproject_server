const Type = require('../../models/type');
const Role = require('../../models/role');

exports.addRole_POST = (req, res) => {

    const { role, type } = req.body;

    Type.findOne({ name: type }).exec((err, savedType) => {
        if (err) {
            return res.status(400).json({
                error: "Couldn't find the required type."
            })
        }

        if (!savedType) {
            return res.status(404).json({
                error: "Requested Type not found."
            })
        }

        Role.findOne({ $and: [{ name: role }, { "type.name": type }] })
            .exec((err, savedRole) => {


                if (err) {
                    return res.status(400).json({
                        error: "Couldn't create new Role. Please check the input."
                    });
                }

                if (savedRole) {
                    return res.status(400).json({
                        error: "Role already exists."
                    })
                }

                const newRole = new Role({
                    name: role,
                    type: {
                        name: savedType.name,
                        typeId: savedType._id
                    }
                });

                newRole.save()
                    .then(savedRole => {
                        return res.status(201).json({
                            message: "Role created successfully",
                            role: savedRole
                        })
                    })
                    .catch(err => {
                        return res.status(400).json({
                            error: "Couldn't save created Role."
                        })
                    })
            })
    })
}

exports.updateRole_PUT = (req, res) => {
    const { role, newRole, type, newType } = req.body;

    if(newType) {
        Type.findOne({name: type}).exec((err, typeExists) => {
            if(err || !typeExists) {
                return res.status(404).json({
                    error: "requested type not found"
                })
            }

            Type.findOne({name: newType}).exec((err, newTypeExists)=> {
                if(err || !newTypeExists) {
                    return res.status(404).json({
                        error: "requested new type not found"
                    })
                }

                Role.findOne({$and: [{name: newRole}, {"type.name": newType}]}).exec((err, roleExists) => {

                    if(err || roleExists) {
                        return res.status(400).json({
                            error: "Role already exists."
                        })
                    }

                    Role.findOneAndUpdate({$and: [{name: role}, {"type.name": type}]}, {
                        name: newRole,
                        "type.name": newTypeExists.name,
                        "type.typeId": newTypeExists._id
                    }, {new: true}).exec((err, updatedRole) => {
                        if(err || !updatedRole) {
                            return res.status(400).json({
                                error: "Couldn't update the role. Please try again."
                            })
                        } 
    
                        return res.status(201).json({
                            message: "Role updated successfully",
                            role: updatedRole
                        })
                    });

                })

            }) 

        })
    } else {
        Type.findOne({name: type}).exec((err, typeExists) => {
            if(err || !typeExists) {
                return res.status(404).json({
                    error: "requested type not found"
                })
            }

            Role.findOneAndUpdate({$and: [{name: role}, {"type.name": type}]}, {
                name: newRole,
            }, {new: true}).exec((err, updatedRole) => {
                if(err || !updatedRole) {
                    return res.status(400).json({
                        error: "Couldn't update the role. Please try again."
                    })
                } 

                return res.status(201).json({
                    message: "Role updated successfully",
                    role: updatedRole
                })
            });

        })
    }
}