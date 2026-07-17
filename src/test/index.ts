import { glob } from 'glob'
import * as Mocha from 'mocha'
import * as path from 'path'

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  })

  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot })
      .then(files => {
        files.forEach(file => mocha.addFile(path.resolve(testsRoot, file)))

        try {
          mocha.run(failures => {
            if (failures > 0) {
              e(new Error(`${failures} tests failed.`))
            } else {
              c()
            }
          })
        } catch (err) {
          e(err)
        }
      })
      .catch(err => e(err))
  })
}