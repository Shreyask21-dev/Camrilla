import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import db from "@/lib/db";
function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d)) return date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export async function POST(req) {
  
  const data = await req.json();
  console.log("Incoming Invoice Payload:", JSON.stringify(data, null, 2));

  try {
  const [invoiceResult] = await db.execute(
  `INSERT INTO invoices (
    invoice_id, client, salesperson, date_issued, due_date,
    notes, total, message, client_company, client_address,
    client_phone, client_email, bank_name, iban, swift, user_id,
    subtotal, discount, tax
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    data.invoiceId ?? null,
    data.client ?? null,
    data.salesPerson ?? null,
    data.dateIssued ?? null,
    data.dueDate ?? null,
    data.invoiceMsg ?? "",
    parseFloat(data.total) || 0,
    "Generated via UI",
    data.clientCompany ?? null,
    data.clientAddress ?? null,
    data.clientPhone ?? null,
    data.clientEmail ?? null,
    data.bankName ?? null,
    data.iban ?? null,
    data.swift ?? null,
    data.userId ?? null,
    parseFloat(data.subtotal) || 0,
    parseFloat(data.discount) || 0,
    parseFloat(data.tax) || 0,
  ]
);

    const invoiceDbId = invoiceResult.insertId;

    const itemRows = data.items
      .map(
        (item) => `
          <tr>
            <td class="text-nowrap text-heading">${item.name}</td>
            <td class="text-nowrap">${item.description}</td>
            <td>${item.cost}</td>
            <td>${item.qty}</td>
            <td>${(item.qty * item.cost).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    for (const item of data.items) {
      await db.execute(
        `INSERT INTO invoice_items (invoice_id, name, description, qty, cost)
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceDbId, item.name, item.description, item.qty, item.cost]
      );
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .invoice-header h2 { margin: 0; }
    .section { margin-bottom: 30px; }
    .section h4 { margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
    .table-borderless td { border: none; padding: 4px 10px; }
    .totals td { font-weight: bold; }
    .text-end { text-align: right; }
  </style>
</head>
<body>
  <div class="invoice-header d-flex justify-content-between flex-row">
    <div>
      <h2>Camrilla</h2>
       <p class="mb-1">Office 149, 450 South Brand Brooklyn</p>
          <p class="mb-1">San Diego County, CA 91905, USA</p>
          <p class="mb-0">+1 (123) 456 7891, +44 (876) 543 2198</p>
    </div>
    <div>
      <h4 class=mb-6>Invoice #${data.invoiceId}</h4>
      <div class="mb-1">
            <span>Date Issues:</span>
            <span>${formatDate(data.dateIssued)}</span>
          </div>
          <div>
            <span>Date Due:</span>
            <span>${formatDate(data.dueDate)}</span>
          </div>
        </div>
    </div>
  </div>
 <hr class="my-6" />
  <div class="section">
    <div style="display: flex; justify-content: space-between">
      <div>
          <h4>Invoice To:</h4>
        
         <p class="mb-0">${data.client}</p>
<p class="mb-0">${data.clientCompany}</p>
<p class="mb-0">${data.clientAddress}</p>
<p class="mb-0">${data.clientPhone}</p>
<p class="mb-0">${data.clientEmail}</p>

        </div>
      <div>
        <h4>Bill To:</h4>
        <table class="table-borderless">
          <tr><td>Total Due:</td><td>₹${data.total}</td></tr>
          <tr><td>Bank name:</td><td>${data.bankName}</td></tr>
<tr><td>Country:</td><td>${data.bankCountry || "—"}</td></tr>
<tr><td>IBAN:</td><td>${data.iban}</td></tr>
<tr><td>SWIFT code:</td><td>${data.swift}</td></tr>

        </table>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th>Cost</th>
        <th>Qty</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="table-responsive">
        <table class="table m-0 table-borderless">
          <tbody>
            <tr>
              <td class="align-top px-0 py-6">
                <p class="mb-1">
                  <span class="me-2 fw-medium text-heading">Salesperson:</span>
                  <span>${data.salesPerson}</span>
                </p>
                <span>Thanks for your business</span>
              </td>
              <td class="px-0 py-6 w-px-100">
                <p class="mb-1">Subtotal:</p>
                <p class="mb-1">Discount:</p>
                <p class="mb-1 border-bottom pb-2">GST 18%:</p>
                <p class="mb-0 pt-2">Total:</p>
              </td>
              <td class="text-end px-0 py-6 w-px-100">
                <p class="fw-medium mb-1">₹${data.subtotal.toFixed(2)}</p>
<p class="fw-medium mb-1">${((data.subtotal * data.discount) / 100).toFixed(
      2
    )}</p>
<p class="fw-medium mb-1 border-bottom pb-2">${data.tax.toFixed(2)}</p>
<p class="fw-medium mb-0 pt-2">₹${data.total.toFixed(2)}</p>

              </td>
            </tr>
          </tbody>
        </table>
      </div>
         <hr class="mt-0 mb-6" />
      <div class="row">
        <div class="col-12">
          <span class="fw-medium text-heading">Note:</span>
         <span>${data.invoiceMsg || "Thank you for your business."}</span>

        </div>
      </div>
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${data.invoiceId}.pdf`,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("id");
  const userId = url.searchParams.get("userId");

  // Return invoices for a specific user
  if (userId) {
    const [invoices] = await db.execute(
      "SELECT * FROM invoices WHERE user_id = ?",
      [userId]
    );
    return NextResponse.json(invoices);
  }

  // Return single invoice PDF by ID
  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
  }

  try {
    // Fetch invoice
    const [[invoice]] = await db.execute(
      "SELECT * FROM invoices WHERE id = ?",
      [invoiceId]
    );
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Fetch items
    const [items] = await db.execute(
      "SELECT * FROM invoice_items WHERE invoice_id = ?",
      [invoiceId]
    );

    // Build item rows
    const itemRowsHtml = items
      .map(
        (item) => `
      <tr>
        <td class="text-nowrap text-heading">${item.name}</td>
        <td class="text-nowrap">${item.description}</td>
        <td>${item.cost}</td>
        <td>${item.qty}</td>
        <td>${(item.qty * item.cost).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    // Generate full HTML
    const html = generateInvoiceHTML(invoice, itemRowsHtml);

    // Render PDF
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${invoice.invoice_id}.pdf`,
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function generateInvoiceHTML(data, itemRowsHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .invoice-header h2 { margin: 0; }
    .section { margin-bottom: 30px; }
    .section h4 { margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
    .table-borderless td { border: none; padding: 4px 10px; }
    .totals td { font-weight: bold; }
    .text-end { text-align: right; }
  </style>
</head>
<body>
  <div class="invoice-header d-flex justify-content-between flex-row">
    <div>
      <h2>Camrilla</h2>
      <p class="mb-1">Office 149, 450 South Brand Brooklyn</p>
      <p class="mb-1">San Diego County, CA 91905, USA</p>
      <p class="mb-0">+1 (123) 456 7891, +44 (876) 543 2198</p>
    </div>
    <div>
      <h4 class=mb-6>Invoice #${data.invoice_id || data.invoiceId}</h4>
      <div class="mb-1">
        <span>Date Issued:</span>
       <span>${formatDate(data.date_issued || data.dateIssued)}</span>

      </div>
      <div>
        <span>Date Due:</span>
        <span>${formatDate(data.due_date || data.dueDate)}</span>
      </div>
    </div>
  </div>

  <hr class="my-6" />
  <div class="section">
    <div style="display: flex; justify-content: space-between">
      <div>
        <h4>Invoice To:</h4>
        <p class="mb-0">${data.client}</p>
        <p class="mb-0">${data.clientCompany || data.client_company}</p>
        <p class="mb-0">${data.clientAddress || data.client_address}</p>
        <p class="mb-0">${data.clientPhone || data.client_phone}</p>
        <p class="mb-0">${data.clientEmail || data.client_email}</p>
      </div>
      <div>
        <h4>Bill To:</h4>
        <table class="table-borderless">
          <tr><td>Total Due:</td><td>₹${data.total}</td></tr>
          <tr><td>Bank name:</td><td>${
            data.bankName || data.bank_name
          }</td></tr>
          <tr><td>Country:</td><td>${data.bankCountry || "—"}</td></tr>
          <tr><td>IBAN:</td><td>${data.iban}</td></tr>
          <tr><td>SWIFT code:</td><td>${data.swift}</td></tr>
        </table>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th>Cost</th>
        <th>Qty</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>${itemRowsHtml}</tbody>
  </table>

  <div class="table-responsive">
    <table class="table m-0 table-borderless">
      <tbody>
        <tr>
          <td class="align-top px-0 py-6">
            <p class="mb-1">
              <span class="me-2 fw-medium text-heading">Salesperson:</span>
              <span>${data.salesPerson || data.salesperson}</span>
            </p>
            <span>Thanks for your business</span>
          </td>
          <td class="px-0 py-6 w-px-100">
            <p class="mb-1">Subtotal:</p>
            <p class="mb-1">Discount:</p>
            <p class="mb-1 border-bottom pb-2">GST 18%:</p>
            <p class="mb-0 pt-2">Total:</p>
          </td>
          <td class="text-end px-0 py-6 w-px-100">
            <p class="fw-medium mb-1">₹${Number(data.subtotal).toFixed(2)}</p>
            <p class="fw-medium mb-1">${(
              (data.subtotal * data.discount) /
              100
            ).toFixed(2)}</p>
            <p class="fw-medium mb-1 border-bottom pb-2">${Number(
              data.tax
            ).toFixed(2)}</p>
            <p class="fw-medium mb-0 pt-2">₹${Number(data.total).toFixed(2)}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <hr class="mt-0 mb-6" />
  <div class="row">
    <div class="col-12">
      <span class="fw-medium text-heading">Note:</span>
      <span>${
        data.invoiceMsg || data.message || "Thank you for your business."
      }</span>
    </div>
  </div>
</body>
</html>`;
}
