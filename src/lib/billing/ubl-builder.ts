/**
 * UBL-TR 1.2 Fatura XML Oluşturucu
 *
 * Fatura bilgilerinden entegratöre gönderilebilecek UBL-TR formatında XML üretir.
 */

interface UBLInvoiceParams {
  // Fatura
  invoiceNo: string;
  invoiceDate: string; // YYYY-MM-DD
  invoiceTime?: string; // HH:mm:ss
  invoiceType: "SATIS" | "IADE";
  invoiceProfile: "TICARIFATURA" | "TEMELFATURA" | "EARSIVFATURA";
  guid: string;
  currencyCode?: string;

  // Satıcı
  sellerName: string;
  sellerTaxNumber: string;
  sellerTaxOffice?: string;
  sellerAddress?: string;
  sellerCity?: string;
  sellerDistrict?: string;

  // Alıcı
  buyerName: string;
  buyerTaxNumber?: string;
  buyerTaxOffice?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerDistrict?: string;
  buyerEmail?: string;

  // Kalemler
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    taxRate: number; // yüzde, ör: 20
  }[];

  // Notlar
  notes?: string[];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildUBLInvoice(params: UBLInvoiceParams): string {
  const {
    invoiceNo,
    invoiceDate,
    invoiceTime = "00:00:00",
    invoiceType,
    invoiceProfile,
    guid,
    currencyCode = "TRY",
    sellerName,
    sellerTaxNumber,
    sellerTaxOffice,
    sellerAddress,
    sellerCity,
    sellerDistrict,
    buyerName,
    buyerTaxNumber,
    buyerTaxOffice,
    buyerAddress,
    buyerCity,
    buyerDistrict,
    items,
    notes,
  } = params;

  // Kalem hesaplamaları
  const lineItems = items.map((item, idx) => {
    const lineTotal = item.quantity * item.unitPrice;
    const taxAmount = (lineTotal * item.taxRate) / 100;
    return { ...item, idx: idx + 1, lineTotal, taxAmount };
  });

  const subtotal = lineItems.reduce((s, l) => s + l.lineTotal, 0);
  const totalTax = lineItems.reduce((s, l) => s + l.taxAmount, 0);
  const grandTotal = subtotal + totalTax;

  const invoiceTypeCode = invoiceType === "IADE" ? "IADE" : "SATIS";

  const notesXml = (notes || [])
    .map((n) => `<cbc:Note>${escapeXml(n)}</cbc:Note>`)
    .join("\n  ");

  const linesXml = lineItems
    .map(
      (l) => `
  <cac:InvoiceLine>
    <cbc:ID>${l.idx}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${l.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currencyCode}">${l.lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${currencyCode}">${l.taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currencyCode}">${l.lineTotal.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currencyCode}">${l.taxAmount.toFixed(2)}</cbc:TaxAmount>
        <cbc:Percent>${l.taxRate}</cbc:Percent>
        <cac:TaxCategory>
          <cac:TaxScheme>
            <cbc:Name>KDV</cbc:Name>
            <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escapeXml(l.name)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${currencyCode}">${l.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`
    )
    .join("\n");

  // Alıcı VKN/TCKN — bireysel (TC 11 hane) vs kurumsal (VKN 10 hane)
  const isBuyerTCKN = !buyerTaxNumber || buyerTaxNumber.length === 11;
  const buyerIdNumber = buyerTaxNumber || "11111111111";
  const buyerSchemeID = isBuyerTCKN ? "TCKN" : "VKN";

  // TCKN durumunda Person elemanı zorunlu
  const nameParts = buyerName.trim().split(/\s+/);
  const buyerFirstName = nameParts.slice(0, -1).join(" ") || buyerName;
  const buyerFamilyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : buyerName;

  const buyerPersonXml = isBuyerTCKN
    ? `<cac:Person>
          <cbc:FirstName>${escapeXml(buyerFirstName)}</cbc:FirstName>
          <cbc:FamilyName>${escapeXml(buyerFamilyName)}</cbc:FamilyName>
        </cac:Person>`
    : "";

  // Satıcı VKN/TCKN ayrımı
  const isSellerTCKN = sellerTaxNumber.length === 11;
  const sellerSchemeID = isSellerTCKN ? "TCKN" : "VKN";
  const sellerNameParts = sellerName.trim().split(/\s+/);
  const sellerPersonXml = isSellerTCKN
    ? `<cac:Person>
          <cbc:FirstName>${escapeXml(sellerNameParts.slice(0, -1).join(" ") || sellerName)}</cbc:FirstName>
          <cbc:FamilyName>${escapeXml(sellerNameParts.length > 1 ? sellerNameParts[sellerNameParts.length - 1] : sellerName)}</cbc:FamilyName>
        </cac:Person>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>${invoiceProfile}</cbc:ProfileID>
  <cbc:ID>${escapeXml(invoiceNo)}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${guid}</cbc:UUID>
  <cbc:IssueDate>${invoiceDate}</cbc:IssueDate>
  <cbc:IssueTime>${invoiceTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>${invoiceTypeCode}</cbc:InvoiceTypeCode>
  ${notesXml}
  <cbc:DocumentCurrencyCode>${currencyCode}</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${lineItems.length}</cbc:LineCountNumeric>
  ${invoiceProfile === "EARSIVFATURA" ? `<cac:AdditionalDocumentReference>
    <cbc:ID>ELEKTRONIK</cbc:ID>
    <cbc:IssueDate>${invoiceDate}</cbc:IssueDate>
    <cbc:DocumentTypeCode>SEND_TYPE</cbc:DocumentTypeCode>
  </cac:AdditionalDocumentReference>` : ""}
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${sellerSchemeID}">${sellerTaxNumber}</cbc:ID>
      </cac:PartyIdentification>
      ${!isSellerTCKN ? `<cac:PartyName>
        <cbc:Name>${escapeXml(sellerName)}</cbc:Name>
      </cac:PartyName>` : ""}
      <cac:PostalAddress>
        ${sellerAddress ? `<cbc:StreetName>${escapeXml(sellerAddress)}</cbc:StreetName>` : "<cbc:StreetName>.</cbc:StreetName>"}
        ${sellerDistrict ? `<cbc:CitySubdivisionName>${escapeXml(sellerDistrict)}</cbc:CitySubdivisionName>` : "<cbc:CitySubdivisionName>.</cbc:CitySubdivisionName>"}
        ${sellerCity ? `<cbc:CityName>${escapeXml(sellerCity)}</cbc:CityName>` : "<cbc:CityName>.</cbc:CityName>"}
        <cac:Country><cbc:Name>Türkiye</cbc:Name></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:Name>${sellerTaxOffice ? escapeXml(sellerTaxOffice) : "Bilinmiyor"}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      ${sellerPersonXml}
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${buyerSchemeID}">${buyerIdNumber}</cbc:ID>
      </cac:PartyIdentification>
      ${!isBuyerTCKN ? `<cac:PartyName>
        <cbc:Name>${escapeXml(buyerName)}</cbc:Name>
      </cac:PartyName>` : ""}
      <cac:PostalAddress>
        ${buyerAddress ? `<cbc:StreetName>${escapeXml(buyerAddress)}</cbc:StreetName>` : "<cbc:StreetName>.</cbc:StreetName>"}
        ${buyerDistrict ? `<cbc:CitySubdivisionName>${escapeXml(buyerDistrict)}</cbc:CitySubdivisionName>` : "<cbc:CitySubdivisionName>.</cbc:CitySubdivisionName>"}
        ${buyerCity ? `<cbc:CityName>${escapeXml(buyerCity)}</cbc:CityName>` : "<cbc:CityName>.</cbc:CityName>"}
        <cac:Country><cbc:Name>Türkiye</cbc:Name></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:Name>${buyerTaxOffice ? escapeXml(buyerTaxOffice) : "Bilinmiyor"}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      ${buyerPersonXml}
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currencyCode}">${totalTax.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currencyCode}">${subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currencyCode}">${totalTax.toFixed(2)}</cbc:TaxAmount>
      <cbc:Percent>${lineItems[0]?.taxRate || 20}</cbc:Percent>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currencyCode}">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currencyCode}">${subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currencyCode}">${grandTotal.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currencyCode}">${grandTotal.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${linesXml}
</Invoice>`;
}
