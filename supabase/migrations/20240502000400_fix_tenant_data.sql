-- DATA RECOVERY SCRIPT
-- This script fixes existing tenants that have null niche or wrong colors

-- 1. Try to guess niche from name if it's null
UPDATE tenants 
SET niche = 'PERSONAL' 
WHERE niche IS NULL AND (LOWER(name) LIKE '%personal%' OR LOWER(name) LIKE '%treino%' OR LOWER(name) LIKE '%academia%');

UPDATE tenants 
SET niche = 'CLINIC' 
WHERE niche IS NULL AND (LOWER(name) LIKE '%clinica%' OR LOWER(name) LIKE '%saude%' OR LOWER(name) LIKE '%vitality%');

UPDATE tenants 
SET niche = 'PETSHOP' 
WHERE niche IS NULL AND (LOWER(name) LIKE '%pet%' OR LOWER(name) LIKE '%animal%' OR LOWER(name) LIKE '%cachorro%');

UPDATE tenants 
SET niche = 'SALON' 
WHERE niche IS NULL AND (LOWER(name) LIKE '%salao%' OR LOWER(name) LIKE '%beleza%' OR LOWER(name) LIKE '%barbearia%');

-- 2. Fallback: If still null, default to PERSONAL (or whatever the user mostly uses)
UPDATE tenants SET niche = 'PERSONAL' WHERE niche IS NULL;

-- 3. Sync colors based on niche
UPDATE tenants SET primary_color = '#22c55e' WHERE niche = 'PERSONAL';
UPDATE tenants SET primary_color = '#00a3ff' WHERE niche = 'CLINIC';
UPDATE tenants SET primary_color = '#f59e0b' WHERE niche = 'PETSHOP';
UPDATE tenants SET primary_color = '#be185d' WHERE niche = 'SALON';
