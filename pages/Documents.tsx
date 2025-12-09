
import React, { useState } from 'react';
import { DOCUMENTS } from '../services/mockDatabase';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { DocumentItem } from '../types';

const Documents: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const filteredDocs = filter === 'All' ? DOCUMENTS : DOCUMENTS.filter(d => d.category === filter);

  // Helper to generate realistic placeholder text based on document type
  const getDocumentContent = (title: string, category: string): string => {
    const lowerTitle = title.toLowerCase();

    if (category === 'Policy' || lowerTitle.includes('handbook') || lowerTitle.includes('code of conduct')) {
      return `
1. PURPOSE
The purpose of this ${title} is to establish guidelines and procedures for CAPACITI employees. This ensures a consistent, fair, and productive work environment aligned with our organizational values.

2. SCOPE
This policy applies to all full-time, part-time, and temporary employees, as well as contractors and interns currently engaged with CAPACITI.

3. POLICY STATEMENT
CAPACITI is committed to maintaining a workplace that is free from harassment and discrimination. All employees are expected to uphold our core values of integrity, innovation, and respect. We prioritize a safe, inclusive, and professional atmosphere for everyone.

4. RESPONSIBILITIES
- Managers: Ensure team compliance, provide necessary training, and address concerns immediately.
- Employees: Read, understand, and adhere to the guidelines outlined herein.
- HR Department: Review and update this policy annually to ensure legal compliance.

5. NON-COMPLIANCE
Violations of this policy may result in disciplinary action, up to and including termination of employment, depending on the severity of the infraction.
      `;
    }

    if (category === 'Template' || lowerTitle.includes('form') || lowerTitle.includes('request')) {
      return `
${title.toUpperCase()}

SECTION A: EMPLOYEE INFORMATION
Name: __________________________
Employee ID: ___________________
Department: ____________________
Date of Submission: ____________

SECTION B: DETAILS
Description of Request/Submission:
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

SECTION C: JUSTIFICATION
Reason for Request:
_________________________________________________________________________
_________________________________________________________________________

SECTION D: APPROVAL
Manager Name: __________________   Signature: _____________________
HR Approval: ___________________   Date: __________________________
      `;
    }

    if (category === 'Guide' || lowerTitle.includes('setup')) {
      return `
INTRODUCTION
Welcome to the ${title}. This guide is designed to help you navigate the process efficiently and effectively, ensuring you have the tools needed to succeed.

PREREQUISITES
Before starting, ensure you have:
- Active CAPACITI account credentials.
- Secure network connection (VPN if remote).
- Necessary hardware/software installed.

STEP-BY-STEP INSTRUCTIONS
Step 1: Initial Configuration
Log in to the portal using your provided credentials. Navigate to the settings menu located in the top-right corner.

Step 2: Execution
Follow the on-screen prompts. Ensure all mandatory fields marked with an asterisk (*) are completed. If you encounter error code 404, refresh the page.

Step 3: Verification
Confirm that all settings have been saved. You should see a green checkmark indicating success.

TROUBLESHOOTING
For additional support, please submit an IT Ticket via the Digital Forms portal or contact the Help Desk at support@capaciti.org.za.
      `;
    }

    if (category === 'Report' || lowerTitle.includes('summary')) {
      return `
EXECUTIVE SUMMARY
This document presents the ${title}. Overall performance has been strong, with key milestones achieved ahead of schedule.

KEY METRICS
- Total Candidates Placed: 142
- Retention Rate: 94%
- Average Technical Score: 87%
- Candidate Satisfaction: 4.8/5

ANALYSIS
The data indicates a positive trend in skill acquisition across the latest cohorts. The FNB Tech Academy cohort, in particular, has shown exceptional growth in technical assessments. Soft skill development remains a priority for the upcoming quarter.

RECOMMENDATIONS
1. Continue the current mentorship program structure.
2. Increase focus on soft skills workshops in Q4.
3. Review software licensing costs for optimization.

CONCLUSION
We are on track to meet our annual KPIs. Continued collaboration between Training and Operations teams is essential for sustained success.
      `;
    }

    return `
${title.toUpperCase()}

This document serves as a placeholder for the verified file content.
Generated on: ${new Date().toLocaleDateString()}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
    `;
  };

  const handleDownload = (doc: DocumentItem) => {
    const content = getDocumentContent(doc.title, doc.category);

    if (doc.fileType === 'PDF') {
      // Generate a PDF on the fly
      const pdf = new jsPDF();
      
      // Header
      pdf.setFillColor(37, 99, 235); // Blue-600
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text("CAPACITI Talent Hub", 15, 20);
      
      // Title
      pdf.setTextColor(33, 33, 33);
      pdf.setFontSize(16);
      pdf.text(doc.title, 15, 50);
      
      // Metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Category: ${doc.category}`, 15, 60);
      pdf.text(`Uploaded: ${doc.uploadDate}`, 15, 65);
      
      // Content
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(11);
      
      // Split text to fit page
      const splitText = pdf.splitTextToSize(content, 180);
      pdf.text(splitText, 15, 80);
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("Generated by CAPACITI Intelligent Talent Hub", 15, 280);
      
      pdf.save(`${doc.title}.pdf`);
    } else {
      // Create a dummy text file for DOCX/XLSX/Other
      const element = document.createElement("a");
      const fileContent = `Document: ${doc.title}\nCategory: ${doc.category}\nDate: ${doc.uploadDate}\n\n----------------------------\n\n${content}`;
      
      const file = new Blob([fileContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${doc.title}.txt`;
      document.body.appendChild(element); 
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Document Library</h2>
          <p className="text-slate-500">Access policies, templates, and guides.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Policy', 'Template', 'Guide', 'Report'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Document Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Date Uploaded</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${doc.fileType === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {doc.fileType === 'PDF' ? <FileText size={20} /> : <FileSpreadsheet size={20} />}
                    </div>
                    <span className="font-medium text-slate-900">{doc.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                    {doc.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{doc.uploadDate}</td>
                <td className="px-6 py-4 text-slate-500">{doc.size}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDownload(doc)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                  >
                    <Download size={14} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Documents;
