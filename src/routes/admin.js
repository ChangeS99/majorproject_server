const router = require('express').Router();

//controller
const {    
    addRole_POST,
    updateRole_PUT
} = require('../controllers/admin/adminRoleController');

const {
    addType_POST,
    updateType_PUT,
} = require('../controllers/admin/adminTypeController');

const {
    getLocation_POST,
    addHospital_POST
} = require('../controllers/admin/adminHospitalController');

//middleware
const { 
    requireAdminSignin
} = require('../middlewares/adminMiddlewares');


//related to roles and types on application level
//POST /api/admin/type/create
router.post("/type/create", requireAdminSignin, addType_POST);

//PUT /api/admin/type/update
router.put("/type/update", requireAdminSignin, updateType_PUT);

//POST /api/admin/role/create
router.post("/role/create", requireAdminSignin, addRole_POST);

//PUT /api/admin/role/update
router.put("/role/update", requireAdminSignin, updateRole_PUT);

//related to hospitals

//POST /api/admin/hospital/search-location
router.post("/hospital/search-location", requireAdminSignin ,getLocation_POST);

//POST /api/admin/hospital/create
router.post("/hospital/create", requireAdminSignin, addHospital_POST);

module.exports = router;