import fs from 'mz/fs';
import path from 'path';

const rmdir = (pathToDir) => {
  // console.log(pathToDir);
  fs.readdir(pathToDir)
    .then(item => Promise.all(item.map((file) => {
      const pathToFile = path.join(pathToDir, file);
      return fs.unlink(pathToFile);
    })))
    .then(() => fs.rmdir(pathToDir))
    .catch(err => console.error(err));
};

export default rmdir;
