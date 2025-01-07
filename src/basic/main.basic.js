let lastSel = 0;
let bonusPts = 0;
let totalAmt = 0;
let itemCnt = 0;

const PRODUCTS = [
  { id: "p1", name: "상품1", price: 10000, quantity: 50 },
  { id: "p2", name: "상품2", price: 20000, quantity: 30 },
  { id: "p3", name: "상품3", price: 30000, quantity: 20 },
  { id: "p4", name: "상품4", price: 15000, quantity: 0 },
  { id: "p5", name: "상품5", price: 25000, quantity: 10 },
];

function MainPage() {
  return `
    <div id="cont" class="bg-gray-100 p-8">
      <div id="wrap class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 class="text-2xl font-bold mb-4">장바구니</h1>
        <div id="cart-items"></div>
        <div id="cart-total" class="text-xl font-bold my-4"></div>
        <select id="product-select" class="text-xl font-bold my-4"></select>
        <button id="add-to-cart" class="bg-blue-500 text-white px-4 py-2 rounded">추가</button>
        <div id="stock-status" class="text-sm text-gray-500 mt-2"></div>
      </div>
    </div>
  `;
}

function Item(product) {
  return `
    <div id="${product.id}" class="flex justify-between items-center mb-2">
      <span>${product.name} - ${product.price}원 x 1</span>
      <div>
        <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${product.id}" data-change="-1">-</button>
        <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${product.id}" data-change="1">+</button>
        <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="${product.id}">삭제</button>
      </div>
    </div>
  `;
}

function ItemOption(item) {
  return `<option value="${item.id}" ${item.quantity === 0 ? "disabled" : ""}>${
    item.name
  } - ${item.price}원</option>`;
}

const render = (target) => {
  return (page) => {
    target.innerHTML = page;
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
  render(root)(MainPage());

  updateSelOpts();
  calcCart();

  alertEvent(saleEvent, 30000, Math.random() * 10000);
  alertEvent(lastSelEvent, 60000, Math.random() * 20000);
};

const updateSelOpts = () => {
  const sel = document.querySelector("#product-select");
  const options = PRODUCTS.map((item) => ItemOption(item));
  render(sel)(options);
};

const calcCart = () => {
  totalAmt = 0;
  itemCnt = 0;
  const cartDisp = document.querySelector("#cart-items");
  const sum = document.querySelector("#cart-total");
  const cartItems = cartDisp.children;
  let subTot = 0;
  for (let i = 0; i < cartItems.length; i++) {
    let curItem;
    for (let j = 0; j < PRODUCTS.length; j++) {
      if (PRODUCTS[j].id === cartItems[i].id) {
        curItem = PRODUCTS[j];
        break;
      }
    }
    const q = parseInt(
      cartItems[i].querySelector("span").textContent.split("x ")[1]
    );
    const itemTot = curItem.price * q;
    let disc = 0;
    itemCnt += q;
    subTot += itemTot;
    if (q >= 10) {
      if (curItem.id === "p1") disc = 0.1;
      else if (curItem.id === "p2") disc = 0.15;
      else if (curItem.id === "p3") disc = 0.2;
      else if (curItem.id === "p4") disc = 0.05;
      else if (curItem.id === "p5") disc = 0.25;
    }
    totalAmt += itemTot * (1 - disc);
  }
  let discRate = 0;
  if (itemCnt >= 30) {
    const bulkDisc = totalAmt * 0.25;
    const itemDisc = subTot - totalAmt;
    if (bulkDisc > itemDisc) {
      totalAmt = subTot * (1 - 0.25);
      discRate = 0.25;
    } else {
      discRate = (subTot - totalAmt) / subTot;
    }
  } else {
    discRate = (subTot - totalAmt) / subTot;
  }
  if (new Date().getDay() === 2) {
    totalAmt *= 1 - 0.1;
    discRate = Math.max(discRate, 0.1);
  }
  sum.textContent = "총액: " + Math.round(totalAmt) + "원";
  if (discRate > 0) {
    sum.innerHTML += `<span class="text-green-500 ml-2">(${(
      discRate * 100
    ).toFixed(1)}% 할인 적용)</span>`;
  }
  updateStockInfo();
  renderBonusPts();
};

const renderBonusPts = () => {
  bonusPts = Math.floor(totalAmt / 1000);
  const sum = document.querySelector("#cart-total");
  let ptsTag = document.getElementById("loyalty-points");
  if (!ptsTag) {
    sum.innerHTML += `<span id="loyalty-points" class="text-blue-500 ml-2"></span>`;
    ptsTag = sum.querySelector("#loyalty-points");
  }
  ptsTag.innerHTML = `(포인트: ${bonusPts})`;
};

const updateStockInfo = () => {
  let infoMsg = "";
  const stockInfo = document.querySelector("#stock-status");
  PRODUCTS.forEach((item) => {
    if (item.quantity < 5) {
      infoMsg += `${item.name}: ${
        item.quantity > 0 ? "재고 부족 (" + item.quantity + "개 남음)" : "품절"
      }\n`;
    }
  });
  stockInfo.innerHTML = infoMsg;
};

main();

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
      render(cartItems)(Item(itemToAdd));
      itemToAdd.quantity--;
    }
    calcCart();
    lastSel = selItem;
  }
};

document
  .querySelector("#add-to-cart")
  .addEventListener("click", addToCartClickHandler);

const cartItemsClickHandler = (event) => {
  const { classList, dataset } = event.target;
  if (classList.contains("quantity-change")) {
    quantityChange(dataset);
  } else if (classList.contains("remove-item")) {
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

document
  .querySelector("#cart-items")
  .addEventListener("click", cartItemsClickHandler);
