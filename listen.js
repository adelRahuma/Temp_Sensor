const app = require("./server.js");
const { PORT = 3000 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
