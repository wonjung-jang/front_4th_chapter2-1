import { CartItemInfo } from "./CartItemInfo";

export function CartItem(product) {
  return `
      <div id="${product.id}" class="flex justify-between items-center mb-2">
        ${CartItemInfo({ name: product.name, price: product.price })}
        <div>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${product.id}" data-change="-1">-</button>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${product.id}" data-change="1">+</button>
          <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="${product.id}">삭제</button>
        </div>
      </div>
    `;
}
