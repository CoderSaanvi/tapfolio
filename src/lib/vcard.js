export function buildVCard(p, cardUrl) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${p.lastName};${p.firstName};;;`,
    `FN:${p.firstName} ${p.lastName}`,
    `ORG:${p.school.name};Biomedical Engineering`,
    `TITLE:${p.title}`,
    `TEL;TYPE=CELL:${p.contact.phone}`,
    `EMAIL;TYPE=INTERNET:${p.contact.email}`,
    `URL:${cardUrl}`,
    `URL:${p.contact.linkedin}`,
    `NOTE:Met via tap card. Live portfolio: ${cardUrl}`,
    "END:VCARD",
  ].join("\r\n");
}

export function formatPhone(e164) {
  const d = e164.replace(/\D/g, "").slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : e164;
}
