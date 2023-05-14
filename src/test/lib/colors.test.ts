import * as assert from 'assert'
import { hexToHsl, hexToHwb, hexToRgb, hslToHex, hwbToHex, rgbToHex } from '../../lib/colors'

suite('[Scripts] Colors', () => {

  suite('rgbToHex', () => {

    test('Should convert RGB TO HEX', () => {
      assert.strictEqual(rgbToHex(67, 255, 100), `#43FF64`)
    })

    test('Should convert RGBA TO HEX', () => {

      assert.strictEqual(rgbToHex(67, 255, 100, 0.85), `#43FF64D9`)
    })

    // test('Should convert multiple RGBA TO HEX', () => {
    //   const text = `rgba(67, 255, 100, 0.85) some text here rgba(67, 255, 100, 0.85)`
    //   assert.strictEqual(rgbToHex(text), `#43FF64D9 some text here #43FF64D9`)
    // })

    // test('Should convert rgb without rgb()', () => {
    //   const text = `67, 255, 100`
    //   assert.strictEqual(rgbToHex(text), `#43FF64`)
    // })

    // test('Should convert rgba without rgba()', () => {
    //   const text = `67, 255, 100, 0.85`
    //   assert.strictEqual(rgbToHex(text), `#43FF64D9`)
    // })
  })

  suite('hexToRgb', () => {

    test('Should convert hex to rgb', () => {
      const text = `#FFFFFF`
      assert.strictEqual(hexToRgb(text), `rgb(255,255,255)`)
    })

    test('Should convert hex to rgba', () => {
      const text = `#FFFFFFFF`
      assert.strictEqual(hexToRgb(text), `rgba(255,255,255,1)`)
    })

    test('Should convert hex to rgba with alpha channel rounded', () => {
      const text = `#7F11E00F`
      assert.strictEqual(hexToRgb(text), `rgba(127,17,224,0.06)`)
    })

    test('Should be case insensitive', () => {
      const text = `#7F11E0`
      assert.strictEqual(hexToRgb(text), `rgb(127,17,224)`)
    })

    test('Should convert hex to hwb', () => {
      const text = `#00bfff`
      assert.strictEqual(hexToHwb(text), `hwb(195, 0%, 0%)`)
    })

    test('Should convert hwb to hex', () => {
      // we kinda loose presition, so thats why the color is nto exactly the same
      assert.strictEqual(hwbToHex(195, 0, 0), `#00BFFF`)
    })

    test('Should convert hex to hsl', () => {
      const text = `#00bfff`
      assert.strictEqual(hexToHsl(text), `hsl(195, 100%, 50%)`)
    })

    test('Should convert hsl to hex', () => {
      assert.strictEqual(hslToHex(195, 100, 50), `#00BFFF`)
    })
  })

})
