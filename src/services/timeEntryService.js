import apperService from './apper';

// Time Entry table name from schema
const TABLE_NAME = 'time_entry';

// Fetch time entries with optional filters
export const fetchTimeEntries = async (filters = {}) => {
  const params = {
    Fields: [
      { Field: { Name: "Id" } },
      { Field: { Name: "Name" } },
      { Field: { Name: "Tags" } },
      { Field: { Name: "startTime" } },
      { Field: { Name: "endTime" } },
      { Field: { Name: "duration" } },
      { Field: { Name: "description" } },
      { Field: { Name: "hourlyRate" } },
      { Field: { Name: "billable" } },
      { Field: { Name: "projectId" } },
      { Field: { Name: "clientId" } }
    ]
  };

  // Add where conditions based on filters
  const whereConditions = [];

  if (filters.clientId) {
    whereConditions.push({
      fieldName: "clientId",
      Operator: "ExactMatch",
      values: [filters.clientId]
    });
  }

  if (filters.projectId) {
    whereConditions.push({
      fieldName: "projectId",
      Operator: "ExactMatch",
      values: [filters.projectId]
    });
  }

  if (filters.startDate && filters.endDate) {
    whereConditions.push({
      fieldName: "startTime",
      Operator: "Between",
      values: [filters.startDate, filters.endDate]
    });
  }

  if (whereConditions.length > 0) {
    params.where = whereConditions;
  }

  // Sort by start time descending
  params.orderBy = [
    {
      field: "startTime",
      direction: "desc"
    }
  ];

  try {
    const response = await apperService.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching time entries:", error);
    throw error;
  }
};

// Get time entry by ID
export const getTimeEntryById = async (timeEntryId) => {
  try {
    const response = await apperService.getRecordById(TABLE_NAME, timeEntryId);
    return response.data;
  } catch (error) {
    console.error("Error fetching time entry:", error);
    throw error;
  }
};

// Create a time entry
export const createTimeEntry = async (timeEntryData) => {
  try {
    // Format numbers correctly
    const formattedTimeEntry = {
      ...timeEntryData,
      duration: parseFloat(timeEntryData.duration || 0),
      hourlyRate: parseFloat(timeEntryData.hourlyRate || 0)
    };

    const params = {
      records: [formattedTimeEntry]
    };

    const response = await apperService.createRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating time entry:", error);
    throw error;
  }
};

// Update a time entry
export const updateTimeEntry = async (timeEntryData) => {
  try {
    // Format numbers correctly
    const formattedTimeEntry = {
      ...timeEntryData,
      duration: parseFloat(timeEntryData.duration || 0),
      hourlyRate: parseFloat(timeEntryData.hourlyRate || 0)
    };

    const params = {
      records: [formattedTimeEntry]
    };

    const response = await apperService.updateRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating time entry:", error);
    throw error;
  }
};

// Delete a time entry
export const deleteTimeEntry = async (timeEntryId) => {
  try {
    const params = {
      RecordIds: [timeEntryId]
    };

    const response = await apperService.deleteRecord(TABLE_NAME, params);
    return response.success;
  } catch (error) {
    console.error("Error deleting time entry:", error);
    throw error;
  }
};

export default {
  fetchTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
};