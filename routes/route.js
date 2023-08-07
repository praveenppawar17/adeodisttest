import express from "express";
import { createFeedsController, deleteFeedsController, getAllFeedsController, getFeedsByIdController, updateFeedsController } from "../controller/feedsController.js";
import { assignPermissionController, createUserController, deleteUserByIdController, getLogsController, getUserByIdController, loginUserController, signupUserController } from "../controller/userController.js";
import { authentication } from "../validator/verifyToken.js";
import { authorization } from "../validator/authorization.js";
import { checkFeedAccess } from "../validator/checkfeedaccess.js";
import { feedsValidationRules, userValidationRules, validate } from "../validator/validator.js";
const router = express.Router();

router.post("/user/signup",signupUserController);
router.post("/user/login", loginUserController);

// basic user role can be createted by admin and super admin
router.post(
  "/users",
  authentication,
  authorization,
  userValidationRules(),
  validate,
  createUserController
);

// delete user can be done by admin and super admin
router.delete('/users/:id', authentication, authorization,deleteUserByIdController)
// not used
router.get("/user/:id", getUserByIdController);

// feed can be created by super admin admin basic user
router.post("/feeds",authentication,authorization, feedsValidationRules(),validate,createFeedsController)
// only for super admin
router.get("/feeds", authentication, authorization, getAllFeedsController);
router.put('/feeds/:id', updateFeedsController)
// user can access feed if its feedaccess is provided by admin
router.get(
  "/getfeedbyid/:feedId",
  authentication,
  authorization,
  checkFeedAccess,
  getFeedsByIdController
);
// delete certainfeed by admin if access is given by super admin
router.delete(
  "/deletefeedbyid/:id",
  authentication,
  authorization,
  deleteFeedsController
);
// admin adds feeds access to user
// router.post("/feedaccess",addFeedAccessController)

// To get the logs from the files(only for the super-admin)
router.get("/logs", authentication, authorization, getLogsController);
// super admin assigns permissions to admin on certainadmins like CRUD
router.post("/assignpermission", authentication,authorization,assignPermissionController);



export default router;


