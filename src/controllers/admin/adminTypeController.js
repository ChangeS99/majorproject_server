const Type = require('../../models/type');

exports.addType_POST = (req, res) => {
    const { name } = req.body;

    Type.findOne({ name }).exec((err, type) => {
        if (err || type) {
            return res.status(400).json({
                error: "Could not create Type."
            })
        }

        const newType = new Type({
            name
        });

        newType.save()
            .then(savedType => {
                return res.status(201).json({
                    message: "Type created successfully.",
                    type: savedType
                })
            })
            .catch(err => {
                return res.status(400).json({
                    error: "Could not save Type."
                })
            });
    })
}

exports.updateType_PUT = (req, res) => {
    const { type, newType } = req.body;

    Type.findOneAndUpdate({ name: type }, { name: newType }, { new: true }).exec((err, updatedType) => {
        if (err || !updatedType) {
            return res.status(400).json({
                error: "Could not update Type. Please check the input."
            })
        }

        return res.status(201).json({
            message: "Type updated successfully",
            type: updatedType
        })

    })
}