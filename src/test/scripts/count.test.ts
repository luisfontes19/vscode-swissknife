import * as assert from 'assert'
import { countChars, countWords } from '../../scripts/count'

suite('[Scripts] Count', () => {

  suite('countWords', () => {

    test('Should count words', async () => {
      let text = `do enim duis dolore ad nostrud officia laboris mollit esse adipisicing ut ex aliquip ex et in dolor nostrud deserunt`
      assert.strictEqual(await countWords(text), "20 words found")

      text = `Lorem ipsum cillum ut incididunt adipisicing est ex consectetur laborum`
      assert.strictEqual(await countWords(text), "10 words found")
    })

    test('Should ignore spaces at the end', async () => {
      let text = `do enim duis dolore ad nostrud officia laboris mollit esse adipisicing ut ex aliquip ex et in dolor nostrud deserunt `
      assert.strictEqual(await countWords(text), "20 words found")
    })
  })

  suite('countChars', () => {

    test('Should count chars', async () => {
      let text = `12345 789 . 11 12 a e c v t `
      assert.strictEqual(await countChars(text), "28 characters")
    })
  })
})