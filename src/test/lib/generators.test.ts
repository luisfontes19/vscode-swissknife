import * as assert from 'assert'
import { randomString, uuidv4 } from '../../lib/generators'

suite('[Scripts] Generators', () => {

  test('Generate random string', () => {
    const res = randomString(30)
    const base64r = /^[-A-Za-z0-9+=]{1,50}|=[^=]|={3,}$/i
    assert(res.match(base64r))
    assert.strictEqual(res.length, 30)
  })

  test('Should generate uuidv4', () => {
    assert((uuidv4()).match(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i))
  })

})