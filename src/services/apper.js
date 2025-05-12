/**
 * Apper Service - Provides functionality for interacting with the Apper backend
 */

// Initialize ApperClient
const initApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Generic fetch records function
export const fetchRecords = async (tableName, params = {}) => {
  try {
    const apperClient = initApperClient();
    const response = await apperClient.fetchRecords(tableName, params);
    return response;
  } catch (error) {
    console.error(`Error fetching ${tableName} records:`, error);
    throw error;
  }
};

// Get record by ID
export const getRecordById = async (tableName, recordId, params = {}) => {
  try {
    const apperClient = initApperClient();
    const response = await apperClient.getRecordById(tableName, recordId, params);
    return response;
  } catch (error) {
    console.error(`Error getting ${tableName} record:`, error);
    throw error;
  }
};

// Create record(s)
export const createRecord = async (tableName, params) => {
  try {
    const apperClient = initApperClient();
    const response = await apperClient.createRecord(tableName, params);
    return response;
  } catch (error) {
    console.error(`Error creating ${tableName} record:`, error);
    throw error;
  }
};

// Update record(s)
export const updateRecord = async (tableName, params) => {
  try {
    const apperClient = initApperClient();
    const response = await apperClient.updateRecord(tableName, params);
    return response;
  } catch (error) {
    console.error(`Error updating ${tableName} record:`, error);
    throw error;
  }
};

// Delete record(s)
export const deleteRecord = async (tableName, params) => {
  try {
    const apperClient = initApperClient();
    const response = await apperClient.deleteRecord(tableName, params);
    return response;
  } catch (error) {
    console.error(`Error deleting ${tableName} record:`, error);
    throw error;
  }
};

export default {
  fetchRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord
};