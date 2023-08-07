import {
  DELETE_FAILED,
  DELETE_SUCESS,
  UPDATE_FAILED,
  UPDATE_SUCESS,
} from "../constants.js";
import {
  addFeedAccessService,
  createFeedsService,
  deleteFeedsService,
  getAllFeedsService,
  getFeedsByIdService,
  updateFeedsService,
} from "../service/feedsService.js";

export const createFeedsController = async (req, res) => {
  try {
    let feedsResponse = await createFeedsService(req.body);
    return res
      .status(200)
      .json({ isSuccess: true, statusCode: 200, feedsResponse });
  } catch (error) {
    return res.json({ feedsError: error });
  }
};

export const getAllFeedsController = async (req, res) => {
  try {
    let feedsResponse = await getAllFeedsService();
    return res
      .status(201)
      .json({ isSuccess: true, statusCode: 200, feedsResponse });
  } catch (error) {
    return res.status(500).json({ feedsError: error });
  }
};

export const updateFeedsController = async (req, res) => {
  try {
    let updateDetails = {
      id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      url: req.body.url,
    };
    let feedsResponse = await updateFeedsService(updateDetails);
    if (feedsResponse.rowCount === 1) {
      return res
        .status(201)
        .json({ isSuccess: true, statusCode: 200, message: UPDATE_SUCESS });
    } else {
      return res
        .status(500)
        .json({ isSuccess: true, statusCode: 500, message: UPDATE_FAILED });
    }
  } catch (error) {
    return res.status(500).json({ feedsError: error });
  }
};

export const deleteFeedsController = async (req, res) => {
  try {
    const userId = req.userId;
    let deleteResponse = await deleteFeedsService(req.params.id, userId);
    console.log("delete res in feeds controller.... ", deleteResponse);
    if (deleteResponse.rowCount === 1) {
      return res.status(200).json({
        isSuccess: true,
        statusCode: 200,
        message: DELETE_SUCESS,
      });
    }
    if (!deleteResponse.isPermissionExist) {
      return res.status(403).json({
        isSuccess: false,
        statusCode: 403,
        message: "User does not have permission to delete this feed",
      });
    } else {
      return res.status(404).json({
        isSuccess: false,
        statusCode: 404,
        message: "Resouce not found",
      });
    }
  } catch (error) {
    console.log("delete res err.... ", error);

    return res.status(500).json({ error });
  }
};

export const getFeedsByIdController = async (req, res) => {
  try {
    const feedId = req.params.feedId;
    const feedsResponse = await getFeedsByIdService(feedId);

    if (feedsResponse) {
      return res.status(200).json({
        isSuccess: true,
        statusCode: 200,
        user: feedsResponse,
      });
    } else {
      return res.status(404).json({
        isSuccess: false,
        statusCode: 404,
        message: "Feed not found",
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

export const addFeedAccessController = async (req, res) => {
  try {
    const feedAccessResponse = await addFeedAccessService(req.body);
    console.log("feedAccess res...", feedAccessResponse);
    res
      .status(201)
      .json({ isSuccess: true, statusCode: 201, data: feedAccessResponse });
  } catch (error) {
    console.error("Error in addFeedAccessController:", error);
    res.status(500).json({
      isSuccess: false,
      statusCode: 500,
      error: "Internal server error",
    });
  }
};
