import nock from 'nock';
import path from 'path';
import fs from 'mz/fs';
import fse from 'fs-extra';
import os from 'os';
import pageLoader from '../src';

nock.disableNetConnect();

const tmpDirTemplate = path.join(os.tmpdir(), 'hexlet-');
const tmpDirs = [];

beforeEach(() => {
});

afterAll(() => {
  tmpDirs.map(pathToFolder => fse.remove(pathToFolder).catch(err => console.error(err)));
});

test('test', async () => {
  const tmpDirPath = await fs.mkdtemp(tmpDirTemplate);
  tmpDirs.push(tmpDirPath);
  const mockFileBody = await fs.readFile('__tests__/__fixtures__/hexlet-io-courses.html', 'utf8');
  nock('https://hexlet.io')
    .get('/courses')
    .reply(200, mockFileBody);

  const filePath = path.join(tmpDirPath, 'hexlet-io-courses.html');
  await pageLoader('https://hexlet.io/courses', tmpDirPath);
  return expect(fs.readFile(filePath, 'utf8')).resolves.toBe(mockFileBody);
});
