// eslint-disable-next-line
const tailwindcss = require("tailwindcss");

// eslint-disable-next-line
module.exports = {
  plugins: [tailwindcss("./src/tailwind.js"), require("autoprefixer")],
};
