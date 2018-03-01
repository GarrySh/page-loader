import path from 'path';
// import url from 'url';
// import httpAdapter from 'axios/lib/adapters/http';
import fs from 'mz/fs';
import axios from 'axios';
import cheerio from 'cheerio';

const pageLoader = (uri, outputDir) => {
  const fileExtension = 'html';
  // ^\w+:\/\/ - select scheme
  const fileName = uri.replace(/^\w+:\/\//g, '').replace(/\W/g, '-');
  const filePath = path.resolve(outputDir, `${fileName}.${fileExtension}`);
  const config = {
    headers: {
      Accept: 'text/html',
      'Accept-Language': 'en,en-US;q=0.7,ru;q=0.3',
    },
  };
  return axios
    .get(uri, config)
    .then((response) => {
      const cfg = {
        withDomLvl1: true,
        normalizeWhitespace: true,
        xmlMode: true,
        decodeEntities: false,
      };
      const $ = cheerio.load(response.data, cfg);
      // console.log($('html').find('img').toArray()[0]);
      // console.log($('html').html());
      return $('html').html();
    })
    .then(response => fs.writeFile(filePath, response, { flag: 'ax', encoding: 'utf8' }));
};

export default pageLoader;
