import {
    addFeedAccessDao,
  createFeedsDao,
  deleteFeedsDao,
  getAllFeedsDao,
  getFeedByIdDao,
  updateFeedsDao,
} from "../dao/feedsDao.js";

export const createFeedsService = async (feeds) => {
  try {
    const feedsResponse = await createFeedsDao(feeds);
    return feedsResponse;
  } catch (error) {
    return error;
  }
};

export const getAllFeedsService = async () => {
  try {
    const feedsResponse = await getAllFeedsDao();
    return feedsResponse;
  } catch (error) {
    return error;
  }
};

export const updateFeedsService = async (updateDetails) => {
  try {
    const feedsResponse = await updateFeedsDao(updateDetails);
    return feedsResponse;
  } catch (error) {
    return error;
  }
};

export const deleteFeedsService = async (feedId, userId) => {
  try {
    const deleteResponse = await deleteFeedsDao(feedId, userId);
    console.log("delete res in feeds service.... ", deleteResponse)
    return deleteResponse;
  } catch (error) {
    return error;
  }
};

export const getFeedsByIdService = async (feedId) => {
  try {
    const feedsResponse = await getFeedByIdDao(feedId);
    return feedsResponse;
  } catch (error) {
    throw error; 
  }
};


export const addFeedAccessService = async (feedAccessDetails) => {
  try {
    const feedAccessResponse = await addFeedAccessDao(feedAccessDetails);
    return feedAccessResponse;
  } catch (error) {
    throw error;
  }
};
