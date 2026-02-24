import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { TransactionWithCategory } from "@extinctbook/shared";

function formatINR(n: number) {
    return Math.abs(n).toLocaleString("en-IN");
}

function buildHTML(transactions: TransactionWithCategory[], summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}) {
    const rows = transactions.map((tx) => `
        <tr>
            <td>${new Date(tx.date).toLocaleDateString("en-IN")}</td>
            <td>${tx.category?.icon ?? ""} ${tx.category?.name ?? "Unknown"}</td>
            <td>${tx.type === "income" ? "In" : tx.type === "expense" ? "Out" : "Transfer"}</td>
            <td>${tx.paymentMode?.toUpperCase() ?? "CASH"}</td>
            <td>${tx.note ?? "—"}</td>
            <td style="text-align:right;font-weight:${tx.type === "income" ? "700" : "400"}">
                ${tx.type === "income" ? "+" : "-"}₹${formatINR(tx.amount)}
            </td>
        </tr>
    `).join("");

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, sans-serif; padding: 32px; color: #0a0a0a; }
  h1 { font-size: 28px; letter-spacing: -0.5px; margin-bottom: 4px; }
  .meta { color: #9a9a9a; font-size: 13px; margin-bottom: 32px; }
  .summary { display: flex; gap: 24px; margin-bottom: 32px; }
  .sum-box { flex: 1; border: 1.5px solid #e8e8e8; border-radius: 8px; padding: 16px; }
  .sum-label { font-size: 10px; letter-spacing: 1.4px; color: #9a9a9a; text-transform: uppercase; }
  .sum-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: #9a9a9a; padding: 8px 12px; border-bottom: 2px solid #0a0a0a; }
  td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 32px; font-size: 11px; color: #9a9a9a; text-align: center; }
</style>
</head>
<body>
  <h1>Extinctbook</h1>
  <p class="meta">Transaction Report &mdash; Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
  
  <div class="summary">
    <div class="sum-box">
      <div class="sum-label">Total Income</div>
      <div class="sum-value">+₹${formatINR(summary.totalIncome)}</div>
    </div>
    <div class="sum-box">
      <div class="sum-label">Total Spent</div>
      <div class="sum-value">-₹${formatINR(summary.totalExpense)}</div>
    </div>
    <div class="sum-box">
      <div class="sum-label">Net Balance</div>
      <div class="sum-value">₹${formatINR(summary.balance)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th><th>Category</th><th>Type</th><th>Mode</th><th>Note</th><th>Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  
  <div class="footer">Extinctbook &bull; Exported on ${new Date().toISOString()}</div>
</body>
</html>`;
}

export async function exportAsPDF(
    transactions: TransactionWithCategory[],
    summary: { totalIncome: number; totalExpense: number; balance: number }
) {
    const html = buildHTML(transactions, summary);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Extinctbook Report",
        UTI: "com.adobe.pdf",
    });
}

export function generateCSV(transactions: TransactionWithCategory[]): string {
    const header = "Date,Category,Type,Payment Mode,Note,Amount,Currency\n";
    const rows = transactions.map((tx) => {
        const cols = [
            new Date(tx.date).toLocaleDateString("en-IN"),
            `"${tx.category?.name ?? "Unknown"}"`,
            tx.type,
            tx.paymentMode ?? "cash",
            `"${(tx.note ?? "").replace(/"/g, "'")}"`,
            (tx.type === "income" ? "" : "-") + tx.amount,
            tx.currency,
        ];
        return cols.join(",");
    });
    return header + rows.join("\n");
}

export async function exportAsCSV(transactions: TransactionWithCategory[]) {
    const csv = generateCSV(transactions);
    // Write to a temp file then share
    const { uri } = await Print.printToFileAsync({
        html: `<pre>${csv}</pre>`,
        base64: false,
    });
    // Share as text; cross-platform sharing handles the rest
    const csvUri = uri.replace(".pdf", ".csv");
    await Sharing.shareAsync(uri, { dialogTitle: "Export as CSV", mimeType: "text/csv" });
}
