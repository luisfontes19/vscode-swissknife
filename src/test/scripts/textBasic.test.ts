import * as assert from 'assert'
import { capitalize, sortAlphabetically, toCamelCase, toLowerCase, toUpperCase, _joinLines } from '../../scripts/textBasic'

suite('[Scripts] textBasic', () => {

  test('to lower case', async () => {
    assert.strictEqual(await toLowerCase("Some text Here"), "some text here")
  })

  test('to upper case', async () => {
    assert.strictEqual(await toUpperCase("Some text Here"), "SOME TEXT HERE")
  })

  test('to camel case', async () => {
    assert.strictEqual(await toCamelCase("Some teXt HeRe"), "someTextHere")
  })

  test('Join Lines', async () => {
    assert.strictEqual(_joinLines("Some\nText\nHere", "."), "Some.Text.Here")
  })

  test('Capitalize', async () => {
    assert.strictEqual(await capitalize("Some text here"), "Some Text Here")
  })

  test('Sort Alphabetically', async () => {
    assert.strictEqual(await sortAlphabetically("Some\nText\nHere"), "Here\nSome\nText")
  })

})