import { graphql, } from 'react-apollo';
import gql from "graphql-tag";

import { MUT_LOCAL_LOGINED_USER, } from './GQLLocal';
import { MUT_LOCAL_SEARCH_STATUS, } from './GQLLocal';
// import { MUT_SWITCH_BLOCK, } from './GQLMutation';
// import { MUT_LOCAL_IMAGE_BASE64, MUT_LOCAL_IMAGE_BASE64COPY, MUT_LOCAL_IMAGE_SELECTEDWORD } from './GQLLocal';
// import { MUT_LOCAL_IMAGE_BASE64, MUT_LOCAL_IMAGE_BASE64COPY, } from './GQLLocal';
// import { genGQLMutImageLocalFiled } from './GQLLocal';

const _ = require('lodash');

export const withMutLocalLoginedUser = () => {
  return graphql(MUT_LOCAL_LOGINED_USER, {
    name: `updateLoginedUser`,
  });
}

// export const withMutImageBase64 = () => {
//   return graphql(MUT_LOCAL_IMAGE_BASE64, {
//     name: `updateImageBase64`,
//   });
// }

// export const withMutImageBase64Copy = () => {
//   return graphql(MUT_LOCAL_IMAGE_BASE64COPY, {
//     name: `updateImageBase64Copy`,
//   });
// }

// export const withMutImageSelectedWord = () => {
//   return graphql(MUT_LOCAL_IMAGE_SELECTEDWORD, {
//     name: `updateImageSelectedWord`,
//   });
// }


export const withMutImageLocalField = (field, type = 'String') => {
  // console.log('withMutImageLocalField type: ',type);

  const str = `
    mutation UpdateImageLocalField($id:ID!, $${field}: ${type}!) {
      updateImageLocalField(id:$id, ${field}: $${field}) @client
    }
  `;
  return graphql(gql(str), {
    name: `updateImageLocal${_.upperFirst(field)}`,
  });
}

export const withMutLocalSearchStatus = () => {
  return graphql(MUT_LOCAL_SEARCH_STATUS, {
    name: `updateLocalSearchStatus`,
  });
}

// export const withMutSwitchBlock = () => {
//   return graphql(MUT_SWITCH_BLOCK, {
//     name: `switchBlock`,
//   });
// }

