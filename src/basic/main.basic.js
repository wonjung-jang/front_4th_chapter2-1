import { CartItem, ItemOption } from "./components";
import MainPage from "./pages/MainPage";

/**
 * 장바구니
 */
const shoppingCart = [];
let shoppingCartTotal = 0;

const calcCart = () => {
  shoppingCartTotal = 0;
  let itemCnt = 0;
  const cartItems = document.querySelector("#cart-items").children;
  const sum = document.querySelector("#cart-total");
  let subTot = 0;
  let discRate = 0;

  [...cartItems].forEach((item) => {
    const curItem = PRODUCTS.find((prod) => prod.id === item.id);
    const curQuantity = parseInt(
      item.querySelector("span").textContent.split("x ")[1]
    );
    const itemTotalPrice = curItem.price * curQuantity;
    itemCnt += curQuantity;
    subTot += itemTotalPrice;
    let discount = 1;
    if (curQuantity >= 10) {
      discount = 1 - curItem.discount;
    }
    shoppingCartTotal += itemTotalPrice * discount;
  });

  if (itemCnt >= 30) {
    const bulkDisc = shoppingCartTotal * 0.25;
    const itemDisc = subTot - shoppingCartTotal;
    if (bulkDisc > itemDisc) {
      shoppingCartTotal = subTot * (1 - 0.25);
      discRate = 0.25;
    } else {
      discRate = (subTot - shoppingCartTotal) / subTot;
    }
  } else {
    discRate = (subTot - shoppingCartTotal) / subTot;
  }

  if (new Date().getDay() === 2) {
    shoppingCartTotal *= 1 - 0.1;
    discRate = Math.max(discRate, 0.1);
  }

  sum.innerHTML = `총액: ${Math.round(shoppingCartTotal)}원`;

  if (discRate > 0) {
    sum.innerHTML += `<span class="text-green-500 ml-2">(${(
      discRate * 100
    ).toFixed(1)}% 할인 적용)</span>`;
  }

  updateStockStatus();
  renderBonusPts();
};

const renderBonusPts = () => {
  const bonusPts = Math.floor(shoppingCartTotal / 1000);
  const cartTotalElem = document.querySelector("#cart-total");
  let ptsTag = document.getElementById("loyalty-points");
  if (!ptsTag) {
    appendContent(cartTotalElem)(
      `<span id="loyalty-points" class="text-blue-500 ml-2"></span>`
    );
    ptsTag = cartTotalElem.querySelector("#loyalty-points");
  }
  renderContent(ptsTag)(`(포인트: ${bonusPts})`);
};

const addToCartClickHandler = () => {
  const sel = document.querySelector("#product-select");
  const cartItems = document.querySelector("#cart-items");
  const selItem = sel.value;
  const itemToAdd = PRODUCTS.find((p) => p.id === selItem);

  if (itemToAdd && itemToAdd.quantity > 0) {
    const item = document.getElementById(itemToAdd.id);
    if (item) {
      const newQty =
        parseInt(item.querySelector("span").textContent.split("x ")[1]) + 1;
      if (newQty <= itemToAdd.quantity) {
        item.querySelector("span").textContent =
          itemToAdd.name + " - " + itemToAdd.price + "원 x " + newQty;
        itemToAdd.quantity--;
      } else {
        alert("재고가 부족합니다.");
      }
    } else {
      appendContent(cartItems)(CartItem(itemToAdd));
      itemToAdd.quantity--;
    }
    calcCart();
    lastSel = selItem;
  }
};

const cartItemsClickHandler = (event) => {
  const { classList, dataset } = event.target;

  if (classList.contains("quantity-change")) {
    quantityChange(dataset);
  }

  if (classList.contains("remove-item")) {
    removeItem(dataset);
  }

  calcCart();
};

const getProdData = (productId) => {
  const prod = PRODUCTS.find((p) => p.id === productId);
  const itemElem = document.getElementById(productId);
  const [itemPrice, curQuantity] = itemElem
    .querySelector("span")
    .textContent.split("x ");

  return { prod, itemElem, itemPrice, curQuantity: parseInt(curQuantity) };
};

const quantityChange = ({ productId, change }) => {
  const qtyChange = parseInt(change);
  const { prod, itemElem, itemPrice, curQuantity } = getProdData(productId);
  const newQty = curQuantity + qtyChange;
  const totalQty = prod.quantity + curQuantity;

  if (newQty > 0 && newQty <= totalQty) {
    itemElem.querySelector("span").textContent = itemPrice + "x " + newQty;
    prod.quantity -= qtyChange;
    return;
  }

  if (newQty <= 0) {
    itemElem.remove();
    prod.quantity -= qtyChange;
    return;
  }

  alert("재고가 부족합니다.");
};

const removeItem = ({ productId }) => {
  const { prod, itemElem, curQuantity } = getProdData(productId);

  prod.quantity += curQuantity;
  itemElem.remove();
};

/**
 * 전체 상품
 */
const PRODUCTS = [
  { id: "p1", name: "상품1", price: 10000, quantity: 50, discount: 0.1 },
  { id: "p2", name: "상품2", price: 20000, quantity: 30, discount: 0.15 },
  { id: "p3", name: "상품3", price: 30000, quantity: 20, discount: 0.2 },
  { id: "p4", name: "상품4", price: 15000, quantity: 0, discount: 0.05 },
  { id: "p5", name: "상품5", price: 25000, quantity: 10, discount: 0.25 },
];

const isLowStock = (product) => product.quantity < 5;

const makeLowStockMessage = (product) => {
  return `${product.name}: ${
    product.quantity > 0
      ? "재고 부족 (" + product.quantity + "개 남음)"
      : "품절"
  }\n`;
};

const updateSelOpts = () => {
  renderContent(document.querySelector("#product-select"))(
    PRODUCTS.map(ItemOption)
  );
};

const updateStockStatus = () => {
  renderContent(document.querySelector("#stock-status"))(
    PRODUCTS.filter(isLowStock).map(makeLowStockMessage).join("")
  );
};

/**
 * 공통 로직
 */
let lastSel = 0;

const renderContent = (target) => {
  return (page) => {
    target.innerHTML = page;
  };
};

const appendContent = (target) => {
  return (page) => {
    target.innerHTML += page;
  };
};

const alertEvent = (callback, intervalMs, delayMs) => {
  setTimeout(() => {
    setInterval(callback, intervalMs);
  }, Math.random() * delayMs);
};

const saleEvent = () => {
  const luckyItem = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  if (Math.random() < 0.3 && luckyItem.quantity > 0) {
    luckyItem.price = Math.round(luckyItem.price * 0.8);
    alert("번개세일! " + luckyItem.name + "이(가) 20% 할인 중입니다!");
    updateSelOpts();
  }
};

const lastSelEvent = () => {
  if (lastSel) {
    const suggest = PRODUCTS.find((item) => {
      return item.id !== lastSel && item.quantity > 0;
    });
    if (suggest) {
      alert(suggest.name + "은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!");
      suggest.price = Math.round(suggest.price * 0.95);
      updateSelOpts();
    }
  }
};

const main = () => {
  const root = document.querySelector("#app");
  renderContent(root)(MainPage());

  updateSelOpts();
  calcCart();

  alertEvent(saleEvent, 30000, Math.random() * 10000);
  alertEvent(lastSelEvent, 60000, Math.random() * 20000);

  document
    .querySelector("#add-to-cart")
    .addEventListener("click", addToCartClickHandler);
  document
    .querySelector("#cart-items")
    .addEventListener("click", cartItemsClickHandler);
};

main();
