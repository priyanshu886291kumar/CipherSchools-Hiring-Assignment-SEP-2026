const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function renderMarkdownToHtml(title, mdContent) {
  const lines = mdContent.split('\n');
  let bodyHtml = '';
  let inCodeBlock = false;
  let codeBuffer = '';
  let inTable = false;
  let tableBuffer = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      bodyHtml += '</ul>\n';
      inUl = false;
    }
    if (inOl) {
      bodyHtml += '</ol>\n';
      inOl = false;
    }
  };

  const closeTable = () => {
    if (inTable) {
      bodyHtml += '<div class="table-container"><table>\n';
      tableBuffer.forEach((row, rIdx) => {
        const isHeader = rIdx === 0;
        const tag = isHeader ? 'th' : 'td';
        bodyHtml += '<tr>';
        row.forEach((cell) => {
          bodyHtml += `<${tag}>${inlineFormat(cell.trim())}</${tag}>`;
        });
        bodyHtml += '</tr>\n';
      });
      bodyHtml += '</table></div>\n';
      inTable = false;
      tableBuffer = [];
    }
  };

  const inlineFormat = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      closeLists();
      closeTable();
      if (inCodeBlock) {
        bodyHtml += `<pre><code>${codeBuffer.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>\n`;
        codeBuffer = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBuffer = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer += rawLine + '\n';
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeLists();
      if (trimmed.includes('---')) {
        continue;
      }
      const cells = trimmed.split('|').slice(1, -1);
      if (!inTable) {
        inTable = true;
        tableBuffer = [];
      }
      tableBuffer.push(cells);
      continue;
    } else {
      closeTable();
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      closeLists();
      bodyHtml += `<h1 class="doc-title">${inlineFormat(trimmed.substring(2))}</h1>\n`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeLists();
      bodyHtml += `<h2 class="section-title">${inlineFormat(trimmed.substring(3))}</h2>\n`;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      closeLists();
      bodyHtml += `<h3 class="subsection-title">${inlineFormat(trimmed.substring(4))}</h3>\n`;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      closeLists();
      bodyHtml += `<h4 class="sub-subsection-title">${inlineFormat(trimmed.substring(5))}</h4>\n`;
      continue;
    }

    // Horizontal rule
    if (trimmed === '---') {
      closeLists();
      bodyHtml += '<hr class="divider" />\n';
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      closeLists();
      bodyHtml += `<blockquote>${inlineFormat(trimmed.substring(2))}</blockquote>\n`;
      continue;
    }

    // Unordered lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inOl) closeLists();
      if (!inUl) {
        bodyHtml += '<ul>\n';
        inUl = true;
      }
      bodyHtml += `<li>${inlineFormat(trimmed.substring(2))}</li>\n`;
      continue;
    }

    // Ordered lists (match 1. 2. 3.)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inUl) closeLists();
      if (!inOl) {
        bodyHtml += '<ol>\n';
        inOl = true;
      }
      bodyHtml += `<li>${inlineFormat(olMatch[2])}</li>\n`;
      continue;
    }

    // Empty lines
    if (trimmed === '') {
      closeLists();
      continue;
    }

    // Regular paragraphs
    closeLists();
    bodyHtml += `<p>${inlineFormat(trimmed)}</p>\n`;
  }

  closeLists();
  closeTable();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      margin: 14mm 16mm;
      size: A4;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10.2pt;
      margin: 0;
      padding: 0;
    }
    .doc-title {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }
    .section-title {
      font-size: 13pt;
      font-weight: 700;
      color: #0f172a;
      margin: 18px 0 8px 0;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      page-break-after: avoid;
    }
    .subsection-title {
      font-size: 11.5pt;
      font-weight: 700;
      color: #1e293b;
      margin: 14px 0 6px 0;
      page-break-after: avoid;
    }
    .sub-subsection-title {
      font-size: 10.5pt;
      font-weight: 600;
      color: #334155;
      margin: 10px 0 4px 0;
      page-break-after: avoid;
    }
    p {
      margin: 6px 0 8px 0;
    }
    strong {
      color: #0f172a;
      font-weight: 600;
    }
    em {
      font-style: italic;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9pt;
      background-color: #f1f5f9;
      color: #0f766e;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    pre {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.8pt;
      line-height: 1.45;
      color: #0f172a;
      overflow-x: auto;
      margin: 8px 0 10px 0;
      page-break-inside: avoid;
    }
    pre code {
      background: none;
      border: none;
      padding: 0;
      color: inherit;
    }
    ul, ol {
      margin: 6px 0 8px 0;
      padding-left: 22px;
    }
    li {
      margin: 3px 0;
    }
    blockquote {
      margin: 8px 0;
      padding: 8px 14px;
      background-color: #f8fafc;
      border-left: 3.5px solid #0d9488;
      color: #334155;
      font-style: italic;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
    }
    .divider {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 14px 0;
    }
    .table-container {
      margin: 10px 0;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      background: #ffffff;
      border: 1px solid #cbd5e1;
    }
    th {
      background-color: #f8fafc;
      font-weight: 700;
      color: #0f172a;
      text-align: left;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    td {
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      color: #334155;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

async function main() {
  const docsDir = path.resolve(__dirname, '..');
  const researchMdPath = path.join(docsDir, 'Research_Note.md');
  const designMdPath = path.join(docsDir, 'Design_Note.md');

  const researchContent = fs.readFileSync(researchMdPath, 'utf-8');
  const designContent = fs.readFileSync(designMdPath, 'utf-8');

  const researchHtml = renderMarkdownToHtml('Research Note - LLD Practice Platform', researchContent);
  const designHtml = renderMarkdownToHtml('Design Note - LLD Practice Platform', designContent);

  const researchHtmlPath = path.join(docsDir, 'Research_Note.html');
  const designHtmlPath = path.join(docsDir, 'Design_Note.html');
  const researchPdfPath = path.join(docsDir, 'Research_Note.pdf');
  const designPdfPath = path.join(docsDir, 'Design_Note.pdf');

  fs.writeFileSync(researchHtmlPath, researchHtml);
  fs.writeFileSync(designHtmlPath, designHtml);

  console.log('✅ Generated HTML documentation:');
  console.log(` - ${researchHtmlPath}`);
  console.log(` - ${designHtmlPath}`);

  // Convert to clean PDF without browser header/footer
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(edgePath)) {
    try {
      console.log('\n📄 Generating Clean PDFs without browser headers...');
      execSync(`"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${researchPdfPath}" "${researchHtmlPath}"`);
      execSync(`"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${designPdfPath}" "${designHtmlPath}"`);
      console.log('✅ Successfully created clean PDFs:');
      console.log(` - ${researchPdfPath}`);
      console.log(` - ${designPdfPath}`);
    } catch (e) {
      console.warn('PDF printing error:', e.message);
    }
  }
}

main().catch(console.error);
