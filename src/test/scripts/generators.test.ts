import * as assert from 'assert'
import { uuidv4, _randomString } from '../../scripts/generators'

suite('[Scripts] Generators', () => {

  test('Generate random string', async () => {
    const res = _randomString(30)
    const base64r = /^[-A-Za-z0-9+=]{1,50}|=[^=]|={3,}$/i
    assert(res.match(base64r))
    assert.strictEqual(res.length, 30)
  })

  test('Should generate uuidv4', async () => {
    assert((await uuidv4()).match(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i))
  })

})