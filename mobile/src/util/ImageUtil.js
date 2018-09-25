
// export const stringifyImageSize = (width, height) => {
//   const size = {
//     width,
//     height,
//   };
//   return JSON.stringify(size);
// }

export const stringifyImageSize = (size) => {
  // size:{width:actialWidth,height:actualHeight,ratio}
  return JSON.stringify(size);
}


export const safeParseJSONString = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (ex) {
    return null;
  }
}


export const parseImageSizeString = (str) => {
  // if (!str) return null;
  // try {
  //   const size = JSON.parse(str);
  //   return size;
  // } catch (ex) {
  //   return null;
  // }
  return safeParseJSONString(str);
}

