import { useState, useEffect } from 'react';
import getIcon from '../utils/iconUtils';

function ProjectForm({ initialData, clients, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    description: '',
    status: 'active',
    hourlyRate: 75,
    budget: {
      amount: 0,
      type: 'fixed'
    },
    milestones: []
  });
  
  const [errors, setErrors] = useState({});
  
  // Icons
  const AlertCircleIcon = getIcon('AlertCircle');

  // Initialize form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'budget.amount') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          amount: parseFloat(value) || 0
        }
      }));
    } else if (name === 'budget.type') {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          type: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }
    
    if (formData.budget.amount <= 0) {
      newErrors['budget.amount'] = 'Budget must be greater than zero';
    }
    
    if (formData.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Hourly rate must be greater than zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Project Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
            placeholder="Enter project name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircleIcon size={14} className="mr-1" /> {errors.name}
            </p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="clientId" className="form-label">Client*</label>
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className={`select ${errors.clientId ? 'border-red-500 dark:border-red-500' : ''}`}
          >
            <option value="">Select Client</option>
            {clients.filter(c => c.status === 'active').map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          {errors.clientId && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircleIcon size={14} className="mr-1" /> {errors.clientId}
            </p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="Describe the project"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="status" className="form-label">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="select"
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="hourlyRate" className="form-label">Hourly Rate ($)*</label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              className={`input ${errors.hourlyRate ? 'border-red-500 dark:border-red-500' : ''}`}
              min="0"
              step="0.01"
            />
            {errors.hourlyRate && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircleIcon size={14} className="mr-1" /> {errors.hourlyRate}
              </p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="budget.type" className="form-label">Budget Type</label>
            <select
              id="budget.type"
              name="budget.type"
              value={formData.budget.type}
              onChange={handleChange}
              className="select"
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly Cap</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="budget.amount" className="form-label">Budget Amount ($)*</label>
          <input
            type="number"
            id="budget.amount"
            name="budget.amount"
            value={formData.budget.amount}
            onChange={handleChange}
            className={`input ${errors['budget.amount'] ? 'border-red-500 dark:border-red-500' : ''}`}
            min="0"
            step="0.01"
          />
          {errors['budget.amount'] && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircleIcon size={14} className="mr-1" /> {errors['budget.amount']}
            </p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {initialData ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ProjectForm;