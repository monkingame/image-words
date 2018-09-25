
export const isoDate2LocaleDate = (isodate) => {
  if (!isodate) return null;
  // const date = new Date(isodate);
  // console.log('convertISODate2Locale :', isodate, date);
  // return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  return (new Date(isodate));
}



export const isoDate2LocaleString = (isodate) => {
  if (!isodate) return null;
  const date = new Date(isodate);
  // console.log('convertISODate2Locale :', isodate, date);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}


