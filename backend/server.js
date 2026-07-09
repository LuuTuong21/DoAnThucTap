const app = require("./src/app");
require("./src/config/db");

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});