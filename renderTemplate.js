const { AIMGClient } = require("./dist");
const fs = require("fs");

const renderer = new AIMGClient({
  apiKey: ""
});

(async () => {
  if (!process.argv[2]) {
    console.log("Please provide a template name as an argument.");
    process.exit(1);
  }
  const res = await renderer.renderTemplate(process.argv[2]);
  console.log(res);
  fs.writeFileSync(res.filaname, res.buffer);
  console.log(`Image saved to ${res.filaname}`);
  process.exit(0);
})();