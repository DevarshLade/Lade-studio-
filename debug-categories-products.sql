-- Debug script to check categories and products relationship

-- Check if categories table has data
SELECT 'categories' as table_name, COUNT(*) as count FROM categories;
SELECT 'products' as table_name, COUNT(*) as count FROM products;

-- Check the actual structure of the products table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check the actual structure of the categories table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'categories' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check categories data
SELECT id, name, is_active FROM categories ORDER BY name;

-- Check products with category (enum)
SELECT 
    id,
    name,
    category,
    category_id
FROM products
ORDER BY name
LIMIT 20;

-- Check for products without category
SELECT 
    id,
    name,
    category,
    category_id
FROM products 
WHERE category IS NULL
ORDER BY name
LIMIT 10;