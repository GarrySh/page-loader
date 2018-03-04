import nock from 'nock';
import path from 'path';
import fs from 'mz/fs';
import fse from 'fs-extra';
import os from 'os';
import pageLoader from '../src';

nock.disableNetConnect();

const tmpDirTemplate = path.join(os.tmpdir(), 'hexlet-');
const tmpDirs = [];

beforeAll(async () => {
  const mockPage = await fs.readFile('__tests__/__fixtures__/page_before.html', 'utf8');
  const mockImage = await fs.readFile('__tests__/__fixtures__/favicon-196x196.png');
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, mockPage)
    .get('/favicon-196x196.png')
    .reply(200, mockImage)
    .get('/coursess')
    .reply(404);
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

