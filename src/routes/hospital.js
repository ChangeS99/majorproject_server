const router = require('express').Router();
//url = https://api.mapbox.com/geocoding/v5/mapbox.places/kamrup.json?access_token=pk.eyJ1IjoiY2hhbmdlczk5IiwiYSI6ImNrcjUxdXphcTMxcjQycG82bDU1OGRyeGUifQ.uIC7dUAkwVS9TmnEgVIGWg

const {
    hospitalRegister,
    verifyHospitalRegisterToken,
    activateHospitalRegister,
    hospitalDetail_POST,
    hospitalSignin_POST,
    reSigninHospital_POST,
    hospitalAllRole_GET,
    hospitalAllDepartment_GET,
    hospitalCreateRole_POST,
    hospitalCreateDepartment_POST,
    deleteDepartmentHospital_DELETE,
    deleteRoleHospital_DELETE,
    hospitalAllFloor_GET,
    hospitalAllRoom_GET,
    hospitalFloorCreate_POST,
    hospitalFloorDelete_DELETE,
    hospitalRoomCreate_POST,
    hospitalRoomDelete_DELETE
} = require('../controllers/hospitalController');

const {
    adminHospitalSearch_POST,
    adminHospitalList_POST,
    adminHospitalCreate_POST,
    adminHospitalCreateActivate_POST,
    adminHospitalActivateVerify_POST,
    adminHospitalDelete_DELETE,
    adminAnnouncementCreate_POST,
    adminAnnouncementFind_POST,
    adminAnnouncementSearch_POST
} = require('../controllers/hospitalAdminController')

const {
    hospitalRegisterValidator,
    hospitalDetailValidator
} = require('../validators');

//middlewares
const {
    requireNormalUserSignedin
} = require('../middlewares/userMiddlewares');

const {
    verifyHospitalCookie
} = require('../middlewares/hospitalMiddleware');

//=======================================================
//hospital related 

//POST /api/hospital/register
router.post("/register", requireNormalUserSignedin, hospitalRegisterValidator, hospitalRegister);

// POST /api/hospital/register/verify
router.post("/register/verify", requireNormalUserSignedin, verifyHospitalRegisterToken);

//POST /api/hospital/register/activate
router.post("/register/activate", requireNormalUserSignedin ,hospitalDetailValidator, activateHospitalRegister);

//POST /api/hospital/detail
router.post("/detail", requireNormalUserSignedin , verifyHospitalCookie, hospitalDetail_POST);

//POST /api/hospital/resignin
router.post("/signin", requireNormalUserSignedin , hospitalSignin_POST);

//POST /api/hospital/resignin
router.post("/resignin", requireNormalUserSignedin , reSigninHospital_POST);

//===========================================================
//hospital role and department related

//POST /api/hospital/role/all
router.get("/role/all", verifyHospitalCookie, hospitalAllRole_GET);

//POST /api/hospital/department/all
router.get("/department/all", verifyHospitalCookie, hospitalAllDepartment_GET)

//POST /api/hospital/role/create
router.post('/role/create', verifyHospitalCookie, hospitalCreateRole_POST);

//POST /api/hospital/department/create
router.post('/department/create', verifyHospitalCookie, hospitalCreateDepartment_POST);

//DELETE /api/hospital/role/delete
router.delete('/role/delete', verifyHospitalCookie, deleteRoleHospital_DELETE);

//DELETE /api/hospital/department/delete
router.delete('/department/delete', verifyHospitalCookie, deleteDepartmentHospital_DELETE);

// ===============================================
// hospital admin related
//POST /api/hospital/admin/create
router.post("/admin/create", verifyHospitalCookie, adminHospitalCreate_POST);

//POST /api/hospital/admin/activate/verify
router.post("/admin/activate/verify",adminHospitalActivateVerify_POST);

//POST /api/hospital/admin/activate
router.post("/admin/activate", adminHospitalCreateActivate_POST);

//POST /api/hospital/admin/delete
router.delete("/admin/delete", verifyHospitalCookie, adminHospitalDelete_DELETE);

//POST /api/hospital/admin/list
router.post("/admin/list", verifyHospitalCookie, adminHospitalList_POST);

//POST /api/hospital/admin/serach
router.post("/admin/search", verifyHospitalCookie, adminHospitalSearch_POST);

//POST /api/hospital/admin/announcement/create
router.post("/admin/announcement/create", verifyHospitalCookie, adminAnnouncementCreate_POST);

//POST /api/hospital/admin/announcement/find
router.post("/admin/announcement/find", verifyHospitalCookie, adminAnnouncementFind_POST);

//POST /api/hospital/admin/announcement/search
router.post("/admin/announcement/search", verifyHospitalCookie, adminAnnouncementSearch_POST);

//==========================================
//floor and room related
//GET /api/hospital/floor/all
router.get("/floor/all", verifyHospitalCookie, hospitalAllFloor_GET);

//GET /api/hospital/room/all
router.get("/room/all", verifyHospitalCookie, hospitalAllRoom_GET);

//POST /api/hospital/floor/create
router.post("/floor/create", verifyHospitalCookie, hospitalFloorCreate_POST);

//POST /api/hospital/room/create
router.post("/room/create", verifyHospitalCookie, hospitalRoomCreate_POST);

//DELETE /api/hospital/floor/delete
router.delete("/floor/delete", verifyHospitalCookie, hospitalFloorDelete_DELETE);

//DELETE /api/hospital/room/delete
router.delete("/room/delete", verifyHospitalCookie, hospitalRoomDelete_DELETE);


module.exports = router;