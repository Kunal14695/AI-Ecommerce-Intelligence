from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Cart, UserPreference
from ..schemas.auth import UserRegister, UserLogin, TokenResponse, UserProfile, UserPreferenceUpdate
from ..services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == user_data.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    # Restrict admin registration unless specifically designated or existing admin
    role = "customer"
    if user_data.role == "admin" and "admin" in user_data.email.lower():
        role = "admin"

    new_user = User(
        email=user_data.email.lower().strip(),
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name.strip(),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize user cart
    db.add(Cart(user_id=new_user.id))
    db.commit()

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prefs = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).all()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "preferences": [{"criterion": p.criterion, "weight_priority": p.weight_priority} for p in prefs]
    }

@router.put("/preferences")
def update_preferences(
    pref_data: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Remove old preferences
    db.query(UserPreference).filter(UserPreference.user_id == current_user.id).delete()
    for item in pref_data.preferences:
        db.add(UserPreference(
            user_id=current_user.id,
            criterion=item.criterion,
            weight_priority=item.weight_priority
        ))
    db.commit()
    return {"message": "Preferences updated successfully"}
