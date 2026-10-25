# Entity-Relationship (ER) Diagram

## Database Design (Normalized to 3NF)
This database schema models all entities for the **AI Powered E-Commerce Customer Intelligence and Personalized Recommendation Platform** (B.Tech Minor Project, Poornima University).

```mermaid
erDiagram
    USER ||--o{ ADDRESS : "has many (1:N)"
    USER ||--o| CART : "owns (1:1)"
    USER ||--o{ ORDER : "places (1:N)"
    USER ||--o{ REVIEW : "writes (1:N)"
    USER ||--o{ USER_PREFERENCE : "configures (1:N)"
    USER ||--o{ USER_INTERACTION : "generates (1:N)"
    USER ||--o{ RECOMMENDATION : "receives (1:N)"

    CATEGORY ||--o{ CATEGORY : "parent_of (1:N)"
    CATEGORY ||--o{ PRODUCT : "contains (1:N)"

    PRODUCT ||--o{ PRODUCT_SPECIFICATION : "described by (1:N)"
    PRODUCT ||--o{ REVIEW : "reviewed in (1:N)"
    PRODUCT ||--o{ CART_ITEM : "in (1:N)"
    PRODUCT ||--o{ ORDER_ITEM : "ordered in (1:N)"
    PRODUCT ||--o{ USER_INTERACTION : "target of (1:N)"

    CART ||--o{ CART_ITEM : "contains (1:N)"
    ORDER ||--o{ ORDER_ITEM : "contains (1:N)"
    ADDRESS ||--o{ ORDER : "delivered to (1:N)"

    PRODUCT ||--o{ COMPARISON : "compared as Product A"
    PRODUCT ||--o{ COMPARISON : "compared as Product B"

    USER {
        int id PK
        string email UK
        string hashed_password
        string full_name
        string role
        datetime created_at
    }

    CATEGORY {
        int id PK
        string name UK
        string slug UK
        string description
        int parent_category_id FK
    }

    PRODUCT {
        int id PK
        int category_id FK
        string brand
        string model_name
        string title
        text description
        float price
        int stock
        boolean is_available
        int warranty_months
        string image_url
        datetime created_at
    }

    PRODUCT_SPECIFICATION {
        int id PK
        int product_id FK
        string name
        string raw_value
        string unit
        float numeric_value
        boolean is_benefit
    }

    REVIEW {
        int id PK
        int product_id FK
        int user_id FK
        int rating
        text review_text
        float sentiment_score
        string sentiment_label
        string aspect_tags
        datetime created_at
    }

    ADDRESS {
        int id PK
        int user_id FK
        string label
        string recipient_name
        string phone
        string address_line
        string landmark
        string city
        string state
        string pincode
        float latitude
        float longitude
        string source
        boolean is_default
        datetime created_at
    }

    SERVICEABLE_AREA {
        int id PK
        string pincode UK
        string area_name
        string city
        string state
        int estimated_delivery_days
        boolean is_active
        datetime created_at
    }

    CART {
        int id PK
        int user_id FK,UK
        datetime created_at
        datetime updated_at
    }

    CART_ITEM {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
        datetime added_at
    }

    ORDER {
        int id PK
        int user_id FK
        int address_id FK
        datetime order_date
        string status
        string payment_status
        float subtotal
        float delivery_fee
        float total_amount
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        float unit_price
        float total_price
    }

    COMPARISON {
        int id PK
        int product_a_id FK
        int product_b_id FK
        int user_id FK
        text criteria_weights
        float score_a
        float score_b
        text ai_summary
        datetime created_at
    }

    USER_PREFERENCE {
        int id PK
        int user_id FK
        string criterion
        int weight_priority
    }

    USER_INTERACTION {
        int id PK
        int user_id FK
        int product_id FK
        string event_type
        datetime event_time
    }

    RECOMMENDATION {
        int id PK
        int user_id FK
        int product_id FK
        float score
        text reason
        datetime generated_at
    }
```
