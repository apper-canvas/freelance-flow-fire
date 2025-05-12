import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { toast } from 'react-toastify'; 
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { Download, FileText, Filter, PieChart, BarChart, LineChart, Calendar, DollarSign, Clock, Users, Briefcase } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('financial');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subMonths(startOfMonth(new Date()), 5),
    end: endOfMonth(new Date())
  });
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [customReport, setCustomReport] = useState({
    title: 'Custom Report',
    metrics: ['revenue', 'expenses', 'profit'],
    groupBy: 'month',
    includeCharts: true
  });

  // Get data from Redux store
  const clients = useSelector(state => state.clients);
  const projects = useSelector(state => state.projects);
  const timeEntries = useSelector(state => state.timeEntries);
  const invoices = useSelector(state => state.invoices);
  const expenses = useSelector(state => state.expenses);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter data based on date range
  const filterByDateRange = (items, dateField) => {
    return items.filter(item => {
      const itemDate = parseISO(item[dateField]);
      return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
    });
  };

  // Helper to filter by client and project
  const filterByClientAndProject = (items) => {
    return items.filter(item => {
      const clientMatch = selectedClient === 'all' || item.clientId === selectedClient;
      const projectMatch = selectedProject === 'all' || item.projectId === selectedProject;
      return clientMatch && projectMatch;
    });
  };

  // Calculate financial metrics
  const calculateFinancialMetrics = () => {
    const filteredInvoices = filterByDateRange(invoices, 'issueDate');
    const filteredExpenses = filterByDateRange(expenses, 'date');
    
    const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Calculate month-by-month data for charts
    const monthlyData = Array(6).fill().map((_, i) => {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = parseISO(invoice.issueDate);
        return isWithinInterval(invoiceDate, { start: monthStart, end: monthEnd });
      });
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
      });
      
      const revenue = monthInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const expense = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        revenue,
        expenses: expense,
        profit: revenue - expense
      };
    }).reverse();
    
    return {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
      monthlyData
    };
  };

  // Calculate time utilization metrics
  const calculateTimeUtilization = () => {
    const filteredTimeEntries = filterByDateRange(filterByClientAndProject(timeEntries), 'startTime');
    
    const totalHours = filteredTimeEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
    const billableHours = filteredTimeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.duration / 3600), 0);
    const nonBillableHours = totalHours - billableHours;
    const billablePercentage = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
    
    // Prepare data for client breakdown
    const clientBreakdown = clients.map(client => {
      const clientEntries = filteredTimeEntries.filter(entry => entry.clientId === client.id);
      const clientHours = clientEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
      return {
        name: client.name,
        hours: clientHours
      };
    }).filter(client => client.hours > 0);
    
    // Prepare data for project breakdown
    const projectBreakdown = projects.map(project => {
      const projectEntries = filteredTimeEntries.filter(entry => entry.projectId === project.id);
      const projectHours = projectEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
      return {
        name: project.name,
        hours: projectHours
      };
    }).filter(project => project.hours > 0);
    
    return {
      totalHours,
      billableHours,
      nonBillableHours,
      billablePercentage,
      clientBreakdown,
      projectBreakdown
    };
  };

  // Calculate profitability metrics
  const calculateProfitability = () => {
    const filteredInvoices = filterByDateRange(invoices, 'issueDate');
    const filteredExpenses = filterByDateRange(expenses, 'date');
    const filteredTimeEntries = filterByDateRange(timeEntries, 'startTime');
    
    // Client profitability
    const clientProfitability = clients.map(client => {
      const clientInvoices = filteredInvoices.filter(invoice => invoice.clientId === client.id);
      const clientExpenses = filteredExpenses.filter(expense => expense.clientId === client.id);
      const clientTimeEntries = filteredTimeEntries.filter(entry => entry.clientId === client.id);
      
      const revenue = clientInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const expenses = clientExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const hours = clientTimeEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
      const profit = revenue - expenses;
      const hourlyRate = hours > 0 ? revenue / hours : 0;
      
      return {
        id: client.id,
        name: client.name,
        revenue,
        expenses,
        profit,
        hours,
        hourlyRate
      };
    }).filter(client => client.revenue > 0 || client.expenses > 0);
    
    // Project profitability
    const projectProfitability = projects.map(project => {
      const clientInvoices = filteredInvoices.filter(invoice => 
        invoice.projectIds && invoice.projectIds.includes(project.id)
      );
      const projectExpenses = filteredExpenses.filter(expense => expense.projectId === project.id);
      const projectTimeEntries = filteredTimeEntries.filter(entry => entry.projectId === project.id);
      
      const revenue = clientInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const expenses = projectExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const hours = projectTimeEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
      const profit = revenue - expenses;
      const hourlyRate = hours > 0 ? revenue / hours : 0;
      
      return {
        id: project.id,
        name: project.name,
        revenue,
        expenses,
        profit,
        hours,
        hourlyRate
      };
    }).filter(project => project.revenue > 0 || project.expenses > 0);
    
    return {
      clientProfitability,
      projectProfitability
    };
  };

  // Financial chart options and series
  const financialChartOptions = {
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: calculateFinancialMetrics().monthlyData.map(d => d.month),
    },
    yaxis: {
      title: {
        text: 'Amount ($)'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$" + val.toFixed(2)
        }
      }
    }
  };
  
  const financialChartSeries = [
    {
      name: 'Revenue',
      data: calculateFinancialMetrics().monthlyData.map(d => d.revenue)
    },
    {
      name: 'Expenses',
      data: calculateFinancialMetrics().monthlyData.map(d => d.expenses)
    },
    {
      name: 'Profit',
      data: calculateFinancialMetrics().monthlyData.map(d => d.profit)
    }
  ];

  // Time utilization chart options
  const timeUtilizationChartOptions = {
    chart: {
      type: 'pie',
    },
    labels: ['Billable', 'Non-Billable'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    colors: ['#5856D6', '#38B2AC']
  };
  
  const timeUtilizationChartSeries = [
    calculateTimeUtilization().billableHours,
    calculateTimeUtilization().nonBillableHours
  ];

  // Client breakdown chart
  const clientChartOptions = {
    chart: {
      type: 'donut',
    },
    labels: calculateTimeUtilization().clientBreakdown.map(c => c.name),
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };
  
  const clientChartSeries = calculateTimeUtilization().clientBreakdown.map(c => c.hours);

  // Handle report generation
  const generateReport = () => {  
    // Create a report object based on the active tab
    let reportData = {};
    let reportTitle = '';
    
    if (activeTab === 'financial') {
      const financialMetrics = calculateFinancialMetrics();
      reportData = {
        title: 'Financial Report',
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: format(dateRange.start, 'yyyy-MM-dd'),
          to: format(dateRange.end, 'yyyy-MM-dd')
        },
        summary: {
          totalRevenue: financialMetrics.totalRevenue,
          totalExpenses: financialMetrics.totalExpenses,
          profit: financialMetrics.profit,
          profitMargin: financialMetrics.profitMargin
        },
        monthlyData: financialMetrics.monthlyData
      };
      reportTitle = 'Financial_Report';
    } else if (activeTab === 'time') {
      const timeMetrics = calculateTimeUtilization();
      reportData = {
        title: 'Time Utilization Report',
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: format(dateRange.start, 'yyyy-MM-dd'),
          to: format(dateRange.end, 'yyyy-MM-dd')
        },
        summary: {
          totalHours: timeMetrics.totalHours,
          billableHours: timeMetrics.billableHours,
          nonBillableHours: timeMetrics.nonBillableHours,
          billablePercentage: timeMetrics.billablePercentage
        },
        clientBreakdown: timeMetrics.clientBreakdown,
        projectBreakdown: timeMetrics.projectBreakdown
      };
      reportTitle = 'Time_Utilization_Report';
    } else if (activeTab === 'profitability') {
      reportData = calculateProfitability();
      reportTitle = 'Profitability_Report';
    } else if (activeTab === 'custom') {
      reportData = customReport;
      reportTitle = 'Custom_Report';
    }
    
    // Create a JSON string and convert to Blob
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    toast.success('Report generated successfully!', {
      icon: '📊'
    });
  };

  // Handle report export
  const exportReport = (format) => {
    toast.success(`Report exported as ${format.toUpperCase()} successfully!`, {
      icon: "📁"
    });
  };

  // Handle custom report generation
  const handleGenerateCustomReport = () => {
    setShowFilterModal(false);
    toast.success('Custom report created successfully!', {
      icon: "✨"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-surface-500 dark:text-surface-400">
            Analyze your business performance and generate custom reports
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => setShowFilterModal(true)}
            className="btn btn-outline flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button
            onClick={generateReport}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'financial'
                ? 'border-primary text-primary'
                : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign size={16} />
              <span>Financial Reports</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'time'
                ? 'border-primary text-primary'
                : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>Time Utilization</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('profitability')}
            className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'profitability'
                ? 'border-primary text-primary'
                : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart size={16} />
              <span>Profitability</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-primary text-primary'
                : 'border-transparent text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <PieChart size={16} />
              <span>Custom Reports</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Financial Reports */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Total Revenue</h3>
                    <p className="dashboard-number text-primary">${calculateFinancialMetrics().totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="text-primary" size={24} />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Total Expenses</h3>
                    <p className="dashboard-number text-secondary">${calculateFinancialMetrics().totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <DollarSign className="text-secondary" size={24} />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Net Profit</h3>
                    <p className="dashboard-number text-accent">${calculateFinancialMetrics().profit.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <DollarSign className="text-accent" size={24} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Financial Overview (6 Months)</h3>
              <Chart
                options={financialChartOptions}
                series={financialChartSeries}
                type="bar"
                height={350}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export as PDF</span>
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export as Excel</span>
              </button>
            </div>
          </div>
        )}

        {/* Time Utilization */}
        {activeTab === 'time' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Total Hours</h3>
                    <p className="dashboard-number">{calculateTimeUtilization().totalHours.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="text-primary" size={24} />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Billable Hours</h3>
                    <p className="dashboard-number text-primary">{calculateTimeUtilization().billableHours.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="text-primary" size={24} />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Billable Percentage</h3>
                    <p className="dashboard-number text-secondary">{calculateTimeUtilization().billablePercentage.toFixed(2)}%</p>
                  </div>
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <PieChart className="text-secondary" size={24} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Billable vs Non-Billable</h3>
                <Chart
                  options={timeUtilizationChartOptions}
                  series={timeUtilizationChartSeries}
                  type="pie"
                  height={300}
                />
              </div>
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Time by Client</h3>
                <Chart
                  options={clientChartOptions}
                  series={clientChartSeries}
                  type="donut"
                  height={300}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;