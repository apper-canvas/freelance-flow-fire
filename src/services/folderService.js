import apperService from './apper';

// Folder table name from schema
const TABLE_NAME = 'folder';

// Fetch folders with optional filters
export const fetchFolders = async (filters = {}) => {
  const params = {
    Fields: [
      { Field: { Name: "Id" } },
      { Field: { Name: "Name" } },
      { Field: { Name: "Tags" } },
      { Field: { Name: "parentId" } }
    ]
  };

  // Add where conditions based on filters
  const whereConditions = [];

  if (filters.parentId) {
    whereConditions.push({
      fieldName: "parentId",
      Operator: "ExactMatch",
      values: [filters.parentId]
    });
  }

  if (whereConditions.length > 0) {
    params.where = whereConditions;
  }

  // Sort by name
  params.orderBy = [
    {
      field: "Name",
      direction: "asc"
    }
  ];

  try {
    const response = await apperService.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
};

// Get folder by ID
export const getFolderById = async (folderId) => {
  try {
    const response = await apperService.getRecordById(TABLE_NAME, folderId);
    return response.data;
  } catch (error) {
    console.error("Error fetching folder:", error);
    throw error;
  }
};

// Create a folder
export const createFolder = async (folderData) => {
  try {
    const params = {
      records: [folderData]
    };

    const response = await apperService.createRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};

// Update a folder
export const updateFolder = async (folderData) => {
  try {
    const params = {
      records: [folderData]
    };

    const response = await apperService.updateRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating folder:", error);
    throw error;
  }
};

// Delete a folder
export const deleteFolder = async (folderId) => {
  try {
    const params = {
      RecordIds: [folderId]
    };

    const response = await apperService.deleteRecord(TABLE_NAME, params);
    return response.success;
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

export default {
  fetchFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder
};