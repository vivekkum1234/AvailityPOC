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

    // Hardcoded payers matching the Dashboard - all shown as assigned for MVP
    const payers: Payer[] = [
      {
        id: '1',
        name: 'Aetna Health Insurance',
        organizationId: 'ORG-001',
        isAssigned: true
      },
      {
        id: '2',
        name: 'Blue Cross Blue Shield',
        organizationId: 'ORG-002',
        isAssigned: true
      },
      {
        id: '3',
        name: 'UnitedHealthcare',
        organizationId: 'ORG-003',
        isAssigned: true
      },
      {
        id: '4',
        name: 'Cigna Health',
        organizationId: 'ORG-004',
        isAssigned: true
      },
      {
        id: '5',
        name: 'Humana Inc',
        organizationId: 'ORG-005',
        isAssigned: true
      }
    ];

    const response: ProductMappingResponse = {
      productType,
      payers,
      stats: {
        total: 5,
        assigned: 5 // All 5 payers assigned for MVP demo
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
router.post('/:productType', async (req, res): Promise<void> => {
  try {
    const { productType } = req.params;
    const { organizationIds } = req.body;

    if (!Array.isArray(organizationIds)) {
      res.status(400).json({ error: 'organizationIds must be an array' });
      return;
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

