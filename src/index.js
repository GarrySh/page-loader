import path from 'path';
// import url from 'url';
// import httpAdapter from 'axios/lib/adapters/http';
import fs from 'mz/fs';
import axios from 'axios';
import cheerio from 'cheerio';

// axios.defaults.adapter = httpAdapter;

const axiosConfig = {
  headers: {
    Accept: 'text/html',
    'Accept-Language': 'en,en-US;q=0.7,ru;q=0.3',
  },
};

const tagsPropertyForChange = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const loadFile = uri => axios
  .get(uri, axiosConfig)
  .then((response) => {
    const $ = cheerio.load(response.data, { decodeEntities: false });
    Object.keys(tagsPropertyForChange).map((propertyName) => {
      // $(propertyName).each(function (i, tag) {
      $(propertyName).each((i, tag) => {
        if (i === 0 && tag.name === 'img') {
          // console.log(tag);
          // console.log($(tag).attr(tagsPropertyForChange[propertyName], 'h'));
        }
      });
      return null;
    });
    const changedContent = $.html();
    return changedContent;
  });

export default (uri, outputDir) => {
  // ^\w+:\/\/ - select scheme
  const fileName = uri.replace(/^\w+:\/\//g, '').replace(/\W/g, '-');
  const filePath = path.resolve(outputDir, `${fileName}.html`);
  const dirPath = path.resolve(outputDir, `${fileName}_files`);
  // const dirPath = path.resolve('/tmp/hexlet-0s9orq/', `${fileName}_files`);

  return fs.writeFile(filePath, '', { flag: 'ax' })
    .then(() => fs.mkdir(dirPath, '0775'))
    .then(() => loadFile(uri))
    .then(data => fs.writeFile(filePath, data, { flag: 'w', encoding: 'utf8' }));
};
