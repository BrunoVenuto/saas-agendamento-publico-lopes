-- FORCE SYNC COLORS TO ORIGINAL NICHE THEMES
-- Run this in your Supabase SQL Editor to fix existing accounts

UPDATE tenants SET primary_color = '#22c55e' WHERE niche = 'PERSONAL';
UPDATE tenants SET primary_color = '#00a3ff' WHERE niche = 'CLINIC';
UPDATE tenants SET primary_color = '#f59e0b' WHERE niche = 'PETSHOP';
UPDATE tenants SET primary_color = '#be185d' WHERE niche = 'SALON';
