const getDisplayDate = (rawDate) => {
  if (!rawDate) return "未知日期";
  let strDate = String(rawDate).trim().split(' ')[0]; 
  const sep = strDate.includes('/') ? '/' : (strDate.includes('-') ? '-' : null);
  
  if (sep) {
    const parts = strDate.split(sep);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD or YYYY-MM-DD
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      } else {
        // DD/MM/YYYY or DD-MM-YY
        let year = parts[2];
        if (year.length === 2 && parseInt(year) > 20) {
          year = '20' + year;
        } else if (year.length === 2) {
          year = '20' + year;
        } else if (year.length === 3) {
           return strDate; // fallback
        }
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${year}`;
      }
    }
  }
  return strDate;
};
console.log("05/06/2026 ->", getDisplayDate("05/06/2026"));
console.log("2026/06/05 ->", getDisplayDate("2026/06/05"));
console.log("05/06/26 ->", getDisplayDate("05/06/26"));
console.log("21/05/2026 ->", getDisplayDate("21/05/2026"));
