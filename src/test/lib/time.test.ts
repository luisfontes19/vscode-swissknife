import * as assert from 'assert'
import { formattedDateToTimestamp, timestampToFormattedDate } from '../../lib/time'

suite('[Scripts] Time', () => {

  test('To time stamp', () => {
    //test with a few different date formats
    assert.strictEqual(formattedDateToTimestamp("Tue Jun 14 2022 17:34:04 GMT+0100"), "1655224444")
    assert.strictEqual(formattedDateToTimestamp("Tue, 14 Jun 2022 16:34:04 GMT"), "1655224444")
    assert.strictEqual(formattedDateToTimestamp("Tue, 14 Jun 2022 16:34:04"), "1655220844")
    assert.strictEqual(formattedDateToTimestamp("2022/06/14"), "1655161200")
  })

  test('From time stamp', () => {
    //assuming it doesn't have millis
    assert.strictEqual(timestampToFormattedDate("1655224444"), "Tue, 14 Jun 2022 16:34:04 GMT")

    //assuming it does have millis
    assert.strictEqual(timestampToFormattedDate("1655224444000"), "Tue, 14 Jun 2022 16:34:04 GMT")

  })



})