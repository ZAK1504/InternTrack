// Test what pdf-parse v2 exports and test on a real PDF
const path = require('path');
const fs = require('fs');

async function testPdfParse() {
  console.log('\n--- Testing pdf-parse module ---');
  let pdfParse;
  try {
    pdfParse = require('pdf-parse');
    console.log('Type of export:', typeof pdfParse);
    if (typeof pdfParse === 'object') {
      console.log('Keys:', Object.keys(pdfParse));
    }
  } catch (e) {
    console.error('Failed to require pdf-parse:', e.message);
    return;
  }

  // Find any uploaded PDF to test with
  const uploadsDir = path.join(__dirname, 'uploads');
  let testFile = null;
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));
    if (files.length > 0) {
      testFile = path.join(uploadsDir, files[0]);
      console.log('\nTesting with file:', testFile);
    }
  }

  if (!testFile) {
    console.log('No PDF found in uploads/ to test with. Creating a simple test...');
    // Just test the function call works
    const fn = typeof pdfParse === 'function' ? pdfParse : pdfParse?.default || pdfParse?.PDFParse;
    console.log('Callable fn:', fn ? fn.name || 'anonymous' : 'NONE FOUND');
    return;
  }

  const buffer = fs.readFileSync(testFile);
  
  // Try calling as a function directly
  if (typeof pdfParse === 'function') {
    try {
      const result = await pdfParse(buffer);
      console.log('\n✅ pdfParse(buffer) worked!');
      console.log('Text length:', result.text?.length);
      console.log('First 300 chars:', result.text?.substring(0, 300));
    } catch (e) {
      console.error('❌ pdfParse(buffer) failed:', e.message);
    }
  }

  // Try as a class (new PDFParse)
  if (pdfParse?.PDFParse || pdfParse?.default?.PDFParse) {
    const PDFParse = pdfParse?.PDFParse || pdfParse?.default?.PDFParse;
    try {
      const instance = new PDFParse();
      const result = await instance.parse(buffer);
      console.log('\n✅ new PDFParse().parse(buffer) worked!');
      console.log('Text length:', result.text?.length);
    } catch (e) {
      console.error('❌ new PDFParse().parse(buffer) failed:', e.message);
    }
  }
}

testPdfParse().catch(console.error);
