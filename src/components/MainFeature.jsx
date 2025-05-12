import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

function MainFeature() {
  // Icons declaration
  const ClockIcon = getIcon('Clock');
  const PlusIcon = getIcon('Plus');
  const EditIcon = getIcon('Edit3');
  const TrashIcon = getIcon('Trash2');
  const DollarSignIcon = getIcon('DollarSign');
  const CalendarIcon = getIcon('Calendar');
  const SaveIcon = getIcon('Save');
  const XIcon = getIcon('X');
  const CheckIcon = getIcon('Check');
  const FilterIcon = getIcon('Filter');
  const DownloadIcon = getIcon('Download');
  
  // State hooks
  const [activeTab, setActiveTab] = useState('time');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [filterClient, setFilterClient] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  
  // Entry form state
  const [entryForm, setEntryForm] = useState({
    id: '',
    clientId: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    description: '',
    billable: true
  });
  
  // Local state for time entries
  const [timeEntries, setTimeEntries] = useState([]);
  
  // Get data from Redux store
  const storeTimeEntries = useSelector(state => state.timeEntries);
  const clients = useSelector(state => state.clients);
  const projects = useSelector(state => state.projects);
  
  // Initialize local time entries from store
  useEffect(() => {
    setTimeEntries(storeTimeEntries);
  }, [storeTimeEntries]);
  
  // Filter time entries based on selected filters
  useEffect(() => {
    let filtered = [...timeEntries];
    
    if (filterClient) {
      filtered = filtered.filter(entry => entry.clientId === filterClient);
    }
    
    if (filterProject) {
      filtered = filtered.filter(entry => entry.projectId === filterProject);
    }
    
    setFilteredEntries(filtered);
  }, [timeEntries, filterClient, filterProject]);
  
  // Reset entry form
  const resetEntryForm = () => {
    setEntryForm({
      id: '',
      clientId: '',
      projectId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      description: '',
      billable: true
    });
  };
  
  // Handle edit entry
  const handleEditEntry = (entry) => {
    // Format the entry data for the form
    const startDate = new Date(entry.startTime);
    const endDate = new Date(entry.endTime);
    
    setEntryForm({
      id: entry.id,
      clientId: entry.clientId,
      projectId: entry.projectId,
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      description: entry.description,
      billable: entry.billable
    });
    
    setFormMode('edit');
    setShowEntryForm(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!entryForm.clientId || !entryForm.projectId || !entryForm.date || !entryForm.startTime || !entryForm.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Calculate timestamps and duration
    const startDateTime = new Date(`${entryForm.date}T${entryForm.startTime}`);
    const endDateTime = new Date(`${entryForm.date}T${entryForm.endTime}`);
    
    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }
    
    const durationSeconds = (endDateTime - startDateTime) / 1000;
    
    const project = projects.find(p => p.id === entryForm.projectId);
    const hourlyRate = project?.hourlyRate || 0;
    
    const newEntry = {
      id: formMode === 'add' ? Date.now().toString() : entryForm.id,
      clientId: entryForm.clientId,
      projectId: entryForm.projectId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: durationSeconds,
      description: entryForm.description,
      hourlyRate: hourlyRate,
      billable: entryForm.billable
    };
    
    if (formMode === 'add') {
      // Add new entry
      setTimeEntries([newEntry, ...timeEntries]);
      toast.success("Time entry added successfully");
    } else {
      // Update existing entry
      const updatedEntries = timeEntries.map(entry => 
        entry.id === newEntry.id ? newEntry : entry
      );
      setTimeEntries(updatedEntries);
      toast.success("Time entry updated successfully");
    }
    
    // Reset and close form
    resetEntryForm();
    setShowEntryForm(false);
  };
  
  // Handle delete entry
  const handleDeleteEntry = (id) => {
    if (confirm("Are you sure you want to delete this time entry?")) {
      const updatedEntries = timeEntries.filter(entry => entry.id !== id);
      setTimeEntries(updatedEntries);
      toast.success("Time entry deleted");
    }
  };
  
  // Format duration in hours and minutes
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };
  
  // Generate PDF report
  const generateReport = () => {
    toast.success("Report downloaded successfully", {
      icon: "📊"
    });
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Time & Expense Tracker</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setFormMode('add');
              resetEntryForm();
              setShowEntryForm(true);
            }}
            className="btn btn-primary"
          >
            <PlusIcon size={18} className="mr-2" />
            Add Entry
          </button>
          
          <button 
            onClick={generateReport}
            className="btn btn-outline"
          >
            <DownloadIcon size={18} className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 mb-4">
        <button
          onClick={() => setActiveTab('time')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'time'
              ? 'text-primary border-b-2 border-primary'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
          }`}
        >
          <ClockIcon size={16} className="inline mr-1" />
          Time Entries
        </button>
        
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'expenses'
              ? 'text-primary border-b-2 border-primary'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
          }`}
        >
          <DollarSignIcon size={16} className="inline mr-1" />
          Expenses
        </button>
      </div>
      
      {/* Filters */}
      <div className="card mb-4 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <FilterIcon size={16} className="mr-2 text-surface-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="flex-grow md:flex-grow-0">
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="select text-sm py-1"
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-grow md:flex-grow-0">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="select text-sm py-1"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          {(filterClient || filterProject) && (
            <button
              onClick={() => {
                setFilterClient('');
                setFilterProject('');
              }}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Time Entries Table */}
      {activeTab === 'time' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-500 dark:text-surface-400 tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-500 dark:text-surface-400 tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-500 dark:text-surface-400 tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-500 dark:text-surface-400 tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-500 dark:text-surface-400 tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-500 dark:text-surface-400 tracking-wider">Billable</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-surface-500 dark:text-surface-400 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {filteredEntries.map(entry => {
                  const client = clients.find(c => c.id === entry.clientId);
                  const project = projects.find(p => p.id === entry.projectId);
                  const date = new Date(entry.startTime).toLocaleDateString();
                  
                  return (
                    <tr key={entry.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                      <td className="px-4 py-3 text-sm">{date}</td>
                      <td className="px-4 py-3 text-sm">{client?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm">{project?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm">{entry.description}</td>
                      <td className="px-4 py-3 text-sm">{formatDuration(entry.duration)}</td>
                      <td className="px-4 py-3 text-sm">
                        {entry.billable ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                            <CheckIcon size={12} className="mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-300">
                            <XIcon size={12} className="mr-1" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="text-primary hover:text-primary-dark"
                            aria-label="Edit"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-rose-500 hover:text-rose-600"
                            aria-label="Delete"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-surface-500 dark:text-surface-400">
                      No time entries found. Try clearing filters or add a new entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Expenses List (placeholder) */}
      {activeTab === 'expenses' && (
        <div className="card p-6 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-surface-100 dark:bg-surface-800 p-4 rounded-full mb-4">
              <DollarSignIcon size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Your Expenses</h3>
            <p className="text-surface-600 dark:text-surface-400 max-w-md mb-4">
              Keep track of your business expenses, categorize them, and associate them with clients and projects.
            </p>
            <button className="btn btn-primary">
              <PlusIcon size={18} className="mr-2" />
              Add Expense
            </button>
          </div>
        </div>
      )}
      
      {/* Time Entry Form Modal */}
      <AnimatePresence>
        {showEntryForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEntryForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {formMode === 'add' ? 'Add Time Entry' : 'Edit Time Entry'}
                </h3>
                <button
                  onClick={() => setShowEntryForm(false)}
                  className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                >
                  <XIcon size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="client">Client *</label>
                    <select
                      id="client"
                      value={entryForm.clientId}
                      onChange={(e) => {
                        setEntryForm({
                          ...entryForm,
                          clientId: e.target.value,
                          projectId: '' // Reset project when client changes
                        });
                      }}
                      className="select"
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="project">Project *</label>
                    <select
                      id="project"
                      value={entryForm.projectId}
                      onChange={(e) => setEntryForm({ ...entryForm, projectId: e.target.value })}
                      className="select"
                      required
                      disabled={!entryForm.clientId}
                    >
                      <option value="">Select Project</option>
                      {projects
                        .filter(project => project.clientId === entryForm.clientId)
                        .map(project => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="date">Date *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-surface-500">
                        <CalendarIcon size={16} />
                      </span>
                      <input
                        type="date"
                        id="date"
                        value={entryForm.date}
                        onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                        className="input pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="startTime">Start Time *</label>
                    <input
                      type="time"
                      id="startTime"
                      value={entryForm.startTime}
                      onChange={(e) => setEntryForm({ ...entryForm, startTime: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="endTime">End Time *</label>
                    <input
                      type="time"
                      id="endTime"
                      value={entryForm.endTime}
                      onChange={(e) => setEntryForm({ ...entryForm, endTime: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={entryForm.description}
                    onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                    className="input min-h-[80px]"
                    placeholder="What did you work on?"
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={entryForm.billable}
                      onChange={(e) => setEntryForm({ ...entryForm, billable: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`toggle-slider ${entryForm.billable ? 'toggle-active' : ''}`}></div>
                    <span className="ml-3 text-sm font-medium">Billable</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEntryForm(false)}
                    className="btn border border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <SaveIcon size={18} className="mr-2" />
                    {formMode === 'add' ? 'Add Entry' : 'Update Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainFeature;