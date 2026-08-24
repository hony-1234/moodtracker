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

const parseDateString = (ds) => {
  if (!ds) return 0;
  let p;
  if (ds.includes('/')) {
    p = ds.split('/');
  } else if (ds.includes('-')) {
    p = ds.split('-');
  } else {
    return 0; // Not a recognized format
  }

  if (p.length !== 3) return 0;

  // Assuming DD/MM/YYYY or DD-MM-YY
  let day = p[0];
  let month = p[1];
  let year = p[2];

  // If year is just 2 digits (like '26'), assume 2026
  if (year.length === 2 && parseInt(year) > 20) {
    year = "20" + year;
  } else if (year.length === 2) {
    year = "20" + year;
  }
  
  // Basic validation that year is 4 digits
  if (year.length !== 4) return 0;

  const time = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).getTime();
  return isNaN(time) ? 0 : time;
};

console.log("parseDateString of 21/05/2026 =>", parseDateString("21/05/2026"));
console.log("parseDateString of 04/11/2026 =>", parseDateString("04/11/2026"));

