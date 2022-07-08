const fs = require('fs')

console.log("Injecting html2canvas.js into screenshot_template.js")
const html2canvas = fs.readFileSync("node_modules/html2canvas/dist/html2canvas.min.js").toString()
let html = fs.readFileSync("src/screenshot_template.html").toString()
html = html.replace(`<script src="{{__html2canvasPath__}}"><\/script>`, `<script>\n${html2canvas}\n</script>`)
fs.writeFileSync("out/screenshot_template.html", html)