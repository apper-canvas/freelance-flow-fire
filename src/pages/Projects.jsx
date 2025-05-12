import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import ProjectForm from '../components/ProjectForm';
import MilestoneForm from '../components/MilestoneForm';

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all'); // 'all', 'active', 'completed', 'on_hold'
  const [clientFilter, setClientFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'
  const [budgetAlerts, setBudgetAlerts] = useState([]);

  const dispatch = useDispatch();

  // Get data from store
  const clients = useSelector(state => state.clients);
  const projects = useSelector(state => state.projects);
  const timeEntries = useSelector(state => state.timeEntries);
  const expenses = useSelector(state => state.expenses);

  // Icons
  const FolderPlusIcon = getIcon('FolderPlus');
  const SearchIcon = getIcon('Search');
  const EditIcon = getIcon('Edit');
  const EyeIcon = getIcon('Eye');
  const ArrowLeftIcon = getIcon('ArrowLeft');
  const CheckIcon = getIcon('Check');
  const XIcon = getIcon('X');
  const FolderIcon = getIcon('Folder');
  const ClockIcon = getIcon('Clock');
  const DollarSignIcon = getIcon('DollarSign');
  const UsersIcon = getIcon('Users');
  const AlertTriangleIcon = getIcon('AlertTriangle');
  const FilterIcon = getIcon('Filter');
  const PlusIcon = getIcon('Plus');
  const CalendarIcon = getIcon('Calendar');
  const TrashIcon = getIcon('Trash');
  const TagIcon = getIcon('Tag');
  const PauseIcon = getIcon('Pause');
  const PlayIcon = getIcon('Play');
  const CheckCircleIcon = getIcon('CheckCircle');
  const MilestoneIcon = getIcon('Flag');
  const BarChart2Icon = getIcon('BarChart2');

  // Filtered projects
  const filteredProjects = projects.filter(project => {
    const matchesStatusFilter = projectFilter === 'all' || project.status === projectFilter;
    const matchesClientFilter = clientFilter === '' || project.clientId === clientFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatusFilter && matchesClientFilter && matchesSearch;
  });

  // Add new project
  const addProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      milestones: projectData.milestones || [],
      created: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    toast.success('Project created successfully!');
    setShowAddForm(false);
  };

  // Update project
  const updateProject = (projectData) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: projectData });
    toast.success('Project updated successfully!');
    setShowEditForm(false);
    setSelectedProject(projectData);
  };

  // Delete project
  const confirmDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const deleteProject = () => {
    if (!projectToDelete) return;
    
    dispatch({ type: 'DELETE_PROJECT', payload: projectToDelete.id });
    
    if (selectedProject && selectedProject.id === projectToDelete.id) {
      setSelectedProject(null);
    }
    
    toast.success('Project deleted successfully');
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
  };

  // Update project status
  const updateProjectStatus = (project, newStatus) => {
    const updatedProject = { ...project, status: newStatus };
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    toast.info(`Project marked as ${newStatus.replace('_', ' ')}`);
    setSelectedProject(updatedProject);
  };

  // Add milestone
  const addMilestone = (milestoneData) => {
    if (!selectedProject) return;

    const milestone = {
      id: Date.now().toString(),
      ...milestoneData,
      status: 'pending',
      created: new Date().toISOString()
    };

    const updatedProject = {
      ...selectedProject,
      milestones: [...(selectedProject.milestones || []), milestone]
    };

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    toast.success('Milestone added successfully');
    setShowMilestoneForm(false);
    setSelectedProject(updatedProject);
  };

  // Update milestone
  const updateMilestone = (milestoneData) => {
    if (!selectedProject || !editingMilestone) return;

    const updatedMilestones = selectedProject.milestones.map(m => 
      m.id === milestoneData.id ? milestoneData : m
    );

    const updatedProject = {
      ...selectedProject,
      milestones: updatedMilestones
    };

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    toast.success('Milestone updated successfully');
    setShowMilestoneForm(false);
    setEditingMilestone(null);
    setSelectedProject(updatedProject);
  };

  // Update milestone status
  const updateMilestoneStatus = (milestoneId, newStatus) => {
    if (!selectedProject) return;

    const updatedMilestones = selectedProject.milestones.map(m => 
      m.id === milestoneId ? { ...m, status: newStatus } : m
    );

    const updatedProject = {
      ...selectedProject,
      milestones: updatedMilestones
    };

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    toast.success(`Milestone marked as ${newStatus}`);
    setSelectedProject(updatedProject);
  };

  // Delete milestone
  const deleteMilestone = (milestoneId) => {
    if (!selectedProject) return;

    const updatedMilestones = selectedProject.milestones.filter(m => m.id !== milestoneId);

    const updatedProject = {
      ...selectedProject,
      milestones: updatedMilestones
    };

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    toast.success('Milestone deleted');
    setSelectedProject(updatedProject);
  };

  // Get project client
  const getProjectClient = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    return clients.find(c => c.id === project.clientId);
  };

  // Get project time entries
  const getProjectTimeEntries = (projectId) => {
    return timeEntries.filter(entry => entry.projectId === projectId);
  };

  // Get project expenses
  const getProjectExpenses = (projectId) => {
    return expenses.filter(expense => expense.projectId === projectId);
  };

  // Calculate total hours tracked for a project
  const getProjectHours = (projectId) => {
    const entries = getProjectTimeEntries(projectId);
    const totalSeconds = entries.reduce((total, entry) => total + entry.duration, 0);
    return totalSeconds / 3600;
  };

  // Calculate total expenses for a project
  const getProjectExpenseTotal = (projectId) => {
    const projectExpenses = getProjectExpenses(projectId);
    return projectExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate project progress
  const calculateProgress = (project) => {
    if (!project.milestones || project.milestones.length === 0) {
      return 0;
    }
    
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

  // Calculate budget used
  const calculateBudgetUsed = (project) => {
    if (!project) return 0;
    
    const hours = getProjectHours(project.id);
    const expenses = getProjectExpenseTotal(project.id);
    
    if (project.budget.type === 'hourly') {
      return (hours * project.hourlyRate) + expenses;
    } else {
      return expenses; // For fixed price projects, only count expenses
    }
  };

  // Check budget status
  const getBudgetStatus = (project) => {
    if (!project || !project.budget) return 'ok';
    
    const budgetUsed = calculateBudgetUsed(project);
    const budgetPercentage = (budgetUsed / project.budget.amount) * 100;
    
    if (budgetPercentage >= 100) {
      return 'exceeded';
    } else if (budgetPercentage >= 80) {
      return 'warning';
    }
    return 'ok';
  };

  // Check for budget alerts
  useEffect(() => {
    if (selectedProject) {
      const status = getBudgetStatus(selectedProject);
      if (status === 'warning' || status === 'exceeded') {
        const budgetUsed = calculateBudgetUsed(selectedProject);
        const alert = {
          id: selectedProject.id,
          name: selectedProject.name,
          budgetUsed,
          budgetTotal: selectedProject.budget.amount,
          type: status
        };
        setBudgetAlerts(prev => {
          const exists = prev.some(item => item.id === alert.id);
          if (!exists) {
            return [...prev, alert];
          }
          return prev;
        });
      }
    }
  }, [selectedProject]);

  return (
    <div>
      {selectedProject ? (
        // Project Detail View
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedProject(null)}
              className="mr-4 p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
            <div className="ml-auto flex space-x-2">
              <button 
                onClick={() => setShowEditForm(true)}
                className="btn btn-outline"
              >
                <EditIcon size={16} className="mr-1" />
                Edit
              </button>
              <button 
                onClick={() => confirmDeleteProject(selectedProject)} 
                className="btn bg-red-500 hover:bg-red-600 text-white"
              >
                <TrashIcon size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Info */}
            <div className="lg:col-span-1">
              <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Client</p>
                    <p className="font-medium">
                      {getProjectClient(selectedProject.id)?.name || 'No client assigned'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Status</p>
                    <div className="flex mt-1">
                      <button
                        onClick={() => updateProjectStatus(selectedProject, 'active')}
                        className={`px-3 py-1 text-sm rounded-l-lg ${
                          selectedProject.status === 'active' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => updateProjectStatus(selectedProject, 'on_hold')}
                        className={`px-3 py-1 text-sm ${
                          selectedProject.status === 'on_hold' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
                        }`}
                      >
                        On Hold
                      </button>
                      <button
                        onClick={() => updateProjectStatus(selectedProject, 'completed')}
                        className={`px-3 py-1 text-sm rounded-r-lg ${
                          selectedProject.status === 'completed' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
                        }`}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Description</p>
                    <p className="mt-1">{selectedProject.description || 'No description provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Rate</p>
                    <p className="font-medium">${selectedProject.hourlyRate}/hour</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Budget</p>
                    <p className="font-medium">
                      {formatCurrency(selectedProject.budget.amount)} ({selectedProject.budget.type})
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Created</p>
                    <p>{formatDate(selectedProject.created)}</p>
                  </div>
                </div>
              </div>
              
              {/* Budget Status */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Total Budget</p>
                    <p className="font-medium text-xl">{formatCurrency(selectedProject.budget.amount)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Used</p>
                    <div className="flex items-end justify-between">
                      <p className="font-medium text-xl">{formatCurrency(calculateBudgetUsed(selectedProject))}</p>
                      <p className={`text-sm ${
                        getBudgetStatus(selectedProject) === 'exceeded' ? 'text-red-500' :
                        getBudgetStatus(selectedProject) === 'warning' ? 'text-amber-500' :
                        'text-green-500'
                      }`}>
                        {Math.round((calculateBudgetUsed(selectedProject) / selectedProject.budget.amount) * 100)}%
                      </p>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5 mt-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          getBudgetStatus(selectedProject) === 'exceeded' ? 'bg-red-500' :
                          getBudgetStatus(selectedProject) === 'warning' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (calculateBudgetUsed(selectedProject) / selectedProject.budget.amount) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm">Hours Tracked</p>
                      <p className="text-sm font-medium">{getProjectHours(selectedProject.id).toFixed(1)} hrs</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Expenses</p>
                      <p className="text-sm font-medium">{formatCurrency(getProjectExpenseTotal(selectedProject.id))}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
                
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold">{calculateProgress(selectedProject)}%</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Complete</p>
                </div>
                
                <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full"
                    style={{ width: `${calculateProgress(selectedProject)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {/* Milestones */}
              <div className="card mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Milestones</h3>
                  <button 
                    onClick={() => {
                      setEditingMilestone(null);
                      setShowMilestoneForm(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <PlusIcon size={14} className="mr-1" />
                    Add Milestone
                  </button>
                </div>
                
                {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {selectedProject.milestones.map(milestone => (
                      <div key={milestone.id} className="border border-surface-200 dark:border-surface-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-surface-500 dark:text-surface-400">
                              Due: {formatDate(milestone.dueDate)}
                            </p>
                          </div>
                          <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            milestone.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : milestone.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          }`}>
                            {milestone.status === 'completed' ? 'Completed' : 
                             milestone.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </div>
                        </div>
                        
                        <p className="mb-3">{milestone.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">
                            {formatCurrency(milestone.amount)}
                          </p>
                          <div className="flex space-x-2">
                            {milestone.status !== 'completed' && (
                              <button 
                                onClick={() => updateMilestoneStatus(milestone.id, 'completed')}
                                className="p-1.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded"
                                title="Mark as Completed"
                              >
                                <CheckCircleIcon size={16} />
                              </button>
                            )}
                            
                            {milestone.status === 'pending' && (
                              <button 
                                onClick={() => updateMilestoneStatus(milestone.id, 'in_progress')}
                                className="p-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded"
                                title="Mark as In Progress"
                              >
                                <PlayIcon size={16} />
                              </button>
                            )}
                            
                            {milestone.status === 'in_progress' && (
                              <button 
                                onClick={() => updateMilestoneStatus(milestone.id, 'pending')}
                                className="p-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded"
                                title="Mark as Pending"
                              >
                                <PauseIcon size={16} />
                              </button>
                            )}
                            
                            <button 
                              onClick={() => {
                                setEditingMilestone(milestone);
                                setShowMilestoneForm(true);
                              }}
                              className="p-1.5 bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300 rounded"
                              title="Edit Milestone"
                            >
                              <EditIcon size={16} />
                            </button>
                            
                            <button 
                              onClick={() => deleteMilestone(milestone.id)}
                              className="p-1.5 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded"
                              title="Delete Milestone"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-surface-300 dark:border-surface-600 rounded-lg">
                    <MilestoneIcon size={36} className="mx-auto mb-3 text-surface-400 dark:text-surface-500" />
                    <p className="text-surface-500 dark:text-surface-400 mb-4">No milestones added yet</p>
                    <button 
                      onClick={() => {
                        setEditingMilestone(null);
                        setShowMilestoneForm(true);
                      }}
                      className="btn btn-outline"
                    >
                      <PlusIcon size={16} className="mr-1" />
                      Add First Milestone
                    </button>
                  </div>
                )}
              </div>
              
              {/* Project Activity */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Time & Expense Tracking</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <ClockIcon size={20} className="text-primary mr-2" />
                      <h4 className="font-medium">Time Tracked</h4>
                    </div>
                    <p className="text-2xl font-bold">{getProjectHours(selectedProject.id).toFixed(1)} hours</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      Value: {formatCurrency(getProjectHours(selectedProject.id) * selectedProject.hourlyRate)}
                    </p>
                  </div>
                  
                  <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <DollarSignIcon size={20} className="text-secondary mr-2" />
                      <h4 className="font-medium">Expenses</h4>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(getProjectExpenseTotal(selectedProject.id))}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      {getProjectExpenses(selectedProject.id).length} expense entries
                    </p>
                  </div>
                </div>
                
                {/* Recent Time Entries */}
                <h4 className="font-medium mb-3">Recent Time Entries</h4>
                {getProjectTimeEntries(selectedProject.id).length > 0 ? (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Billable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                        {getProjectTimeEntries(selectedProject.id).slice(0, 5).map(entry => (
                          <tr key={entry.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                            <td className="px-4 py-3 text-sm">
                              {formatDate(entry.startTime)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {entry.description}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {(entry.duration / 3600).toFixed(1)} hrs
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {entry.billable ? 'Yes' : 'No'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-surface-500 dark:text-surface-400 py-4 mb-6">No time entries recorded yet</p>
                )}
                
                {/* Recent Expenses */}
                <h4 className="font-medium mb-3">Recent Expenses</h4>
                {getProjectExpenses(selectedProject.id).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                        {getProjectExpenses(selectedProject.id).slice(0, 5).map(expense => (
                          <tr key={expense.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                            <td className="px-4 py-3 text-sm">
                              {formatDate(expense.date)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {expense.category}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {expense.description}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {formatCurrency(expense.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-surface-500 dark:text-surface-400 py-4">No expenses recorded yet</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Edit Project Form Modal */}
          {showEditForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Edit Project</h3>
                    <button onClick={() => setShowEditForm(false)} className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
                      <XIcon size={20} />
                    </button>
                  </div>
                  <ProjectForm 
                    initialData={selectedProject}
                    clients={clients}
                    onSubmit={updateProject}
                    onCancel={() => setShowEditForm(false)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Milestone Form Modal */}
          {showMilestoneForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
                    </h3>
                    <button onClick={() => {
                      setShowMilestoneForm(false);
                      setEditingMilestone(null);
                    }} className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
                      <XIcon size={20} />
                    </button>
                  </div>
                  <MilestoneForm 
                    initialData={editingMilestone}
                    onSubmit={editingMilestone ? updateMilestone : addMilestone}
                    onCancel={() => {
                      setShowMilestoneForm(false);
                      setEditingMilestone(null);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        // Projects List View
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Projects</h1>
              <p className="text-surface-600 dark:text-surface-400">Manage your project portfolio</p>
            </div>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="btn btn-primary mt-4 md:mt-0"
            >
              <FolderPlusIcon size={18} className="mr-2" />
              Create New Project
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-surface-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="select mr-2"
              >
                <option value="">All Clients</option>
                {clients.filter(c => c.status === 'active').map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => setProjectFilter('all')}
                  className={`px-3 py-2 rounded-lg ${
                    projectFilter === 'all' 
                      ? 'bg-primary text-white' 
                      : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setProjectFilter('active')}
                  className={`px-3 py-2 rounded-lg ${
                    projectFilter === 'active' 
                      ? 'bg-primary text-white' 
                      : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setProjectFilter('on_hold')}
                  className={`px-3 py-2 rounded-lg ${
                    projectFilter === 'on_hold' 
                      ? 'bg-primary text-white' 
                      : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  On Hold
                </button>
                <button 
                  onClick={() => setProjectFilter('completed')}
                  className={`px-3 py-2 rounded-lg ${
                    projectFilter === 'completed' 
                      ? 'bg-primary text-white' 
                      : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
          
          {/* Budget Alerts */}
          {budgetAlerts.length > 0 && (
            <div className="mb-6">
              <div className="card bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700">
                <div className="flex items-start">
                  <AlertTriangleIcon size={24} className="text-amber-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Budget Alerts</h3>
                    <div className="space-y-2">
                      {budgetAlerts.map(alert => (
                        <div key={alert.id} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{alert.name}:</span> {' '}
                            <span className={alert.type === 'exceeded' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                              {formatCurrency(alert.budgetUsed)} / {formatCurrency(alert.budgetTotal)}
                              {' '}({Math.round((alert.budgetUsed / alert.budgetTotal) * 100)}%)
                            </span>
                          </div>
                          <button 
                            onClick={() => setSelectedProject(projects.find(p => p.id === alert.id))}
                            className="text-sm text-primary hover:text-primary-dark"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => {
                const client = getProjectClient(project.id);
                const budgetStatus = getBudgetStatus(project);
                const progress = calculateProgress(project);
                
                return (
                  <div key={project.id} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          project.status === 'on_hold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          <FolderIcon size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-surface-500 dark:text-surface-400">
                            {client ? client.name : 'No client'}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : project.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                      }`}>
                        {project.status === 'active' ? 'Active' : 
                         project.status === 'completed' ? 'Completed' : 'On Hold'}
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-surface-500 dark:text-surface-400">Progress</span>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Budget */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-surface-500 dark:text-surface-400">Budget</span>
                        <span className={`text-sm font-medium ${
                          budgetStatus === 'exceeded' ? 'text-red-600 dark:text-red-400' :
                          budgetStatus === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {formatCurrency(calculateBudgetUsed(project))} / {formatCurrency(project.budget.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            budgetStatus === 'exceeded' ? 'bg-red-500' :
                            budgetStatus === 'warning' ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, (calculateBudgetUsed(project) / project.budget.amount) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col items-center p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <div className="flex items-center mb-1">
                          <ClockIcon size={14} className="text-primary mr-1" />
                          <span className="text-sm">Hours</span>
                        </div>
                        <span className="text-lg font-semibold">{getProjectHours(project.id).toFixed(1)}</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <div className="flex items-center mb-1">
                          <MilestoneIcon size={14} className="text-secondary mr-1" />
                          <span className="text-sm">Milestones</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {project.milestones ? project.milestones.filter(m => m.status === 'completed').length : 0}/{project.milestones ? project.milestones.length : 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedProject(project)} 
                        className="btn btn-outline flex-1"
                      >
                        <EyeIcon size={16} className="mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setShowEditForm(true);
                        }} 
                        className="btn btn-outline flex-1"
                      >
                        <EditIcon size={16} className="mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full">
                <div className="card py-12 text-center">
                  <FolderIcon size={48} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                  <p className="text-surface-500 dark:text-surface-400 mb-6">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"`
                      : projectFilter !== 'all' 
                        ? `No ${projectFilter.replace('_', ' ')} projects found` 
                        : clientFilter
                          ? "No projects for the selected client"
                          : "You haven't created any projects yet"
                    }
                  </p>
                  {!searchQuery && projectFilter === 'all' && !clientFilter && (
                    <button 
                      onClick={() => setShowAddForm(true)} 
                      className="btn btn-primary mx-auto"
                    >
                      <FolderPlusIcon size={18} className="mr-2" />
                      Create Your First Project
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Add Project Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Create New Project</h3>
                    <button onClick={() => setShowAddForm(false)} className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
                      <XIcon size={20} />
                    </button>
                  </div>
                  <ProjectForm 
                    clients={clients}
                    onSubmit={addProject}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 p-3 bg-red-100 dark:bg-red-900 rounded-full">
                      <TrashIcon size={24} className="text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Delete Project</h3>
                      <p className="text-surface-600 dark:text-surface-400">This action cannot be undone.</p>
                    </div>
                  </div>
                  <p className="mb-6">
                    Are you sure you want to delete <span className="font-semibold">{projectToDelete?.name}</span>?
                    All associated time entries and expenses will become unassociated.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={deleteProject} 
                      className="btn bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default Projects;