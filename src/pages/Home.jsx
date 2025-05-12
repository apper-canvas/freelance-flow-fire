import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

function Home() {
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projectsForClient, setProjectsForClient] = useState([]);
  
  const dispatch = useDispatch();
  
  // Get data from store
  const clients = useSelector(state => state.clients);
  const projects = useSelector(state => state.projects);
  const timeEntries = useSelector(state => state.timeEntries);
  const invoices = useSelector(state => state.invoices);
  const user = useSelector(state => state.user);
  
  // Icons
  const PlayIcon = getIcon('Play');
  const PauseIcon = getIcon('Pause');
  const StopIcon = getIcon('Square');
  const ClockIcon = getIcon('Clock');
  const CheckCircleIcon = getIcon('CheckCircle');
  const AlertCircleIcon = getIcon('AlertCircle');
  const CalendarIcon = getIcon('Calendar');
  const DollarSignIcon = getIcon('DollarSign');
  const UsersIcon = getIcon('Users');
  const FolderIcon = getIcon('Folder');
  const FileTextIcon = getIcon('FileText');
  const TrendingUpIcon = getIcon('TrendingUp');
  
  // Format time display (HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Filter projects based on selected client
  useEffect(() => {
    if (selectedClient) {
      const filteredProjects = projects.filter(project => project.clientId === selectedClient);
      setProjectsForClient(filteredProjects);
      
      // If there are projects for this client, select the first one by default
      if (filteredProjects.length > 0 && !selectedProject) {
        setSelectedProject(filteredProjects[0].id);
      } else if (filteredProjects.length === 0) {
        setSelectedProject('');
      }
    } else {
      setProjectsForClient([]);
      setSelectedProject('');
    }
  }, [selectedClient, projects]);
  
  // Handle timer tick
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);
  
  // Start timer
  const startTimer = () => {
    if (!selectedClient || !selectedProject) {
      toast.warning("Please select a client and project first!");
      return;
    }
    
    if (!activeTimer) {
      // Create a new timer
      const newTimer = {
        id: Date.now().toString(),
        projectId: selectedProject,
        clientId: selectedClient,
        startTime: new Date().toISOString(),
        description: '',
        hourlyRate: projects.find(p => p.id === selectedProject)?.hourlyRate || user.defaultHourlyRate,
        billable: true
      };
      setActiveTimer(newTimer);
    }
    
    setTimerRunning(true);
    toast.success("Timer started!");
  };
  
  // Pause timer
  const pauseTimer = () => {
    setTimerRunning(false);
    toast.info("Timer paused");
  };
  
  // Stop and save timer
  const stopTimer = () => {
    if (!activeTimer) return;
    
    setTimerRunning(false);
    
    const client = clients.find(c => c.id === selectedClient);
    const project = projects.find(p => p.id === selectedProject);
    
    const timeEntry = {
      ...activeTimer,
      id: Date.now().toString(),
      endTime: new Date().toISOString(),
      duration: elapsedTime,
      description: `Work on ${project?.name || 'project'} for ${client?.name || 'client'}`
    };
    
    // Dispatch to store
    dispatch({ type: 'ADD_TIME_ENTRY', payload: timeEntry });
    
    toast.success("Time entry saved!");
    
    // Reset timer state
    setActiveTimer(null);
    setElapsedTime(0);
  };
  
  // Calculate statistics
  const hoursTrackedToday = timeEntries.reduce((total, entry) => {
    const entryDate = new Date(entry.startTime).toDateString();
    const today = new Date().toDateString();
    if (entryDate === today) {
      return total + entry.duration / 3600;
    }
    return total;
  }, 0);
  
  const totalUnpaidInvoices = invoices.filter(inv => inv.status === 'sent').reduce((total, inv) => total + inv.amount, 0);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user.name}</h1>
        <p className="text-surface-600 dark:text-surface-400">Manage your freelance business efficiently</p>
      </div>
      
      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div 
          className="card flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mr-4 p-3 bg-primary/10 rounded-lg">
            <ClockIcon size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-surface-600 dark:text-surface-400 text-sm">Today's Time</p>
            <p className="dashboard-number">{hoursTrackedToday.toFixed(1)}h</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="card flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mr-4 p-3 bg-secondary/10 rounded-lg">
            <DollarSignIcon size={24} className="text-secondary" />
          </div>
          <div>
            <p className="text-surface-600 dark:text-surface-400 text-sm">Unpaid Invoices</p>
            <p className="dashboard-number">${totalUnpaidInvoices}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="card flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mr-4 p-3 bg-accent/10 rounded-lg">
            <UsersIcon size={24} className="text-accent" />
          </div>
          <div>
            <p className="text-surface-600 dark:text-surface-400 text-sm">Active Clients</p>
            <p className="dashboard-number">{clients.filter(c => c.status === 'active').length}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="card flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mr-4 p-3 bg-primary/10 rounded-lg">
            <FolderIcon size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-surface-600 dark:text-surface-400 text-sm">Active Projects</p>
            <p className="dashboard-number">{projects.filter(p => p.status === 'active').length}</p>
          </div>
        </motion.div>
      </div>
      
      {/* Main Feature Component */}
      <MainFeature />
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Timer</h2>
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="select"
                disabled={timerRunning}
              >
                <option value="">Select Client</option>
                {clients.filter(c => c.status === 'active').map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="select"
                disabled={!selectedClient || timerRunning}
              >
                <option value="">Select Project</option>
                {projectsForClient.filter(p => p.status !== 'completed').map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <div className="text-3xl md:text-4xl font-mono font-bold tracking-wider">
                {formatTime(elapsedTime)}
              </div>
              {activeTimer && (
                <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                  {clients.find(c => c.id === activeTimer.clientId)?.name} - {projects.find(p => p.id === activeTimer.projectId)?.name}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {!timerRunning ? (
                <button 
                  onClick={startTimer}
                  className="btn btn-primary"
                  disabled={!selectedClient || !selectedProject}
                >
                  <PlayIcon size={18} className="mr-2" />
                  {activeTimer ? 'Resume' : 'Start Timer'}
                </button>
              ) : (
                <button 
                  onClick={pauseTimer}
                  className="btn bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <PauseIcon size={18} className="mr-2" />
                  Pause
                </button>
              )}
              
              {activeTimer && (
                <button 
                  onClick={stopTimer}
                  className="btn bg-rose-500 hover:bg-rose-600 text-white"
                >
                  <StopIcon size={18} className="mr-2" />
                  Stop & Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {timeEntries.slice(0, 5).map(entry => {
                  const client = clients.find(c => c.id === entry.clientId);
                  const project = projects.find(p => p.id === entry.projectId);
                  const date = new Date(entry.startTime).toLocaleDateString();
                  const duration = (entry.duration / 3600).toFixed(2);
                  
                  return (
                    <tr key={entry.id} className="hover:bg-surface-50 dark:hover:bg-surface-800">
                      <td className="px-4 py-3 text-sm">{date}</td>
                      <td className="px-4 py-3 text-sm">{client?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm">{project?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm">{entry.description}</td>
                      <td className="px-4 py-3 text-sm">{duration}h</td>
                    </tr>
                  );
                })}
                
                {timeEntries.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-surface-500 dark:text-surface-400">
                      No time entries yet. Start tracking your time!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;