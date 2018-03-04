import pathLib from 'path';
import urlLib from 'url';
import fs from 'mz/fs';
import axios from 'axios';
import cheerio from 'cheerio';
// import httpAdapter from 'axios/lib/adapters/http';
// axios.defaults.adapter = httpAdapter;

const tagsAttributeForChange = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const isUriLocal = (uri) => {
  const { protocol, hostname } = urlLib.parse(uri);
  return !(hostname && protocol);
};

const getFileName = (uri) => {
  const { host, path } = urlLib.parse(uri);
  const { dir, name, ext } = pathLib.parse(path);
  const nameRoot = `${host}${dir}${name}`.replace(/\W/g, '-');
  return `${nameRoot}${ext}`;
};

const loadFiles = ({ links, pageBody }) => {
  Promise.all(links.map(({ link, filePathToDownload }) => axios
    .get(link, { responseType: 'stream' })
    .then(response => response.data.pipe(fs.createWriteStream(filePathToDownload)))));
  return pageBody;
};

const loadPage = uri => axios
  .get(uri, { headers: { Accept: 'text/html', 'Accept-Language': 'en,en-US;q=0.7,ru;q=0.3' } })
  .then(response => response.data);

const changeAndParsePage = (pageData, dirPath, dirName) => {
  const $ = cheerio.load(pageData, { decodeEntities: false });
  const links = Object.keys(tagsAttributeForChange).reduce((acc, tag) => {
    const attribute = tagsAttributeForChange[tag];
    const currentLinks = $(`${tag}[${attribute}]`).toArray().reduce((accC, itemC) => {
      const link = $(itemC).attr(attribute);
      if (isUriLocal(link)) {
        const fileName = getFileName(link);
        const filePathToDownload = pathLib.resolve(dirPath, fileName);
        const filePathToPage = pathLib.join(dirName, fileName);
        $(itemC).attr(attribute, filePathToPage);
        return [...accC, { link, filePathToDownload }];
      }
      return accC;
    }, []);
    return [...acc, ...currentLinks];
  }, []);
  return { links, pageBody: $.html() };
};

export default (uri, outputDir) => {
  const fileName = getFileName(uri);
  const filePath = pathLib.resolve(outputDir, `${fileName}.html`);
  const dirName = `${fileName}_files`;
  const dirPath = pathLib.resolve(outputDir, dirName);

  return fs.writeFile(filePath, '', { flag: 'ax' })
    .then(() => fs.mkdir(dirPath, '0775'))
    .then(() => loadPage(uri))
    .then(pageData => changeAndParsePage(pageData, dirPath, dirName))
    .then(parsedData => loadFiles(parsedData))
    .then(pageBody => fs.writeFile(filePath, pageBody, { flag: 'w', encoding: 'utf8' }));
};
