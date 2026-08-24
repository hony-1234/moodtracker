export const isP1_3 = (cls: string): boolean => {
  if (!cls) return false;
  const grade = cls.charAt(0);
  return grade === '1' || grade === '2' || grade === '3';
};

export const getDefaultPass = (cls: string): string => {
  return cls.toLowerCase() + cls.toLowerCase();
};

export const getDefaultStudentPass = (cls: string, studentNo: string): string => {
  const c = cls.toUpperCase();
  if (isP1_3(c)) {
    return c.toLowerCase() + c.toLowerCase();
  } else {
    const paddedNo = String(studentNo).padStart(2, '0');
    return c.toLowerCase() + paddedNo;
  }
};

export const getDisplayDate = (item: any): string => {
  if (item._displayDate) return item._displayDate;
  
  const rawDate = item.日期 || item.timestamp;
  if (!rawDate) return "INVALID_DATE";
  if (typeof rawDate === 'object' && rawDate.seconds) {
    const d = new Date(rawDate.seconds * 1000);
    item._displayDate = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    return item._displayDate;
  }
  let strDate = String(rawDate).trim().split(' ')[0]; 
  
  // Try YYYY/MM/DD or YYYY-MM-DD
  const regexYMD = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
  const matchYMD = strDate.match(regexYMD);
  if (matchYMD) {
    const [_, y, m, d] = matchYMD;
    item._displayDate = `${y}/${parseInt(m, 10)}/${parseInt(d, 10)}`;
    return item._displayDate;
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const regexDMY = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
  const matchDMY = strDate.match(regexDMY);
  if (matchDMY) {
    const [_, d, m, y] = matchDMY;
    item._displayDate = `${y}/${parseInt(m, 10)}/${parseInt(d, 10)}`;
    return item._displayDate;
  }

  // Try YYYY年M月D日
  const regexCh = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/;
  const matchCh = strDate.match(regexCh);
  if (matchCh) {
    const [_, y, m, d] = matchCh;
    item._displayDate = `${y}/${parseInt(m, 10)}/${parseInt(d, 10)}`;
    return item._displayDate;
  }

  // General ISO or other parseable formats fallback (safety measure)
  try {
    const parsedTime = Date.parse(strDate.replace(/-/g, '/'));
    if (!isNaN(parsedTime)) {
      const d = new Date(parsedTime);
      if (d.getFullYear() > 1990 && d.getFullYear() < 2100) {
        item._displayDate = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
        return item._displayDate;
      }
    }
  } catch (e) {}

  return "INVALID_DATE";
};

export const parseDateString = (ds: string): number => {
  if (!ds || ds === "INVALID_DATE") return 0;
  const regex = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
  const match = ds.match(regex);
  if (match) {
    const [_, y, m, d] = match;
    const time = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)).getTime();
    return isNaN(time) ? 0 : time;
  }
  return 0;
};

export const getUnixTime = (item: any): number => {
  if (item._unixTime) return item._unixTime;
  if (item.timestamp?.toDate) {
     item._unixTime = item.timestamp.toDate().getTime();
     return item._unixTime;
  }
  item._unixTime = parseDateString(getDisplayDate(item));
  return item._unixTime;
};

export const formatDateObj = (date: Date): string => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};
