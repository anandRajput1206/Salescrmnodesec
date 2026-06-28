const XLSX = require('xlsx');

const meetings = [
  {
    Date: '2024-01-15',
    Customer: 'Tech Corp',
    'Discussion Summary': 'Initial meeting to discuss cybersecurity solutions for their enterprise',
    'Action Items': 'Send detailed proposal and pricing',
    Owner: 'Rahul Sharma',
    'Due Date': '2024-01-20'
  },
  {
    Date: '2024-01-22',
    Customer: 'Data Systems Inc',
    'Discussion Summary': 'Follow-up meeting on previous proposal discussion',
    'Action Items': 'Schedule product demo for next week',
    Owner: 'Rahul Sharma',
    'Due Date': '2024-01-25'
  },
  {
    Date: '2024-02-10',
    Customer: 'SecureNet',
    'Discussion Summary': 'Product demonstration and feature walkthrough',
    'Action Items': 'Provide competitive pricing analysis',
    Owner: 'Rahul Sharma',
    'Due Date': '2024-02-15'
  },
  {
    Date: '2024-02-18',
    Customer: 'CloudFirst Technologies',
    'Discussion Summary': 'Discovery call for cloud security needs',
    'Action Items': 'Prepare cloud security assessment',
    Owner: 'Rahul Sharma',
    'Due Date': '2024-02-22'
  },
  {
    Date: '2024-03-05',
    Customer: 'FinServe',
    'Discussion Summary': 'Quarterly business review and upsell discussion',
    'Action Items': 'Prepare renewal proposal',
    Owner: 'Rahul Sharma',
    'Due Date': '2024-03-10'
  }
];

const partners = [
  {
    'Partner Name': 'Cyber Solutions Alliance',
    Region: 'North',
    Zone: 'Zone A',
    Contact: 'john@cybersolutions.com',
    'Opportunity Count': 8,
    'Pipeline Value': 850000,
    Status: 'Active'
  },
  {
    'Partner Name': 'Secure Partners Network',
    Region: 'South',
    Zone: 'Zone B',
    Contact: 'jane@securepartners.com',
    'Opportunity Count': 5,
    'Pipeline Value': 520000,
    Status: 'Active'
  },
  {
    'Partner Name': 'TechGuard Resellers',
    Region: 'East',
    Zone: 'Zone C',
    Contact: 'mike@techguard.com',
    'Opportunity Count': 12,
    'Pipeline Value': 1200000,
    Status: 'Active'
  },
  {
    'Partner Name': 'DataShield Distributors',
    Region: 'West',
    Zone: 'Zone D',
    Contact: 'sarah@datashield.com',
    'Opportunity Count': 6,
    'Pipeline Value': 680000,
    Status: 'Active'
  }
];

const forecast = [
  {
    Month: 'January 2024',
    'Pipeline Value': 950000,
    'Weighted Pipeline': 475000,
    'Closed Won': 420000,
    Target: 500000
  },
  {
    Month: 'February 2024',
    'Pipeline Value': 1100000,
    'Weighted Pipeline': 550000,
    'Closed Won': 510000,
    Target: 550000
  },
  {
    Month: 'March 2024',
    'Pipeline Value': 1250000,
    'Weighted Pipeline': 625000,
    'Closed Won': 580000,
    Target: 600000
  },
  {
    Month: 'April 2024',
    'Pipeline Value': 1400000,
    'Weighted Pipeline': 700000,
    'Closed Won': 650000,
    Target: 650000
  },
  {
    Month: 'May 2024',
    'Pipeline Value': 1550000,
    'Weighted Pipeline': 775000,
    'Closed Won': 720000,
    Target: 700000
  }
];

const pipeline = [
  {
    'Opportunity ID': 'OP-001',
    'Customer Name': 'Tech Corp',
    Industry: 'Technology',
    Country: 'India',
    Region: 'North',
    Zone: 'Zone A',
    'Contact Person': 'John Smith',
    'Lead Source': 'Referral',
    'Opportunity Value': 250000,
    Stage: 'Proposal',
    Probability: 60,
    'Weighted Pipeline': 150000,
    'Expected Close Date': '2024-02-28',
    Competitor: 'Competitor A',
    'Next Action': 'Follow up on proposal',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open'
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
    'Opportunity Value': 180000,
    Stage: 'Demo',
    Probability: 40,
    'Weighted Pipeline': 72000,
    'Expected Close Date': '2024-03-15',
    Competitor: 'Competitor B',
    'Next Action': 'Schedule demo',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open'
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
    'Opportunity Value': 320000,
    Stage: 'POC',
    Probability: 50,
    'Weighted Pipeline': 160000,
    'Expected Close Date': '2024-04-30',
    Competitor: 'Competitor C',
    'Next Action': 'Complete POC',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open'
  },
  {
    'Opportunity ID': 'OP-004',
    'Customer Name': 'CloudFirst Technologies',
    Industry: 'Cloud Services',
    Country: 'India',
    Region: 'West',
    Zone: 'Zone D',
    'Contact Person': 'Alice Williams',
    'Lead Source': 'Website',
    'Opportunity Value': 200000,
    Stage: 'Negotiation',
    Probability: 80,
    'Weighted Pipeline': 160000,
    'Expected Close Date': '2024-03-20',
    Competitor: 'Competitor D',
    'Next Action': 'Finalize contract',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open'
  },
  {
    'Opportunity ID': 'OP-005',
    'Customer Name': 'FinServe',
    Industry: 'Banking',
    Country: 'India',
    Region: 'North',
    Zone: 'Zone A',
    'Contact Person': 'Charlie Brown',
    'Lead Source': 'Referral',
    'Opportunity Value': 400000,
    Stage: 'Proposal',
    Probability: 50,
    'Weighted Pipeline': 200000,
    'Expected Close Date': '2024-05-15',
    Competitor: 'Competitor E',
    'Next Action': 'Prepare renewal',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open'
  },
  {
    'Opportunity ID': 'OP-006',
    'Customer Name': 'HealthTech Solutions',
    Industry: 'Healthcare',
    Country: 'India',
    Region: 'South',
    Zone: 'Zone B',
    'Contact Person': 'Diana Prince',
    'Lead Source': 'Partner',
    'Opportunity Value': 280000,
    Stage: 'Demo',
    Probability: 45,
    'Weighted Pipeline': 126000,
    'Expected Close Date': '2024-04-10',
    Competitor: 'Competitor F',
    'Next Action': 'Technical review',
    'Sales Owner': 'Rahul Sharma',
    Status: 'Open'
  }
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(meetings), 'Meetings');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(partners), 'Partners');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(forecast), 'Forecast');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pipeline), 'Pipeline');
XLSX.writeFile(wb, 'excel example/CyberSecurity_Sales_Template_With_Validation.xlsx');
console.log('Sample Excel with comprehensive data generated!');
