import bcrypt from "bcrypt";
import { assignPermissionDao, createUserDao, deleteUserByIdDao, getUserByIdDao, loginUserDao, signupUserDao } from "../dao/userDao.js";
import { accessToken } from "../utils/token.js";

export const signupUserService = async (requesterRole, userDetails) => {
  try {
    if (requesterRole !== "super_admin") {
      return { error: "Only the Super Admin can create Admin users." };
    }

    const hashedPassword = await bcrypt.hash(userDetails.password, 10);
    const user = {
      email: userDetails.email,
      name: userDetails.name,
      password: hashedPassword,
      role: userDetails.role,
    };
    const userResponse = await signupUserDao(user);
    return userResponse;
  } catch (error) {
    return { error: "An error occurred while signing up the user." };
  }
};


export const userLoginService = async (userDetails) => {
  try {
    if (!userDetails || !userDetails.email || !userDetails.password) {
      return null; 
    }

    const userLoginResponse = await loginUserDao(userDetails);
    console.log('use... ', userLoginResponse)
    if (userLoginResponse === null) {
      return null; 
    }

    if (userLoginResponse.match === false) {
      return { match: false };
    }

    const userTokenDetails = {
      email: userLoginResponse.user.email,
      userId: userLoginResponse.user.id,
      role: userLoginResponse.user.role
    };

    return {
      name: userLoginResponse.user.name,
      userId: userLoginResponse.user.id,
      role: userLoginResponse.user.role,
      accessToken: await accessToken(userTokenDetails),
    };
  } catch (error) {
    throw error;
  }
};

export const createUserService = async(userDetails) => {
  try {
    const hashedPassword = await bcrypt.hash(userDetails.password, 10);
    const user = {
      email: userDetails.email,
      name: userDetails.name,
      password: hashedPassword,
      role: userDetails.role,
    };
    const userResponse = await createUserDao(user)
    return userResponse
  } catch (error) {
    throw error
  }
}

export const deleteUserByIdService = async(userId)=>{
  try {
        const deleteResponse = await deleteUserByIdDao(userId);
        return deleteResponse; 
    } catch (error) {
        return error
    }
}

export const getUserByIdService = async (userId) => {
  try {
    const userResponse = await getUserByIdDao(userId);
    return userResponse;
  } catch (error) {
    throw error;
  }
};

export const assignPermissionService = async (permissionDetails) => {
  try {
    const permissionResponse = await assignPermissionDao(permissionDetails);
    return permissionResponse;
  } catch (error) {
    throw new Error("Service error while assigning permission");
  }
};
