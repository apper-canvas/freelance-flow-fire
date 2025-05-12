import apperService from './apper';

// Project table name from schema
const TABLE_NAME = 'project';

// Fetch all projects or filter by client
export const fetchProjects = async (filters = {}) => {
  const params = {
    Fields: [
      { Field: { Name: "Id" } },
      { Field: { Name: "Name" } },
      { Field: { Name: "Tags" } },
      { Field: { Name: "clientId" } },
      { Field: { Name: "status" } },
      { Field: { Name: "hourlyRate" } },
      { Field: { Name: "budgetAmount" } },
      { Field: { Name: "budgetType" } },
      { Field: { Name: "description" } }
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
  
  if (filters.status) {
    whereConditions.push({
      fieldName: "status",
      Operator: "ExactMatch",
      values: [filters.status]
    });
  }
  
  if (whereConditions.length > 0) {
    params.where = whereConditions;
  }

  try {
    const response = await apperService.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Get project by ID
export const getProjectById = async (projectId) => {
  try {
    const response = await apperService.getRecordById(TABLE_NAME, projectId);
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

// Create a project
export const createProject = async (projectData) => {
  try {
    // Format budget data
    const formattedProject = {
      ...projectData,
      budgetAmount: parseFloat(projectData.budgetAmount || 0),
      hourlyRate: parseFloat(projectData.hourlyRate || 0)
    };

    const params = {
      records: [formattedProject]
    };

    const response = await apperService.createRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// Update a project
export const updateProject = async (projectData) => {
  try {
    // Format budget data
    const formattedProject = {
      ...projectData,
      budgetAmount: parseFloat(projectData.budgetAmount || 0),
      hourlyRate: parseFloat(projectData.hourlyRate || 0)
    };

    const params = {
      records: [formattedProject]
    };

    const response = await apperService.updateRecord(TABLE_NAME, params);
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    const params = {
      RecordIds: [projectId]
    };

    const response = await apperService.deleteRecord(TABLE_NAME, params);
    return response.success;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export default {
  fetchProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};