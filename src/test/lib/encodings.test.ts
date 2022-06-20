import * as assert from 'assert'
import { fromBase64, fromBinary, fromHex, fromUrlEncode, fullUrlEncode, toBase64, toBinary, toHex, toHTMLEncodeAll, toMorseCode, toUrlEncode } from '../../lib/encodings'

suite('[Scripts] Encodings', () => {

  test('Base64 encode', () => {
    const text = `labore dolor adipisicing`
    assert.strictEqual(toBase64(text), `bGFib3JlIGRvbG9yIGFkaXBpc2ljaW5n`)
  })

  test('Base64 decode', () => {
    const text = "bGFib3JlIGRvbG9yIGFkaXBpc2ljaW5n"
    assert.strictEqual(fromBase64(text), `labore dolor adipisicing`)
  })


  test('Hex encode', () => {
    const text = `labore dolor adipisicing`
    assert.strictEqual(toHex(text), `6C61626F726520646F6C6F72206164697069736963696E67`)
  })

  test('Hex decode', () => {
    const text = "6C61626F726520646F6C6F72206164697069736963696E67"
    assert.strictEqual(fromHex(text), `labore dolor adipisicing`)
  })

  test('HTML encode all chars', () => {
    const text = "Lorem ipsum qui magna nisi !#$%&/()=?-.,;:_<>"
    assert.strictEqual(toHTMLEncodeAll(text), `&#76&#111&#114&#101&#109&#32&#105&#112&#115&#117&#109&#32&#113&#117&#105&#32&#109&#97&#103&#110&#97&#32&#110&#105&#115&#105&#32&#33&#35&#36&#37&#38&#47&#40&#41&#61&#63&#45&#46&#44&#59&#58&#95&#60&#62`)
  })

  test('URL Encode', () => {
    const text = "Lorem ipsum qui magna nisi !#$%&/()=?-.,;:_<>"
    assert.strictEqual(toUrlEncode(text), `Lorem%20ipsum%20qui%20magna%20nisi%20!%23%24%25%26%2F()%3D%3F-.%2C%3B%3A_%3C%3E`)
  })

  test('URL Decode', () => {
    const text = `Lorem%20ipsum%20qui%20magna%20nisi%20%21%23%24%25%26%2F%28%29%3D%3F-.%2C%3B%3A_%3C%3E`
    assert.strictEqual(fromUrlEncode(text), "Lorem ipsum qui magna nisi !#$%&/()=?-.,;:_<>")
  })

  test('URL Encode Full', () => {
    const text = "Lorem ipsum qui magna nisi !#$%&/()=?-.,;:_<>"
    assert.strictEqual(fullUrlEncode(text), `%4c%6f%72%65%6d%20%69%70%73%75%6d%20%71%75%69%20%6d%61%67%6e%61%20%6e%69%73%69%20%21%23%24%25%26%2f%28%29%3d%3f%2d%2e%2c%3b%3a%5f%3c%3e`)
  })

  test('Binary encode', () => {
    const text = `labore dolor adipisicing`
    assert.strictEqual(toBinary(text), `01101100 01100001 01100010 01101111 01110010 01100101 00100000 01100100 01101111 01101100 01101111 01110010 00100000 01100001 01100100 01101001 01110000 01101001 01110011 01101001 01100011 01101001 01101110 01100111`)
  })

  test('Binary decode', () => {
    const text = "01101100 01100001 01100010 01101111 01110010 01100101 00100000 01100100 01101111 01101100 01101111 01110010 00100000 01100001 01100100 01101001 01110000 01101001 01110011 01101001 01100011 01101001 01101110 01100111"
    assert.strictEqual(fromBinary(text), `labore dolor adipisicing`)
  })

  test('To morse code', () => {
    const text = "abcdefghijklmnopqrstuvwxyz0123456789!\"$&/()=?'+-_.:,;*#%"
    assert.strictEqual(toMorseCode(text), `.- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --.. ----- .---- ..--- ...-- ....- ..... -.... --... ---.. ----. -.-.-- .-..-. ...-..- .-... -..-. -.--. -.--.- -...- ..--.. .----. .-.-. -....- ..--.- .-.-.- ---... --..-- -.-.-. * # %`)
  })



})
