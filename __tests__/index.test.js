import nock from 'nock';
import path from 'path';
import fs from 'mz/fs';
import fse from 'fs-extra';
import os from 'os';
import pageLoader from '../src';

nock.disableNetConnect();

const addr = 'https://ru.hexlet.io';
const mocksDir = '__tests__/__fixtures__/';
const tmpDirs = [];

const getTmpDir = async () => {
  const tmpDirTemplate = path.join(os.tmpdir(), 'hexlet-');
  const tmpDirPath = await fs.mkdtemp(tmpDirTemplate);
  tmpDirs.push(tmpDirPath);
  return tmpDirPath;
};

beforeAll(async () => {
  nock(addr).get('/courses')
    .delay(10).replyWithFile(200, path.join(mocksDir, 'page_before.html'));
  nock(addr).get('/favicon-196x196.png')
    .delay(100).replyWithFile(200, path.join(mocksDir, 'favicon-196x196.png'));
  nock(addr).get('/684image.png')
    .delay(10).replyWithFile(200, path.join(mocksDir, '684image.png'));
  nock(addr).get('/ea7image.png')
    .delay(40).replyWithFile(200, path.join(mocksDir, 'ea7image.png'));
  nock(addr).get('/f83image.png')
    .delay(120).replyWithFile(200, path.join(mocksDir, 'f83image.png'));
  nock(addr).get('/coursess').reply(404);
});

afterAll(async () => {
  await Promise.all(tmpDirs.map(pathToFolder => fse.remove(pathToFolder)));
});

test('download page content', async () => {
  const tmpDir = await getTmpDir();
  const requiredContent = await fs.readFile(path.join(mocksDir, 'page_after.html'), 'utf8');
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const fileContent = await fs.readFile(path.join(tmpDir, 'ru-hexlet-io-courses.html'), 'utf8');
  await fs.open(path.join(tmpDir, 'ru-hexlet-io-courses_files', '684image.png'), 'r');
  await fs.open(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ea7image.png'), 'r');
  await fs.open(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'f83image.png'), 'r');
  await fs.open(path.join(tmpDir, 'ru-hexlet-io-courses_files', 'favicon-196x196.png'), 'r');
  expect(fileContent).toBe(requiredContent);
});

test('downloading nonexistent page', async () => {
  const tmpDir = await getTmpDir();
  try {
    await pageLoader('https://ru.hexlet.io/coursess', tmpDir);
    expect(true).toBe(false);
  } catch (err) {
    expect(err).toContain('404');
  }
});

test('parent directory not exist', async () => {
  const tmpDir = await getTmpDir();
  try {
    await pageLoader('https://ru.hexlet.io/courses', path.join(tmpDir, '/wrongpath'));
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toEqual('ENOENT');
  }
});

test('download file exists', async () => {
  const tmpDir = await getTmpDir();
  const filePath = path.join(tmpDir, 'ru-hexlet-io-courses.html');
  await fs.writeFile(filePath, '');
  try {
    await pageLoader('https://ru.hexlet.io/courses', tmpDir);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toEqual('EEXIST');
  }
});
