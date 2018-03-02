import pathLib from 'path';
import urlLib from 'url';
import fs from 'mz/fs';
import axios from 'axios';
import cheerio from 'cheerio';
// import httpAdapter from 'axios/lib/adapters/http';
// axios.defaults.adapter = httpAdapter;

const tagsPropertyForChange = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const getFileName = (uri) => {
  const { host, path } = urlLib.parse(uri);
  const { dir, name, ext } = pathLib.parse(path);
  const nameRoot = `${host}${dir}${name}`.replace(/\W/g, '-');
  return `${nameRoot}${ext}`;
};

const loadFile = (uri, filePath) => axios
  .get(uri, { responseType: 'stream' })
  .then(response => response.data.pipe(fs.createWriteStream(filePath)));

const loadPage = (uri, dirPath, dirName) => axios
  .get(uri, { headers: { Accept: 'text/html', 'Accept-Language': 'en,en-US;q=0.7,ru;q=0.3' } })
  .then((response) => {
    const $ = cheerio.load(response.data, { decodeEntities: false });
    Promise.all(Object.keys(tagsPropertyForChange).map(propertyName =>
      $(propertyName).each((i, tag) => {
        const addr = $(tag).attr(tagsPropertyForChange[propertyName]);
        if (addr) {
          const fileName = getFileName(addr);
          const filePathToDownload = pathLib.resolve(dirPath, fileName);
          const filePathToPage = pathLib.join(dirName, fileName);
          $(tag).attr(tagsPropertyForChange[propertyName], filePathToPage);
          return loadFile(addr, filePathToDownload);
        }
        return Promise.resolve();
      })));
    const changedContent = $.html();
    return changedContent;
  });

export default (uri, outputDir) => {
  const fileName = getFileName(uri);
  const filePath = pathLib.resolve(outputDir, `${fileName}.html`);
  const dirName = `${fileName}_files`;
  const dirPath = pathLib.resolve(outputDir, dirName);

  return fs.writeFile(filePath, '', { flag: 'ax' })
    .then(() => fs.mkdir(dirPath, '0775'))
    .then(() => loadPage(uri, dirPath, dirName))
    .then(data => fs.writeFile(filePath, data, { flag: 'w', encoding: 'utf8' }));
};
