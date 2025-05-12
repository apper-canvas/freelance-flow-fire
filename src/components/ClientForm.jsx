import { useState, useEffect } from 'react';
import getIcon from '../utils/iconUtils';

function ClientForm({ initialData, onSubmit, onCancel }) {
  const defaultData = {
    name: '',
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      website: ''
    },
    notes: '',
    status: 'active'
  };
  
  const [formData, setFormData] = useState(initialData || defaultData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Icons
  const AlertCircleIcon = getIcon('AlertCircle');
  
  // Initialize form with initialData when it changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }
    
    // Email validation
    if (formData.contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
      newErrors['contactInfo.email'] = 'Please enter a valid email address';
    }
    
    // Phone validation (simple)
    if (formData.contactInfo.phone && !/^[0-9+\-\s()]{7,20}$/.test(formData.contactInfo.phone)) {
      newErrors['contactInfo.phone'] = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle blur event for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateForm();
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Set all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
      if (typeof formData[key] === 'object') {
        Object.keys(formData[key]).forEach(subKey => {
          allTouched[`${key}.${subKey}`] = true;
        });
      }
    });
    setTouched(allTouched);
    
    // Validate and submit
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  // Generate field error message
  const getFieldError = (name) => {
    return touched[name] && errors[name] ? (
      <div className="text-red-500 text-sm mt-1 flex items-center">
        <AlertCircleIcon size={14} className="mr-1" />
        {errors[name]}
      </div>
    ) : null;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name" className="form-label">Client Name*</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input ${touched.name && errors.name ? 'border-red-500' : ''}`}
          placeholder="Enter client name"
        />
        {getFieldError('name')}
      </div>
      
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email Address</label>
        <input
          type="email"
          id="email"
          name="contactInfo.email"
          value={formData.contactInfo.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input ${touched['contactInfo.email'] && errors['contactInfo.email'] ? 'border-red-500' : ''}`}
          placeholder="client@example.com"
        />
        {getFieldError('contactInfo.email')}
      </div>
      
      <div className="form-group">
        <label htmlFor="phone" className="form-label">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="contactInfo.phone"
          value={formData.contactInfo.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input ${touched['contactInfo.phone'] && errors['contactInfo.phone'] ? 'border-red-500' : ''}`}
          placeholder="(123) 456-7890"
        />
        {getFieldError('contactInfo.phone')}
      </div>
      
      <div className="form-group">
        <label htmlFor="address" className="form-label">Address</label>
        <textarea
          id="address"
          name="contactInfo.address"
          value={formData.contactInfo.address}
          onChange={handleChange}
          className="input"
          placeholder="Client address"
          rows={2}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="website" className="form-label">Website</label>
        <input
          type="url"
          id="website"
          name="contactInfo.website"
          value={formData.contactInfo.website}
          onChange={handleChange}
          className="input"
          placeholder="https://example.com"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="notes" className="form-label">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="input"
          placeholder="Additional notes about the client"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
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
          {initialData ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </form>
  );
}

export default ClientForm;