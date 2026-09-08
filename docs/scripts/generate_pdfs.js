const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function markdownToStyledHtml(title, mdContent) {
  let html = mdContent
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-gray-900 border-b pb-3 mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-800 border-b pb-2 mt-6 mb-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-800 mt-4 mb-2">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-gray-700 mt-3 mb-1">$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-800">$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono text-sm border border-gray-200">$1</code>')
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-gray-700 my-1">$1</li>')
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-gray-700 my-1">$1</li>');

  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        continue;
      }
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) {
        inTable = true;
        tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-200 divide-y divide-gray-200 text-sm"><thead><tr class="bg-gray-50">';
        cells.forEach((cell) => {
          tableHtml += `<th class="px-3 py-2 text-left font-bold text-gray-700 uppercase tracking-wider">${cell.trim()}</th>`;
        });
        tableHtml += '</tr></thead><tbody class="divide-y divide-gray-200 bg-white">';
      } else {
        tableHtml += '<tr>';
        cells.forEach((cell) => {
          tableHtml += `<td class="px-3 py-2 text-gray-700">${cell.trim()}</td>`;
        });
        tableHtml += '</tr>';
      }
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table></div>';
        processedLines.push(tableHtml);
      }
      processedLines.push(line);
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table></div>';
    processedLines.push(tableHtml);
  }

  html = processedLines
    .map((line) => {
      if (line.startsWith('<h') || line.startsWith('<li') || line.startsWith('<div') || line.startsWith('<table') || line.startsWith('<tr') || line.startsWith('<th') || line.startsWith('<td') || line === '') {
        return line;
      }
      return `<p class="text-gray-700 leading-relaxed my-2.5">${line}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { font-size: 10.5pt; padding: 0; }
      @page { margin: 15mm 15mm; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    table { page-break-inside: avoid; }
    h1, h2, h3 { page-break-after: avoid; }
  </style>
</head>
<body class="bg-white text-gray-900 p-8 max-w-4xl mx-auto">
  <div class="print-container">
    ${html}
  </div>
</body>
</html>`;
}

async function main() {
  const docsDir = path.resolve(__dirname, '..');
  const researchMdPath = path.join(docsDir, 'Research_Note.md');
  const designMdPath = path.join(docsDir, 'Design_Note.md');

  const researchContent = fs.readFileSync(researchMdPath, 'utf-8');
  const designContent = fs.readFileSync(designMdPath, 'utf-8');

  const researchHtml = markdownToStyledHtml('Research Note - LLD Practice Platform', researchContent);
  const designHtml = markdownToStyledHtml('Design Note - LLD Practice Platform', designContent);

  const researchHtmlPath = path.join(docsDir, 'Research_Note.html');
  const designHtmlPath = path.join(docsDir, 'Design_Note.html');
  const researchPdfPath = path.join(docsDir, 'Research_Note.pdf');
  const designPdfPath = path.join(docsDir, 'Design_Note.pdf');

  fs.writeFileSync(researchHtmlPath, researchHtml);
  fs.writeFileSync(designHtmlPath, designHtml);

  console.log('✅ Generated HTML documentation:');
  console.log(` - ${researchHtmlPath}`);
  console.log(` - ${designHtmlPath}`);

  // Try converting to PDF via Edge/Chrome
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(edgePath)) {
    try {
      console.log('\n📄 Generating PDF files via Microsoft Edge...');
      execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${researchPdfPath}" "${researchHtmlPath}"`);
      execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${designPdfPath}" "${designHtmlPath}"`);
      console.log('✅ Successfully created PDFs:');
      console.log(` - ${researchPdfPath}`);
      console.log(` - ${designPdfPath}`);
    } catch (e) {
      console.warn('PDF printing error:', e.message);
    }
  }
}

main().catch(console.error);
