import { Console } from 'console';

export default new Console({
  stdout: process.stdout,
  groupIndentation: 6,
  stderr: process.stderr,
});
