/**
 * generatePDF.ts
 * Pure jsPDF report generator — no html2canvas needed.
 * Builds a clean, structured A4 PDF entirely from data.
 */

import type { HealthSummaryData } from "@/components/HealthSummary";
import type { HistoryEntry } from "@/lib/history";

export interface ReportPatient {
  name?: string;
  age?: number | string;
  relation?: string;
}

export interface PDFReportOptions {
  patient?: ReportPatient;
  summary?: HealthSummaryData | null;
  history: HistoryEntry[];
  filename?: string;
}

function severityColor(sev?: string): [number, number, number] {
  const s = (sev || "").toLowerCase().trim();
  if (s === "green" || s === "low" || s === "self-care") return [16, 185, 129];  // emerald-500
  if (s === "red"   || s === "high" || s === "emergency") return [239, 68, 68];  // red-500
  return [245, 158, 11]; // amber-500 = yellow/medium
}

function severityLabel(sev?: string): string {
  const s = (sev || "").toLowerCase().trim();
  if (s === "green" || s === "low" || s === "self-care") return "Self-Care (Low Risk)";
  if (s === "red"   || s === "high" || s === "emergency") return "Emergency (High Risk)";
  return "See a Doctor (Moderate Risk)";
}

function wrapText(
  doc: import("jspdf").jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export async function generateHealthPDF(opts: PDFReportOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const MARGIN = 15;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const LINE_H = 6;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let y = MARGIN;

  // Header bar — solid blue-500
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, PAGE_W, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Sahayak Health", MARGIN, 11);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Powered Health Report", MARGIN, 17);

  doc.setFontSize(8);
  doc.text(`Generated: ${dateStr}`, PAGE_W - MARGIN, 17, { align: "right" });

  y = 36;

  // Patient info block
  const patient = opts.patient || {};
  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(229, 231, 235);
  doc.rect(MARGIN, y, CONTENT_W, patient.relation ? 20 : 16, "FD");

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PATIENT INFORMATION", MARGIN + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  const patientName = patient.name ?? "User";
  const ageStr = patient.age ? `${patient.age} years` : "—";

  doc.text(`Name: ${patientName}`, MARGIN + 4, y + 12);
  doc.text(`Age: ${ageStr}`, MARGIN + 80, y + 12);

  if (patient.relation) {
    doc.text(`Relation: ${patient.relation}`, MARGIN + 4, y + 18);
  }

  y += (patient.relation ? 20 : 16) + 8;

  // Health Summary section
  if (opts.summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text("HEALTH SUMMARY", MARGIN, y);
    y += 1;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y + 1, PAGE_W - MARGIN, y + 1);
    y += 6;

    const sevColor = severityColor(opts.summary.severity);
    doc.setFillColor(...sevColor);
    doc.rect(MARGIN, y, 60, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(
      `Severity: ${severityLabel(opts.summary.severity)}`,
      MARGIN + 3,
      y + 5.5
    );
    y += 13;

    const summaryFields = [
      { label: "Primary Symptom",    value: opts.summary.primary_symptom },
      { label: "Possible Causes",    value: opts.summary.possible_causes },
      { label: "Recommended Action", value: opts.summary.recommended_action },
    ];

    for (const field of summaryFields) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(field.label.toUpperCase(), MARGIN, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      y = wrapText(doc, field.value || "—", MARGIN, y, CONTENT_W, LINE_H);
      y += 4;
    }

    y += 4;
  }

  // History table
  if (opts.history.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = MARGIN;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text("CONSULTATION HISTORY", MARGIN, y);
    y += 1;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y + 1, PAGE_W - MARGIN, y + 1);
    y += 7;

    const colDate   = MARGIN;
    const colQuery  = MARGIN + 34;
    const colSev    = MARGIN + 148;
    const ROW_H     = 8;

    doc.setFillColor(59, 130, 246);
    doc.rect(MARGIN, y, CONTENT_W, ROW_H, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Date & Time", colDate + 1, y + 5.5);
    doc.text("Symptom Query", colQuery + 1, y + 5.5);
    doc.text("Severity", colSev + 1, y + 5.5);
    y += ROW_H;

    let alternate = false;
    for (const entry of opts.history) {
      doc.setFontSize(8);
      const queryLines = doc.splitTextToSize(entry.symptom_query, 108);
      const rowH = Math.max(ROW_H, queryLines.length * 5 + 4);

      if (y + rowH > 280) {
        doc.addPage();
        y = MARGIN;

        doc.setFillColor(59, 130, 246);
        doc.rect(MARGIN, y, CONTENT_W, ROW_H, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Date & Time", colDate + 1, y + 5.5);
        doc.text("Symptom Query", colQuery + 1, y + 5.5);
        doc.text("Severity", colSev + 1, y + 5.5);
        y += ROW_H;
      }

      doc.setFillColor(alternate ? 245 : 255, alternate ? 245 : 255, alternate ? 245 : 255);
      doc.rect(MARGIN, y, CONTENT_W, rowH, "F");

      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.rect(MARGIN, y, CONTENT_W, rowH);

      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const d = new Date(entry.date);
      const dStr = isNaN(d.getTime())
        ? entry.date
        : d.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
      doc.text(dStr, colDate + 1, y + 5);

      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(queryLines, colQuery + 1, y + 5);

      const [r, g, b] = severityColor(entry.severity);
      doc.setTextColor(r, g, b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      const sLabel = (entry.severity || "").toLowerCase();
      const displaySev =
        sLabel === "green" ? "Low" :
        sLabel === "red" ? "High" : "Medium";
      doc.text(displaySev, colSev + 1, y + 5);

      y += rowH;
      alternate = !alternate;
    }

    y += 6;
  }

  // Footer
  const footerY = 285;
  doc.setFillColor(243, 244, 246);
  doc.rect(0, footerY - 2, PAGE_W, 15, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(0, footerY - 2, PAGE_W, footerY - 2);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "AI-generated report for informational purposes only. Not a medical diagnosis.",
    PAGE_W / 2,
    footerY + 3,
    { align: "center" }
  );
  doc.text(
    "Consult a qualified healthcare professional for medical advice.",
    PAGE_W / 2,
    footerY + 8,
    { align: "center" }
  );

  const fileName =
    opts.filename ??
    `sahayak-health-report-${patientName.replace(/\s+/g, "-").toLowerCase()}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.pdf`;

  doc.save(fileName);
}
