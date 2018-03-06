import pathLib from 'path';
import urlLib from 'url';
import fs from 'mz/fs';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';

const logInfo = debug('page-loader:info');
const logError = debug('page-loader:error');

const errorHandler = (err) => {
  if (err.response) {
    const errorMessage = `error get page ${err.config.url} with status ${err.response.status}`;
    logError(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
  logError(`error ${err.message}`);
  return Promise.reject(err);
};

const tagsAttributeForChange = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const isUriLocal = (uri) => {
  const URI = uri.replace(/^\/\//g, '');
  const { protocol, hostname } = urlLib.parse(URI);
  return !(hostname && protocol);
};

const getFileName = (uri) => {
  const { host, path } = urlLib.parse(uri);
  const { dir, name, ext } = pathLib.parse(path);
  const newHost = (host === null) ? '' : host;
  const newDir = (dir === '/') ? '' : dir;
  const nameRoot = pathLib.join(newHost, newDir, name).replace(/\W/g, '-');
  return `${nameRoot}${ext}`;
};

const loadFile = (link, filePathToDownload) => axios
  .get(link, { responseType: 'stream' })
  .then((response) => {
    logInfo(`trying to download file ${link} to ${filePathToDownload}`);
    return response.data.pipe(fs.createWriteStream(filePathToDownload));
  }).catch((err) => {
    logError(`error downloading file ${link} to ${filePathToDownload}`);
    return Promise.reject(err);
  });

const loadFiles = new Listr([
  {
    title: 'download page local files',
    task: ({ links }) =>
      Promise.all(links.map(({ link, filePathToDownload }) => loadFile(link, filePathToDownload))),
  },
]);

const loadPage = uri => axios
  .get(uri)
  .then((response) => {
    logInfo(`trying to download page ${uri}`);
    return response.data;
  });

const changeAndParsePage = (pageData, uri, dirPath, dirName) => {
  const $ = cheerio.load(pageData, { decodeEntities: false });
  const links = Object.keys(tagsAttributeForChange).reduce((acc, tag) => {
    const attribute = tagsAttributeForChange[tag];
    const currentLinks = $(`${tag}[${attribute}]`).toArray().reduce((accC, itemC) => {
      const link = $(itemC).attr(attribute);
      if (isUriLocal(link)) {
        const { protocol, host } = urlLib.parse(uri);
        const absoluteLink = urlLib.resolve(`${protocol}//${host}/`, link);
        const fileName = getFileName(link);
        const filePathToDownload = pathLib.resolve(dirPath, fileName);
        const filePathToPage = pathLib.join(dirName, fileName);
        $(itemC).attr(attribute, filePathToPage);
        return [...accC, { link: absoluteLink, filePathToDownload }];
      }
      return accC;
    }, []);
    return [...acc, ...currentLinks];
  }, []);
  return { links, pageBody: $.html() };
};

export default (uri, outputDir) => {
  logInfo(`trying to download page ${uri} to directory ${outputDir}`);
  const fileName = getFileName(uri);
  const filePath = pathLib.resolve(outputDir, `${fileName}.html`);
  const dirName = `${fileName}_files`;
  const dirPath = pathLib.resolve(outputDir, dirName);

  return fs.writeFile(filePath, '', { flag: 'ax' })
    .then(() => fs.mkdir(dirPath, '0775'))
    .then(() => loadPage(uri))
    .then(pageData => changeAndParsePage(pageData, uri, dirPath, dirName))
    .then(parsedData => loadFiles.run(parsedData))
    .then(({ pageBody }) => fs.writeFile(filePath, pageBody, { flag: 'w', encoding: 'utf8' }))
    .catch(err => errorHandler(err));
};
