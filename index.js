import axios from "axios";
import { parse } from "node-html-parser";
const BASE_URL = "https://www.vinylbazar.net/";

const callBish = async () => {
  const response = await axios.get(BASE_URL + "pop-rock-cz-sk");

  if (!response || !response.data) {
    return;
  }
  const root = parse(response.data);

  const els = root.querySelectorAll(".productBody");
  els.forEach((element) => {
    console.log(element.querySelector(".productTitleContent a").text);
    console.log(
      element.querySelector(".productTitleContent a").rawAttributes.href
    );
    console.log(element.querySelector(".product_price_text").text);
  });
};

callBish();
