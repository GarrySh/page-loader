import nock from 'nock';
import path from 'path';
import fs from 'mz/fs';
import pageLoader from '../src';

test('example test', async () => {
  // const dirToDownload = path.resolve(__dirname);
  const fileToDownload = path.resolve(__dirname, 'hexlet-io-courses.html');
  pageLoader('https://hexlet.io/courses', __dirname);
  await expect(fs.readFile(fileToDownload, 'utf-8')).resolves.toBe('test');
});
