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

afterAll(async () => {
  await Promise.all(tmpDirs.map(pathToFolder => fse.remove(pathToFolder)));
});

test('download page content', async () => {
  const tmpDirPath = await fs.mkdtemp(tmpDirTemplate);
  tmpDirs.push(tmpDirPath);
  const mockContent = await fs.readFile('__tests__/__fixtures__/page_before.html', 'utf8');
  const requiredContent = await fs.readFile('__tests__/__fixtures__/page_after.html', 'utf8');
  nock('https://hexlet.io')
    .get('/courses')
    .reply(200, mockContent);

  const filePath = path.join(tmpDirPath, 'hexlet-io-courses.html');
  await pageLoader('https://hexlet.io/courses', tmpDirPath);
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    expect(fileContent).toBe(requiredContent);
  } catch (err) {
    expect(err).toBeUndefined();
  }
});
