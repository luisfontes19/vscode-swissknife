import * as assert from 'assert'
import { capitalize, joinLines, sortAlphabetically, toCamelCase, toLowerCase, toUpperCase, slugify } from '../../lib/textBasic'

suite('[Scripts] textBasic', () => {

  test('to lower case', () => {
    assert.strictEqual(toLowerCase("Some text Here"), "some text here")
  })

  test('to upper case', () => {
    assert.strictEqual(toUpperCase("Some text Here"), "SOME TEXT HERE")
  })

  test('to camel case', () => {
    assert.strictEqual(toCamelCase("Some teXt HeRe"), "someTextHere")
  })

  test('Join Lines', () => {
    assert.strictEqual(joinLines("Some\nText\nHere", "."), "Some.Text.Here")
  })

  test('Capitalize', () => {
    assert.strictEqual(capitalize("Some text here"), "Some Text Here")
  })

  test('Sort Alphabetically', () => {
    assert.strictEqual(sortAlphabetically("Some\nText\nHere"), "Here\nSome\nText")
  })

  test("Slugify", () => {
    assert.strictEqual(slugify("Some text here"), "some-text-here");
  });

})