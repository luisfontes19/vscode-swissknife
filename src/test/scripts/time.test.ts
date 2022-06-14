import * as assert from 'assert'
import { fromTimestamp, toTimestamp } from '../../scripts/time'

suite('[Scripts] Time', () => {

  test('To time stamp', async () => {
    //test with a few different date formats
    assert.strictEqual(await toTimestamp("Tue Jun 14 2022 17:34:04 GMT+0100"), "1655224444")
    assert.strictEqual(await toTimestamp("Tue, 14 Jun 2022 16:34:04 GMT"), "1655224444")
    assert.strictEqual(await toTimestamp("Tue, 14 Jun 2022 16:34:04"), "1655220844")
    assert.strictEqual(await toTimestamp("2022/06/14"), "1655161200")
  })

  test('From time stamp', async () => {
    //assuming it doesn't have millis
    assert.strictEqual(await fromTimestamp("1655224444"), "Tue, 14 Jun 2022 16:34:04 GMT")

    //assuming it does have millis
    assert.strictEqual(await fromTimestamp("1655224444000"), "Tue, 14 Jun 2022 16:34:04 GMT")

  })



})