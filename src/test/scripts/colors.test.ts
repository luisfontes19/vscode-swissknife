import * as assert from 'assert'
import { hexToRgb, rgbToHex } from '../../scripts/colors'

suite('[Scripts] Colors', () => {

  suite('rgbToHex', () => {

    test('Should convert RGB TO HEX', async () => {
      const text = `rgb(67, 255, 100)`
      assert.strictEqual(await rgbToHex(text), `#43FF64`)
    })

    test('Should convert RGBA TO HEX', async () => {
      const text = `rgba(67, 255, 100, 0.85)`
      assert.strictEqual(await rgbToHex(text), `#43FF64D9`)
    })

    test('Should convert multiple RGBA TO HEX', async () => {
      const text = `rgba(67, 255, 100, 0.85) some text here rgba(67, 255, 100, 0.85)`
      assert.strictEqual(await rgbToHex(text), `#43FF64D9 some text here #43FF64D9`)
    })

    test('Should convert rgb without rgb()', async () => {
      const text = `67, 255, 100`
      assert.strictEqual(await rgbToHex(text), `#43FF64`)
    })

    test('Should convert rgba without rgba()', async () => {
      const text = `67, 255, 100, 0.85`
      assert.strictEqual(await rgbToHex(text), `#43FF64D9`)
    })
  })

  suite('hexToRgb', () => {

    test('Should convert hex to rgb', async () => {
      const text = `#FFFFFF`
      assert.strictEqual(await hexToRgb(text), `rgb(255,255,255)`)
    })

    test('Should convert hex to rgba', async () => {
      const text = `#FFFFFFFF`
      assert.strictEqual(await hexToRgb(text), `rgba(255,255,255,1)`)
    })

    test('Should convert hex to rgba with alpha channel rounded', async () => {
      const text = `#7F11E00F`
      assert.strictEqual(await hexToRgb(text), `rgba(127,17,224,0.06)`)
    })

    test('Should find and convert hex colors', async () => {
      const text = `some text #7F11E00F here`
      assert.strictEqual(await hexToRgb(text), `some text rgba(127,17,224,0.06) here`)
    })

    test('Should be case insensitive', async () => {
      const text = `#7F11E0`
      assert.strictEqual(await hexToRgb(text), `rgb(127,17,224)`)
    })
  })

})