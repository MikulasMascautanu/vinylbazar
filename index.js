import 'dotenv/config'
import axios from 'axios'
import { parse } from 'node-html-parser'
import { sheetsClient } from './sheetsClient.js'
import { selectors, getRecordInfo } from './scrapeHelpers.js'
const BASE_URL = 'https://www.vinylbazar.net'

const getDataForPath = async (path, pageId, data) => {
  let response = await axios.get(`${BASE_URL}${path}?page=${pageId}&man=9`)

  if (!response || !response.data) {
    console.log('Invalid path: ', path)
    return data
  }

  const productRoot = parse(response.data)

  data.push(...productRoot.querySelectorAll(selectors.product))

  // Call getDataForPath recursively when there is another page for the path
  if (productRoot.querySelector(selectors.nextPage)) {
    await getDataForPath(path, pageId + 1, data)
  }

  return data
}

const callBish = async () => {
  // Get paths
  const paths = []

  // TODO: Testing Sheets API
  if (!paths.length) {
    const sheets = await sheetsClient()

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

    // Update Sheet
    response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      includeValuesInResponse: true,
      valueInputOption: 'RAW',
      range: 'Sheet1!R4C1:R5C3',
      requestBody: {
        values: [
          [1, 2, 3],
          [4, 5, 7],
        ],
      },
    })

    // Updated values
    const newRows = response.data.updatedData.values
    console.log(newRows)

    return
  }

  let response = await axios.get(BASE_URL)

  if (!response?.data) {
    throw new Error('No data received.')
  }

  const root = parse(response.data)
  for (let item of root.querySelectorAll(selectors.menuItem)) {
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
    products.push({ path, data: await getDataForPath(path, 0, []) })
  }

  for (const section of products) {
    for (const record of section.data) {
      const recordInfo = getRecordInfo(record)
      console.log(recordInfo.title)
      console.log(recordInfo.url)
      console.log(recordInfo.price)
      console.log(recordInfo.img)
    }
  }
}

callBish()
