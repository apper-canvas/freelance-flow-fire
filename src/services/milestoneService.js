import apperService from './apper';

// Milestone table name from schema
const TABLE_NAME = 'milestone';

// Fetch milestones by project ID
export const fetchMilestones = async (projectId) => {
  const params = {
    Fields: [
      { Field: { Name: "Id" } },
      { Field: { Name: "Name" } },
      { Field: { Name: "Tags" } },
      { Field: { Name: "title" } },
      { Field: { Name: "description" } },
      { Field: { Name: "dueDate" } },
      { Field: { Name: "amount" } },
      { Field: { Name: "status" } },
      { Field: { Name: "projectId" } }
    ],
    where: [
      {
        fieldName: "projectId",
        Operator: "ExactMatch",
        values: [projectId]
      }
    ]
  };

  try {
    const response = await apperService.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching milestones:", error);
    throw error;
  }
};

// Get milestone by ID
export const getMilestoneById = async (milestoneId) => {
  try {
    const response = await apperService.getRecordById(TABLE_NAME, milestoneId);
    return response.data;
  } catch (error) {
    console.error("Error fetching milestone:", error);
    throw error;
  }
};

// Create a milestone
export const createMilestone = async (milestoneData) => {
  try {
    // Format amount as number
    const formattedMilestone = {
      ...milestoneData,
      amount: parseFloat(milestoneData.amount || 0)
    };

    const params = {
      records: [formattedMilestone]
    };

    const response = await apperService.createRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }
};

// Update a milestone
export const updateMilestone = async (milestoneData) => {
  try {
    // Format amount as number
    const formattedMilestone = {
      ...milestoneData,
      amount: parseFloat(milestoneData.amount || 0)
    };
    
    const params = {
      records: [formattedMilestone]
    };

    const response = await apperService.updateRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }
};

// Delete a milestone
export const deleteMilestone = async (milestoneId) => {
  try {
    const params = {
      RecordIds: [milestoneId]
    };

    const response = await apperService.deleteRecord(TABLE_NAME, params);
    return response.success;
  } catch (error) {
    console.error("Error deleting milestone:", error);
    throw error;
  }
};

export default {
  fetchMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone
};