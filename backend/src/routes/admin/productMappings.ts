import { Router } from 'express';
import { supabase } from '../../services/supabaseService';

const router = Router();

interface Payer {
  id: string;
  name: string;
  organizationId: string;
  isAssigned: boolean;
}

interface ProductMappingResponse {
  productType: string;
  payers: Payer[];
  stats: {
    total: number;
    assigned: number;
  };
}

/**
 * GET /api/admin/product-mappings/:productType
 * Get all payers with assignment status for a specific product
 */
router.get('/:productType', async (req, res) => {
  try {
    const { productType } = req.params;

    // Hardcoded single Aetna payer for MVP - always shown as assigned
    const AETNA_ORG_ID = '4bc8476a-3dd0-4830-8704-ad98b26f8f82';

    // Single Aetna payer - always assigned for demo
    const payers: Payer[] = [{
      id: AETNA_ORG_ID,
      name: 'Aetna',
      organizationId: AETNA_ORG_ID,
      isAssigned: true // Always assigned for MVP demo
    }];

    const response: ProductMappingResponse = {
      productType,
      payers,
      stats: {
        total: 1,
        assigned: 1 // Always 1 for MVP demo
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in GET /product-mappings/:productType:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/product-mappings/:productType
 * Update product assignments for a specific product type (UI only for MVP)
 * Body: { organizationIds: string[] }
 */
router.post('/:productType', async (req, res) => {
  try {
    const { productType } = req.params;
    const { organizationIds } = req.body;

    if (!Array.isArray(organizationIds)) {
      return res.status(400).json({ error: 'organizationIds must be an array' });
    }

    // For MVP: Just return success without persisting
    // The UI will show Aetna as assigned
    res.json({
      success: true,
      productType,
      assignedCount: organizationIds.length
    });
  } catch (error) {
    console.error('Error in POST /product-mappings/:productType:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/products
 * Get all available products (top 5 transaction types)
 */
router.get('/', async (req, res) => {
  try {
    // Hardcoded top 5 products for MVP
    const products = [
      {
        type: '270/271',
        name: 'E&B (270/271)',
        status: 'published'
      },
      {
        type: '837',
        name: 'Claim Entry (837/P/D)',
        status: 'published'
      },
      {
        type: '835',
        name: 'Remittance (835)',
        status: 'published'
      },
      {
        type: '276/277',
        name: 'Claim Status (276/277)',
        status: 'published'
      },
      {
        type: '278',
        name: 'Auth/ Referral Submission/ Inquiry (278)',
        status: 'published'
      }
    ];

    res.json(products);
  } catch (error) {
    console.error('Error in GET /products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

