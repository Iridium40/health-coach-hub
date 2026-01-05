-- Add required_rank column to training_categories table
-- This allows restricting category access based on coach rank

ALTER TABLE public.training_categories 
ADD COLUMN IF NOT EXISTS required_rank TEXT NULL;

COMMENT ON COLUMN public.training_categories.required_rank IS 'Minimum coach rank required to access this category. NULL means all ranks can access.';

-- Valid ranks: Coach, SC, MG, AD, DR, ED, IED, FIBC, IGD, FIBL, IND, IPD
-- The rank hierarchy is roughly: Coach < SC < MG < AD < DR < ED < IED < FIBC < IGD < FIBL < IND < IPD
