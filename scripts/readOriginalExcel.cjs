const XLSX = require('xlsx');

const filePath = 'excel example/CyberSecurity_Sales_Template_With_Validation_original.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('Sheet names:', workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n=== Sheet: ${sheetName} ===`);
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    if (jsonData.length > 0) {
      console.log('Headers:', jsonData[0]);
      console.log('Sample row:', jsonData[1]);
      console.log('Total rows:', jsonData.length);
    }
  });
} catch (error) {
  console.error('Error reading file:', error.message);
}
