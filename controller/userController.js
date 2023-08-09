import { readdir, readFile, stat } from "fs/promises"; // Import 'stat' instead of 'statSync'
import path from "path";
import {
  assignPermissionService,
  createUserService,
  deleteUserByIdService,
  getUserByIdService,
  signupUserService,
  userLoginService,
} from "../service/userService.js";
import {
  AUTHENTICATION_FAILED,
  DELETE_SUCESS,
  INTERNAL_SERVER_ERROR,
} from "../constants.js";

const targetDir = "D:/nodejs/adeodisttest/logs";

export const signupUserController = async (request, response) => {
  try {
    // Determine the role of the requester (Super Admin)
    const requesterRole = "super_admin";

    const userResponse = await signupUserService(requesterRole, request.body);

    if (userResponse.isUserExists) {
      return response.status(409).json({
        isSuccess: false,
        message: `${userResponse.email} already exists`,
      });
    }
    if (userResponse.error) {
      return response.status(409).json({
        isSuccess: false,
        statusCode: 409,
        message: userResponse.error,
      });
    }
    return response
      .status(201)
      .json({ isSuccess: true, message: "signup successful", userResponse });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ isSuccess: false, message: "Error while signup the user" });
  }
};

export const loginUserController = async (request, response) => {
  try {
    console.log("body... ", request.body);
    const user = await userLoginService(request.body);

    if (user === null) {
      return response.status(400).json({
        isSuccess: false,
        statusCode: 400,
        error: "User not found",
        message: "Email not registered",
      });
    } else if (user.match === false) {
      return response.status(401).json({
        isSuccess: false,
        statusCode: 401,
        error: AUTHENTICATION_FAILED,
        // message: "Password does not match",
      });
    }
    return response
      .status(200)
      .json({ isSuccess: true, statusCode: 200, user });
  } catch (error) {
    return response.status(500).json({
      isSuccess: false,
      statusCode: 500,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const getLogsController = async (req, res) => {
  try {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    const files = await readdir(targetDir);

    const recentFiles = await Promise.all(
      files.map(async (file) => {
        // promise.all to await all stat calls
        const filePath = path.join(targetDir, file);
        const stats = await stat(filePath);

        return { file, stats };
      })
    );

    const filteredFiles = recentFiles.filter(({ stats }) => {
      return stats.isFile() && stats.ctimeMs >= fiveMinutesAgo;
    });

    if (filteredFiles.length === 0) {
      return res.status(404).json({
        isSuccess: false,
        statusCode: 404,
        message: "No recent files found",
      });
    }

    const mostRecentFile = filteredFiles.reduce((prev, curr) => {
      return prev.stats.ctimeMs > curr.stats.ctimeMs ? prev : curr;
    });

    const filePath = path.join(targetDir, mostRecentFile.file);
    const data = await readFile(filePath, "utf-8");
    return res.status(200).json({
      isSuccess: true,
      statusCode: 200,
      logs: data,
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      isSuccess: false,
      statusCode: 500,
      message: "Something went wrong",
    });
  }
};

export const createUserController = async (req, res) => {
  try {
    let userResponse = await createUserService(req.body);
    console.log("user.. ", userResponse);
    if (userResponse.isUserExists) {
      return res.status(409).json({
        isSuccess: false,
        statusCode: 409,
        message: `user with email ${userResponse.email} already exists`,
      });
    } else {
      return res.status(200).json({
        isSuccess: true,
        statusCode: 200,
        user: userResponse,
      });
    }
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

export const deleteUserByIdController = async (req, res) => {
  try {
    let deleteResponse = await deleteUserByIdService(req.params.id);
    console.log("delte... ", deleteResponse);
    if (deleteResponse.rowCount === 1) {
      return res.status(200).json({
        isSuccess: true,
        statusCode: 200,
        message: DELETE_SUCESS,
      });
    } else {
      return res.status(404).json({
        isSuccess: false,
        statusCode: 404,
        message: "Resouce not found",
      });
    }
  } catch (error) {
    console.log("er... ", error);
    return res.status(500).json({ error });
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    const userResponse = await getUserByIdService(userId);

    if (userResponse) {
      return res.status(200).json({
        isSuccess: true,
        statusCode: 200,
        user: userResponse,
      });
    } else {
      return res.status(404).json({
        isSuccess: false,
        statusCode: 404,
        message: "User not found",
      });
    }
  } catch (error) {
    console.log("er... ", error);
    return res.status(500).json({
      isSuccess: false,
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

export const assignPermissionController = async (req, res) => {
  try {
    const permissionResponse = await assignPermissionService(req.body);
    res
      .status(201)
      .json({
        isSuccess: true,
        statusCode: 201,
        permission: permissionResponse,
      });
  } catch (error) {
    console.error("Error assigning permission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
