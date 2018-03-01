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
  const axiosConfig = {
    headers: {
      Accept: 'text/html',
      'Accept-Language': 'en,en-US;q=0.7,ru;q=0.3',
    },
  };
  const tagsForDownload = {
    link: 'href',
    script: 'src',
    img: 'src',
  };

  return axios
    .get(uri, axiosConfig)
    .then((response) => {
      const $ = cheerio.load(response.data, { decodeEntities: false });
      const result = $('img').attr('src').toString();
      console.log(result);
      // console.log($('html').html());
      // return $('html').html();
      return response.data;
    })
    .then(data => fs.writeFile(filePath, data, { flag: 'ax', encoding: 'utf8' }));
};

export default pageLoader;
