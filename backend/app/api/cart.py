from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Cart, CartItem, Product, User
from ..schemas.order import CartItemAdd, CartItemUpdate, CartRead
from ..services.auth_service import get_current_user
from .products import format_product_dict

router = APIRouter(prefix="/api/cart", tags=["Cart Management"])

def get_or_create_user_cart(user_id: int, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def format_cart_dict(cart: Cart) -> dict:
    formatted_items = []
    subtotal = 0.0
    for item in cart.items:
        prod_dict = format_product_dict(item.product)
        item_total = item.quantity * item.product.price
        subtotal += item_total
        formatted_items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "product": prod_dict,
        })
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": formatted_items,
        "total_items": sum(i["quantity"] for i in formatted_items),
        "subtotal": round(subtotal, 2),
    }

@router.get("", response_model=CartRead)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_or_create_user_cart(current_user.id, db)
    return format_cart_dict(cart)

@router.post("/items")
def add_to_cart(
    item_in: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    if not prod.is_available or prod.stock < item_in.quantity:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available stock")

    cart = get_or_create_user_cart(current_user.id, db)
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_in.product_id
    ).first()

    if existing_item:
        new_qty = existing_item.quantity + item_in.quantity
        if new_qty > prod.stock:
            raise HTTPException(status_code=400, detail=f"Cannot add more than {prod.stock} items to cart")
        existing_item.quantity = new_qty
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return format_cart_dict(cart)

@router.put("/items/{item_id}")
def update_cart_item(
    item_id: int,
    item_up: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_user_cart(current_user.id, db)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    prod = db.query(Product).filter(Product.id == item.product_id).first()
    if item_up.quantity > prod.stock:
        raise HTTPException(status_code=400, detail=f"Only {prod.stock} items currently in stock")

    item.quantity = item_up.quantity
    db.commit()
    db.refresh(cart)
    return format_cart_dict(cart)

@router.delete("/items/{item_id}")
def delete_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_user_cart(current_user.id, db)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    db.refresh(cart)
    return format_cart_dict(cart)

@router.delete("/clear")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_user_cart(current_user.id, db)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    return {"message": "Cart cleared"}
