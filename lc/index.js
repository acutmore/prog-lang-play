
const scan = require('./scanner').scan;

for (const token of scan(`
(\\a918ca.aasd)
`)) {
    console.log(token);
}
