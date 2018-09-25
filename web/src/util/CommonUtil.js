
export const isoDate2LocaleDate = (isodate) => {
  if (!isodate) return null;
  return (new Date(isodate));
}



export const isoDate2LocaleString = (isodate) => {
  if (!isodate) return null;
  const date = new Date(isodate);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}


