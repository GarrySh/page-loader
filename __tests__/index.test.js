import nock from 'nock';
import path from 'path';
import fs from 'mz/fs';
import fse from 'fs-extra';
import os from 'os';
import pageLoader from '../src';

nock.disableNetConnect();

const addr = 'https://ru.hexlet.io';
const templatesDir = '__tests__/__fixtures__/';
const tmpDirTemplate = path.join(os.tmpdir(), 'hexlet-');
const tmpDirs = [];

beforeAll(async () => {
  nock(addr).get('/courses')
    .delay(100).replyWithFile(200, path.join(templatesDir, 'page_before.html'));
  nock(addr).get('/favicon-196x196.png')
    .delay(20).replyWithFile(200, path.join(templatesDir, 'favicon-196x196.png'));
  nock(addr).get('/684image.png')
    .delay(200).replyWithFile(200, path.join(templatesDir, '684image.png'));
  nock(addr).get('/ea7image.png')
    .delay(80).replyWithFile(200, path.join(templatesDir, 'ea7image.png'));
  nock(addr).get('/f83image.png')
    .delay(300).replyWithFile(200, path.join(templatesDir, 'f83image.png'));
  nock(addr).get('/coursess').reply(404);
});

afterAll(async () => {
  await Promise.all(tmpDirs.map(pathToFolder => fse.remove(pathToFolder)));
});

test('download page content', async () => {
  const tmpDirPath = await fs.mkdtemp(tmpDirTemplate);
  tmpDirs.push(tmpDirPath);
  const requiredContent = await fs.readFile('__tests__/__fixtures__/page_after.html', 'utf8');
  const filePath = path.join(tmpDirPath, 'ru-hexlet-io-courses.html');
  await pageLoader('https://ru.hexlet.io/courses', tmpDirPath);
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    expect(fileContent).toBe(requiredContent);
  } catch (err) {
    expect(err).toBeUndefined();
  }
});
