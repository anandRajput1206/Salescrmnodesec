import * as XLSX from 'xlsx'

// Generate sample data for testing
const meetingsData = [
  {
    Date: '2024-01-15',
    Customer: 'Tech Corp',
    'Discussion Summary': 'Discussed cybersecurity solutions',
    'Action Items': 'Send proposal',
    Owner: 'Rahul Sharma',
    'Due Date': '2024-01-20',
  },
  {
    Date: '2024-01-22',
    Customer: 'Data Systems Inc',
    'Discussion Summary': 'Follow up on previous meeting',
    'Action Items': 'Schedule demo',
    Owner: 'Rahul Sharma',
    'Due Date': '2024-01-25',
  },
  {
    Date: '2024-02-10',
    Customer: 'SecureNet',
    'Discussion Summary': 'Product demo',
    'Action Items': 'Provide pricing',
    Owner: 'Rahul Sharma',
    'Due Date': '2024-02-15',
  },
]

const partnersData = [
  {
    'Partner Name': 'Cyber Solutions',
    Region: 'North',
    Zone: 'Zone A',
    Contact: 'john@cybersolutions.com',
    'Opportunity Count': 5,
    'Pipeline Value': 500000,
    Status: 'Active',
  },
  {
    'Partner Name': 'Secure Partners',
    Region: 'South',
    Zone: 'Zone B',
    Contact: 'jane@securepartners.com',
    'Opportunity Count': 3,
    'Pipeline Value': 300000,
    Status: 'Active',
  },
]

const forecastData = [
  {
    Month: 'January 2024',
    'Pipeline Value': 800000,
    'Weighted Pipeline': 400000,
    'Closed Won': 350000,
    Target: 500000,
  },
  {
    Month: 'February 2024',
    'Pipeline Value': 900000,
    'Weighted Pipeline': 450000,
    'Closed Won': 420000,
    Target: 550000,
  },
  {
    Month: 'March 2024',
    'Pipeline Value': 1000000,
    'Weighted Pipeline': 500000,
    'Closed Won': 480000,
    Target: 600000,
  },
]

const pipelineData = [
  {
    'Opportunity ID': 'OP-001',
    'Customer Name': 'Tech Corp',
    Industry: 'Technology',
    Country: 'India',
    Region: 'North',
    Zone: 'Zone A',
    'Contact Person': 'John Smith',
    'Lead Source': 'Referral',
    'Opportunity Value': 200000,
    Stage: 'Proposal',
    Probability: 60,
    'Weighted Pipeline': 120000,
    'Expected Close Date': '2024-02-28',
    Competitor: 'Other Vendor',
    'Next Action': 'Follow up',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open',
  },
  {
    'Opportunity ID': 'OP-002',
    'Customer Name': 'Data Systems Inc',
    Industry: 'Finance',
    Country: 'India',
    Region: 'South',
    Zone: 'Zone B',
    'Contact Person': 'Jane Doe',
    'Lead Source': 'Cold Call',
    'Opportunity Value': 150000,
    Stage: 'Demo',
    Probability: 40,
    'Weighted Pipeline': 60000,
    'Expected Close Date': '2024-03-15',
    Competitor: 'Competitor A',
    'Next Action': 'Schedule demo',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open',
  },
  {
    'Opportunity ID': 'OP-003',
    'Customer Name': 'SecureNet',
    Industry: 'Healthcare',
    Country: 'India',
    Region: 'East',
    Zone: 'Zone C',
    'Contact Person': 'Bob Johnson',
    'Lead Source': 'Partner',
    'Opportunity Value': 300000,
    Stage: 'POC',
    Probability: 50,
    'Weighted Pipeline': 150000,
    'Expected Close Date': '2024-04-30',
    Competitor: 'Competitor B',
    'Next Action': 'Complete POC',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open',
  },
]

// Create workbook
const workbook = XLSX.utils.book_new()

// Add sheets
const meetingsSheet = XLSX.utils.json_to_sheet(meetingsData)
XLSX.utils.book_append_sheet(workbook, meetingsSheet, 'Meetings')

const partnersSheet = XLSX.utils.json_to_sheet(partnersData)
XLSX.utils.book_append_sheet(workbook, partnersSheet, 'Partners')

const forecastSheet = XLSX.utils.json_to_sheet(forecastData)
XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Forecast')

const pipelineSheet = XLSX.utils.json_to_sheet(pipelineData)
XLSX.utils.book_append_sheet(workbook, pipelineSheet, 'Pipeline')

// Write file
XLSX.writeFile(workbook, 'excel example/CyberSecurity_Sales_Template_With_Validation.xlsx')
console.log('Sample Excel file generated successfully!')
