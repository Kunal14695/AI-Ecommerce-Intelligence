from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Address, User
from ..schemas.location import AddressCreate, AddressUpdate, AddressRead
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/api/addresses", tags=["Address Management"])

@router.get("", response_model=List[AddressRead])
def get_user_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()

@router.post("", response_model=AddressRead)
def create_address(
    addr_data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If set to default, unset other addresses
    if addr_data.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})

    # First address is automatically default
    count = db.query(Address).filter(Address.user_id == current_user.id).count()
    is_def = addr_data.is_default or (count == 0)

    # De-duplication check: avoid creating identical address for same user
    existing = db.query(Address).filter(
        Address.user_id == current_user.id,
        Address.address_line == addr_data.address_line.strip(),
        Address.pincode == addr_data.pincode.strip()
    ).first()
    if existing:
        return existing

    new_addr = Address(
        user_id=current_user.id,
        label=addr_data.label,
        recipient_name=addr_data.recipient_name.strip(),
        phone=addr_data.phone.strip(),
        address_line=addr_data.address_line.strip(),
        landmark=addr_data.landmark.strip() if addr_data.landmark else None,
        city=addr_data.city.strip(),
        state=addr_data.state.strip(),
        pincode=addr_data.pincode.strip(),
        latitude=addr_data.latitude,
        longitude=addr_data.longitude,
        source=addr_data.source,
        is_default=is_def,
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return new_addr

@router.put("/{address_id}", response_model=AddressRead)
def update_address(
    address_id: int,
    addr_data: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    addr = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id
    ).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found or unauthorized")

    if addr_data.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})

    for key, val in addr_data.dict(exclude_unset=True).items():
        setattr(addr, key, val)

    db.commit()
    db.refresh(addr)
    return addr

@router.delete("/{address_id}")
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    addr = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id
    ).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found or unauthorized")

    db.delete(addr)
    db.commit()
    return {"message": "Address deleted successfully"}
