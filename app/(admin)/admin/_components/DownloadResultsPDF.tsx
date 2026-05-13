"use client";

import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Attempt {
  displayName: string;
  email: string;
  designation: string;
  score: number;
  passed: boolean;
  completed_at: string;
}

export default function DownloadResultsPDF({ 
  attempts, 
  courseTitle 
}: { 
  attempts: Attempt[], 
  courseTitle: string 
}) {
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(102, 45, 145); // Rebus Purple
    doc.text(`Course Results: ${courseTitle}`, 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Table Data mapping
    const tableRows = attempts.map(a => [
      a.displayName,
      a.email,
      a.designation,
      `${a.score}%`,
      a.passed ? "PASSED" : "UNSUCCESSFUL",
      new Date(a.completed_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Employee Name", "Email", "Designation", "Score", "Status", "Date"]],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [102, 45, 145] },
      styles: { fontSize: 8 }
    });

    doc.save(`${courseTitle.replace(/\s+/g, '_')}_Results.pdf`);
  };

  return (
    <button
      onClick={downloadPDF}
      className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors text-slate-600 shadow-sm"
    >
      <Download size={16} /> Download PDF
    </button>
  );
}