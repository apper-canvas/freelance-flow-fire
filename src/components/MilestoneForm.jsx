import { useState, useEffect } from 'react';
import getIcon from '../utils/iconUtils';

function MilestoneForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    amount: 0,
    status: 'pending'
  });
  
  const [errors, setErrors] = useState({});
  
  // Icons
  const AlertCircleIcon = getIcon('AlertCircle');

  // Initialize form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
    
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Milestone title is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
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
          <label htmlFor="title" className="form-label">Milestone Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`input ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
            placeholder="Enter milestone title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircleIcon size={14} className="mr-1" /> {errors.title}
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
            placeholder="Describe the milestone"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">Due Date*</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`input ${errors.dueDate ? 'border-red-500 dark:border-red-500' : ''}`}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircleIcon size={14} className="mr-1" /> {errors.dueDate}
              </p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="amount" className="form-label">Payment Amount ($)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="input"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
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
            {initialData ? 'Update Milestone' : 'Add Milestone'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default MilestoneForm;