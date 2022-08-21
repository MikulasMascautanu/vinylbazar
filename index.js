import 'dotenv/config'
import axios from 'axios'
import { parse } from 'node-html-parser'
import { google } from 'googleapis'
const BASE_URL = 'https://www.vinylbazar.net'

const authAndGetSheets = async () => {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

const callBish = async () => {
  // Get paths
  const paths = []

  // TODO: Testing Sheets API
  if (!paths.length) {
    const sheets = await authAndGetSheets()

    // Sheet range
    const range = `Sheet1!R1C1:R2C3`

    // Get data from Sheet
    let response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range,
    })

    // Prettify returned data, for testing
    const rows = response.data.values.map((x) => {
      return { title: x[0], price: x[1], link: x[2] }
    })
    console.log(rows)

    return
  }

  let response = await axios.get(BASE_URL)

  if (!response?.data) {
    throw new Error('No data received.')
  }

  const root = parse(response.data)
  const menuItem = '.root-eshop-menu > .leftmenuDef a'
  for (let item of root.querySelectorAll(menuItem)) {
    if (item.rawAttributes?.href) {
      paths.push(item.rawAttributes.href)
    }
  }

  // Log paths
  paths.forEach((element) => {
    console.log(element)
  })

  // Get products
  const products = []
  for (const path of paths) {
    response = await axios.get(BASE_URL + path)

    if (!response || !response.data) {
      console.log('Invalid path: ', path)
      continue
    }

    const productRoot = parse(response.data)
    products.push({
      path: path,
      data: productRoot.querySelectorAll('.productBody'),
    })
  }

  // Get product info
  const title = '.productTitleContent a'
  const price = '.product_price_text'

  // products.forEach((p) => {
  //   console.log(p.querySelector(title).textContent);
  //   console.log(p.querySelector(title).rawAttributes.href);
  //   console.log(p.querySelector(price).textContent);
  // });
}

callBish()
