-- ============================================================
-- Optional demo data
-- Run after supabase/schema.sql to make the marketplace look alive.
-- Safe to run more than once.
-- ============================================================

insert into public.listings
  (id, title, description, price, category, seller_email, image_url, location, created_at)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'MacBook Air M2 · 13" · 256GB',
    E'Barely used MacBook Air M2 (2022), 8GB RAM / 256GB SSD in midnight. Battery health 94%, 112 cycles. Comes with the original charger and box.\n\nNo dents or scratches, always kept in a sleeve. Selling because I upgraded for work.',
    749.00,
    'Electronics',
    'alex.rivera@example.com',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    'Palo Alto, CA',
    now() - interval '2 hours'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Vintage leather armchair',
    E'Mid-century armchair in cognac leather. Solid walnut frame, newly conditioned leather, very comfortable.\n\nSome honest patina on the armrests. Pickup only — it fits in a hatchback with the seats down.',
    180.00,
    'Home Goods',
    'maya.chen@example.com',
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
    'Mountain View, CA',
    now() - interval '5 hours'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Sony WH-1000XM4 headphones',
    E'Noise-cancelling over-ear headphones with the carrying case, USB-C cable and airplane adapter. Pads are clean, no cracking.\n\nBought last year, used mostly on flights.',
    145.00,
    'Electronics',
    'dan.okafor@example.com',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    'Sunnyvale, CA',
    now() - interval '8 hours'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Ceramic table lamp with linen shade',
    E'Warm, hand-thrown ceramic base with a natural linen shade. Rewired with a new cord and switch, works perfectly.\n\n18" tall, perfect for a bedside table.',
    35.00,
    'Home Goods',
    'priya.nair@example.com',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
    'Palo Alto, CA',
    now() - interval '1 day'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Specialized Allez road bike · 54cm',
    E'Aluminum frame with carbon fork, Shimano Tiagra groupset. Recently serviced: new chain, brake pads and bar tape.\n\nFits riders around 5''7"–5''10". Includes bottle cages.',
    420.00,
    'Sporting Goods',
    'jonah.lee@example.com',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80',
    'Redwood City, CA',
    now() - interval '1 day 4 hours'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Nike Air Max 90 · US 10',
    E'White and grey Air Max 90s, worn maybe five times. Clean soles, no creasing on the toe box.\n\nComes with the original box.',
    65.00,
    'Apparel',
    'sam.torres@example.com',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    'Menlo Park, CA',
    now() - interval '2 days'
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'Stack of art & design books',
    E'Seven hardcover books on typography, mid-century design and photography. All in great shape, from a smoke-free home.\n\nHappy to split the lot — message me for titles.',
    25.00,
    'Hobbies',
    'elena.fischer@example.com',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    'Palo Alto, CA',
    now() - interval '2 days 6 hours'
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'Nintendo Switch OLED + 3 games',
    E'Switch OLED in white with the dock, both Joy-Cons and cables. Includes Mario Kart 8 Deluxe, Zelda: Tears of the Kingdom and Hades.\n\nScreen has a protector installed since day one.',
    210.00,
    'Toys & Games',
    'chris.bauer@example.com',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80',
    'Los Altos, CA',
    now() - interval '3 days'
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'Fender acoustic guitar with case',
    E'Fender CD-60S dreadnought, solid spruce top. Fresh strings, low action, no cracks or buzzing.\n\nIncludes a padded gig bag, capo and a dozen picks.',
    150.00,
    'Musical Instruments',
    'noah.kim@example.com',
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80',
    'Palo Alto, CA',
    now() - interval '4 days'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Monstera deliciosa in ceramic pot',
    E'Healthy monstera, about 3 feet tall with two new leaves unfurling. Comes in a matte white ceramic pot with a saucer.\n\nToo big for my new apartment — needs a sunny corner.',
    40.00,
    'Garden & Outdoor',
    'lily.zhang@example.com',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80',
    'Palo Alto, CA',
    now() - interval '5 days'
  )
on conflict (id) do nothing;
