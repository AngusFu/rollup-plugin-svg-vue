const { resolve } = require('path')
const { rollup } = require('rollup')
const svgVue = require('../index')

rollup({
  input: resolve(__dirname, './test.js'),
  plugins: [
    svgVue()
  ]
})
  .then(bundle => bundle.generate({ format: 'es' }))
  .then(({ code }) => {
    console.log('Pass')
    console.log(code)
  })
