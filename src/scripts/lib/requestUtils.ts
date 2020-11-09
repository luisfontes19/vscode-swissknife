

const forbiddenHeaders = [
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "cookie2",
  "date",
  "dnt",
  "expect",
  "feature-policy",
  "host",
  "keep-alive",
  "origin",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via"
];


interface Data {
  body: string;
  headers: Record<string, string>;
  url: string;
  method: String
}

const forbiddenHeaderPrefixes = ["proxy-", "sec-"];
const forbiddenHeaderPrefixRegex = forbiddenHeaderPrefixes.map(function (k) { return k += ".*"; }).join("|");

const filterAllowedHeaders = (headers: Record<string, string>) => {
  const allowedHeaders: Record<string, string> = {};
  Object.keys(headers).forEach(function (k) {
    if (!forbiddenHeaders.includes(k.toLowerCase())) { //not a forbidden header... check the prefix
      if (!k.toLowerCase().match(forbiddenHeaderPrefixRegex))
        allowedHeaders[k] = headers[k];
    }
  });
  return allowedHeaders;
};



export const fromString = (content: string): Data => {

  content = content.replace(/(\r\n|\n|\r)/gm, "\n");
  let firstNewLineIndex = content.indexOf("\n");
  if (firstNewLineIndex === -1)
    firstNewLineIndex = content.length;
  const startLine = content.substring(0, firstNewLineIndex);
  const startLineArray = startLine.split(" ");
  const method = startLineArray[0];
  const path = startLineArray[1];
  let emptyLine = content.indexOf("\n\n");
  if (emptyLine === -1)
    emptyLine = content.length;
  const headersArray = content.substring(firstNewLineIndex + 1, emptyLine).split("\n");
  const headers: Record<string, string> = {};
  const body = content.substring(emptyLine + 2);
  headersArray.forEach(function (h) {
    const delimiterIndex = h.indexOf(":");
    const name = h.substring(0, delimiterIndex);
    const value = h.substring(delimiterIndex + 2);
    headers[name] = value;
  });
  //if full url is not in the request lets assume an http to host header
  let url: string;
  if (path.startsWith("http"))
    url = path;
  else
    url = "http://" + (headers['host'] || headers['Host']) + path;
  //let axios calculate the length, since we may change it
  delete headers["content-length"];
  delete headers["Content-Length"];
  return { body, headers, method, url };

}

export const toFetch = (data: Data) => {
  const allowedHeaders = filterAllowedHeaders(data.headers);
  return "fetch('" + data.url + "', {credentials: 'include', method: '" + data.method + "', headers: " + JSON.stringify(allowedHeaders) + ", body:'" + data.body + "'})";
}

