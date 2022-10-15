export const selectors = {
  menuItem: '.root-eshop-menu > .leftmenuDef a',
  product: '.productBody',
  nextPage: '[rel="next"]',
  title: '.productTitleContent a',
  price: '.product_price_text',
  img: '.img_box a img:first-of-type',
}

export const getRecordInfo = (dom) => {
  return {
    title: dom.querySelector(selectors.title).textContent,
    url: dom.querySelector(selectors.title).rawAttributes.href,
    price: dom.querySelector(selectors.price).textContent,
    img: dom.querySelector(selectors.img).src,
  }
}
