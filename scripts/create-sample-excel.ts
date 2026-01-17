import xlsx from 'xlsx';
import * as path from 'path';

// Sample data for Excel file
const sampleData = [
  {
    Name: 'John Doe',
    email: 'john.doe@example.com',
    'job title': 'Software Engineer',
    phone: '+1234567890',
    country: 'USA',
  },
  {
    Name: 'Jane Smith',
    email: 'jane.smith@example.com',
    'job title': 'Product Manager',
    phone: '+1234567891',
    country: 'Canada',
  },
  {
    Name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    'job title': 'Data Analyst',
    phone: '+1234567892',
    country: 'USA',
  },
  {
    Name: 'Alice Williams',
    email: 'alice.williams@example.com',
    'job title': 'UX Designer',
    phone: '+1234567893',
    country: 'Canada',
  },
  {
    Name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    'job title': 'DevOps Engineer',
    phone: '+1234567894',
    country: 'UK',
  },
  {
    Name: 'Diana Prince',
    email: 'diana.prince@example.com',
    'job title': 'Marketing Manager',
    phone: '+1234567895',
    country: 'USA',
  },
  {
    Name: 'Eve Adams',
    email: 'eve.adams@example.com',
    'job title': '', // Empty job title
    phone: '', // Empty phone
    country: '', // Empty country
  },
  {
    Name: 'Frank Miller',
    email: 'frank.miller@example.com',
    'job title': 'QA Engineer',
    phone: '+1234567897',
    country: 'UK',
  },
];

// Create workbook and worksheet
const worksheet = xlsx.utils.json_to_sheet(sampleData);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Applicants');

// Write to file
const outputPath = path.join(process.cwd(), 'sheets', 'sample-applicants.xlsx');
xlsx.writeFile(workbook, outputPath);

console.log(`✓ Sample Excel file created at: ${outputPath}`);
console.log(`✓ Contains ${sampleData.length} sample applicants`);
