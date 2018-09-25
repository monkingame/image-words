
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';
import { PAGI_IMAGE_LIMIT } from '../util/GlobalConst';

const _ = require('lodash');


export const refreshNewMoreImages = async (client) => {
  if (!client) return null;

  const { data } = await client.query({
    query: QUERY_MORE_IMAGES,
    variables: {
      offset: 0,
      limit: PAGI_IMAGE_LIMIT,
    },
    fetchPolicy: 'no-cache',
  });
  const { moreImages } = data;
  if (!moreImages || moreImages.length <= 0) return [];

  const cache = client.readQuery({ query: QUERY_MORE_IMAGES });
  const difference = _.difference(
    moreImages.map(iw => iw.id),
    cache.moreImages.map(iw => iw.id)
  );
  if (difference.length === 0) return [];

  // 将新出现的列出来
  const newMoreToAdd = moreImages.filter(
    (ele) => (difference.join(',').indexOf(ele.id) >= 0)
  );
  if (newMoreToAdd.length === 0) return [];

  cache.moreImages.unshift(...newMoreToAdd);
  client.writeQuery({ query: QUERY_MORE_IMAGES, data: cache });

  return newMoreToAdd;
}

const randomColorInt = (min = 200, max = 255) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  //The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}


export const genRandomColor = () => {
  const r = randomColorInt().toString(16);
  const g = randomColorInt().toString(16);
  const b = randomColorInt().toString(16);
  const color = `#${r}${g}${b}`;
  // console.log('genRandomColor: ', color, );
  return color;
}
