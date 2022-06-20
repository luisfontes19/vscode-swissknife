import * as assert from 'assert'
import { countChars, countWords } from '../../lib/count'

suite('[Scripts] Count', () => {

  suite('countWords', () => {

    test('Should count words', () => {
      let text = `do enim duis dolore ad nostrud officia laboris mollit esse adipisicing ut ex aliquip ex et in dolor nostrud deserunt`
      assert.strictEqual(countWords(text), 20)

      text = `Lorem ipsum cillum ut incididunt adipisicing est ex consectetur laborum`
      assert.strictEqual(countWords(text), 10)
    })

    test('Should ignore spaces at the end', () => {
      let text = `do enim duis dolore ad nostrud officia laboris mollit esse adipisicing ut ex aliquip ex et in dolor nostrud deserunt `
      assert.strictEqual(countWords(text), 20)
    })
  })

  suite('countChars', () => {

    test('Should count chars', () => {
      let text = `12345 789 . 11 12 a e c v t `
      assert.strictEqual(countChars(text), 28)
    })
  })
})