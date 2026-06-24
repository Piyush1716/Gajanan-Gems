## Table `products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `title` | `text` |  |
| `slug` | `text` |  Nullable Unique |
| `description` | `text` |  Nullable |
| `price` | `numeric` |  |
| `old_price` | `numeric` |  Nullable |
| `image_url` | `text` |  |
| `created_at` | `timestamptz` |  |
| `category_id` | `int8` |  Nullable |
| `available` | `bool` |  |
| `bestseller` | `bool` |  |

## Table `categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `name` | `text` |  Unique |
| `slug` | `text` |  Unique |
| `image_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `available` | `bool` |  |

## Table `orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `first_name` | `text` |  |
| `last_name` | `text` |  |
| `email` | `text` |  |
| `phone` | `text` |  |
| `address` | `text` |  |
| `city` | `text` |  |
| `state` | `text` |  |
| `pin` | `text` |  |
| `country` | `text` |  |
| `notes` | `text` |  Nullable |
| `subtotal` | `numeric` |  |
| `shipping` | `numeric` |  |
| `total` | `numeric` |  |
| `payment_method` | `text` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `payment_error` | `text` |  Nullable |
| `razorpay_payment_id` | `text` |  Nullable |
| `payment_retry_count` | `int4` |  Nullable |
| `last_payment_attempt_at` | `timestamptz` |  Nullable |

## Table `order_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `order_id` | `int8` |  |
| `product_id` | `int8` |  Nullable |
| `slug` | `text` |  |
| `title` | `text` |  |
| `price` | `numeric` |  |
| `qty` | `int4` |  |
| `size` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `product_images`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `product_id` | `int8` |  |
| `image_url` | `text` |  |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `customers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `first_name` | `text` |  |
| `last_name` | `text` |  |
| `email` | `text` |  Unique |
| `phone` | `text` |  |
| `address` | `text` |  |
| `city` | `text` |  |
| `state` | `text` |  |
| `pin` | `text` |  |
| `country` | `text` |  |
| `total_orders` | `int4` |  |
| `total_spent` | `numeric` |  |
| `last_order_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `payment_attempts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `order_id` | `int8` |  |
| `attempt_number` | `int4` |  |
| `status` | `text` |  |
| `error_message` | `text` |  Nullable |
| `razorpay_payment_id` | `text` |  Nullable |
| `razorpay_order_id` | `text` |  Nullable |
| `payment_response` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `contact_submissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `name` | `text` |  |
| `email` | `text` |  |
| `phone` | `text` |  Nullable |
| `message` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `special_inquiries`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `email` | `text` |  |
| `phone` | `text` |  Nullable |
| `message` | `text` |  |
| `inquiry_type` | `text` |  |
| `created_at` | `timestamptz` |  |

