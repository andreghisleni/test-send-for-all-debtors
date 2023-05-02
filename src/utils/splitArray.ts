export const splitArray = (array: any[], perChunk: number) => {
  return array.reduce((resultArray: any[][], item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // eslint-disable-line no-param-reassign
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
};
