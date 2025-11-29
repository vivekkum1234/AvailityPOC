import express from 'express';
import { supabaseService, supabase } from '../../services/supabaseService';
import { requireAdmin } from '../../middleware/adminAuth';
import { createError } from '../../middleware/errorHandler';

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

/**
 * GET /api/admin/questionnaire-templates
 * Get all questionnaire templates (all statuses)
 */
router.get('/', async (req, res, next) => {
  try {
    const { transaction_type } = req.query;

    let templates;
    if (transaction_type) {
      templates = await supabaseService.getQuestionnaireTemplatesByType(transaction_type as string);
    } else {
      // Get all templates
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to get templates: ${error.message}`);
      templates = data || [];
    }

    res.json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/admin/questionnaire-templates/:id/versions
 * Get version history for a template
 */
router.get('/:id/versions', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('questionnaire_versions')
      .select(`
        *,
        created_by_user:users!questionnaire_versions_created_by_fkey(first_name, last_name)
      `)
      .eq('template_id', id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get version history: ${error.message}`);

    // Format the response to include created_by_name
    const versions = (data || []).map((version: any) => ({
      id: version.id,
      template_id: version.template_id,
      version: version.version,
      config: version.config,
      changes_summary: version.changes_summary,
      created_by: version.created_by,
      created_at: version.created_at,
      created_by_name: version.created_by_user
        ? `${version.created_by_user.first_name} ${version.created_by_user.last_name}`.trim()
        : 'System'
    }));

    res.json({
      success: true,
      data: versions
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/admin/questionnaire-templates/:id
 * Get specific template by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await supabaseService.getQuestionnaireTemplate(id);

    if (!template) {
      throw createError('Template not found', 404);
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/admin/questionnaire-templates
 * Create new template (draft)
 */
router.post('/', async (req, res, next) => {
  try {
    const { transaction_type, version, config } = req.body;
    const userId = (req as any).user.id;

    if (!transaction_type || !version || !config) {
      throw createError('Missing required fields: transaction_type, version, config', 400);
    }

    const template = await supabaseService.createQuestionnaireTemplate({
      transaction_type,
      version,
      status: 'draft',
      config,
      created_by: userId
    });

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/admin/questionnaire-templates/:id
 * Update template (draft only)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { config, version } = req.body;

    // Get existing template
    const existing = await supabaseService.getQuestionnaireTemplate(id);
    if (!existing) {
      throw createError('Template not found', 404);
    }

    // Only allow editing drafts
    if (existing.status !== 'draft') {
      throw createError('Can only edit draft templates. Create a new version to modify published templates.', 400);
    }

    const updates: any = {};
    if (config) updates.config = config;
    if (version) updates.version = version;

    const updated = await supabaseService.updateQuestionnaireTemplate(id, updates);

    res.json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/admin/questionnaire-templates/:id/versions
 * Get version history for a template
 */
router.get('/:id/versions', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('questionnaire_versions')
      .select('*')
      .eq('template_id', id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get version history: ${error.message}`);

    res.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/admin/questionnaire-templates/:id/new-version
 * Create a new version (archives current, creates draft with new version)
 */
router.post('/:id/new-version', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Get current template
    const template = await supabaseService.getQuestionnaireTemplate(id);
    if (!template) {
      throw createError('Template not found', 404);
    }

    // Only allow creating new version from published templates
    if (template.status !== 'published') {
      throw createError('Can only create new version from published templates', 400);
    }

    // Archive current version to history
    await supabaseService.createQuestionnaireVersion({
      template_id: id,
      version: template.version,
      config: template.config,
      changes_summary: `Archived version ${template.version}`,
      created_by: userId
    });

    // Parse current version and increment minor version
    const versionParts = template.version.split('.');
    const major = parseInt(versionParts[0] || '1');
    const minor = parseInt(versionParts[1] || '0');
    const patch = parseInt(versionParts[2] || '0');
    const newVersion = `${major}.${minor + 1}.0`;

    // Update template with new version as draft
    const updated = await supabaseService.updateQuestionnaireTemplate(id, {
      version: newVersion,
      status: 'draft',
      published_at: undefined
    });

    res.json({
      success: true,
      data: updated,
      message: `Created new version ${newVersion} as draft`
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/admin/questionnaire-templates/:id/publish
 * Publish a template
 */
router.post('/:id/publish', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { changes_summary } = req.body;

    // Get template
    const template = await supabaseService.getQuestionnaireTemplate(id);
    if (!template) {
      throw createError('Template not found', 404);
    }

    // Publish the template
    const published = await supabaseService.publishQuestionnaireTemplate(id, userId);

    // NOTE: We do NOT create a version history entry here.
    // Version history is only created when creating a NEW version (which archives the old one).
    // The current published version should NOT be in the archive.

    res.json({
      success: true,
      data: published,
      message: `Template ${template.transaction_type} v${template.version} published successfully`
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/admin/questionnaire-templates/:id/compare-versions
 * Compare current template with a specific version
 */
router.get('/:id/compare-versions', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { versionId } = req.query;

    if (!versionId) {
      throw createError('versionId query parameter is required', 400);
    }

    // Get current template
    const currentTemplate = await supabaseService.getQuestionnaireTemplate(id);
    if (!currentTemplate) {
      throw createError('Template not found', 404);
    }

    // Get the version to compare
    const { data: versionData, error: versionError } = await supabase
      .from('questionnaire_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError || !versionData) {
      throw createError('Version not found', 404);
    }

    // Helper function to count sections and questions
    const getStats = (config: any) => {
      const sections = config?.sections || [];
      const questions = sections.reduce((total: number, section: any) => {
        return total + (section.questions?.length || 0);
      }, 0);
      return { sections: sections.length, questions };
    };

    // Helper function to find label changes
    const findLabelChanges = (currentConfig: any, restoringConfig: any) => {
      const changes: any[] = [];
      const currentSections = currentConfig?.sections || [];
      const restoringSections = restoringConfig?.sections || [];

      // Create a map of questions by ID for easy lookup
      const currentQuestionsMap = new Map();
      currentSections.forEach((section: any) => {
        section.questions?.forEach((q: any) => {
          currentQuestionsMap.set(q.id, { ...q, sectionTitle: section.title });
        });
      });

      const restoringQuestionsMap = new Map();
      restoringSections.forEach((section: any) => {
        section.questions?.forEach((q: any) => {
          restoringQuestionsMap.set(q.id, { ...q, sectionTitle: section.title });
        });
      });

      // Find label changes
      restoringQuestionsMap.forEach((restoringQ: any, id: string) => {
        const currentQ = currentQuestionsMap.get(id);
        if (currentQ && currentQ.title !== restoringQ.title) {
          changes.push({
            section: restoringQ.sectionTitle,
            field: id,
            currentLabel: currentQ.title,
            restoringLabel: restoringQ.title
          });
        }
      });

      return changes;
    };

    const currentStats = getStats(currentTemplate.config);
    const restoringStats = getStats(versionData.config);
    const labelChanges = findLabelChanges(currentTemplate.config, versionData.config);

    res.json({
      success: true,
      data: {
        current: {
          version: currentTemplate.version,
          ...currentStats
        },
        restoring: {
          version: versionData.version,
          ...restoringStats
        },
        changes: {
          labelChanges,
          sectionsAdded: Math.max(0, restoringStats.sections - currentStats.sections),
          sectionsRemoved: Math.max(0, currentStats.sections - restoringStats.sections),
          questionsAdded: Math.max(0, restoringStats.questions - currentStats.questions),
          questionsRemoved: Math.max(0, currentStats.questions - restoringStats.questions)
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/admin/questionnaire-templates/:id/restore-version
 * Restore a version and publish it as a new version
 */
router.post('/:id/restore-version', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { versionId, changesSummary } = req.body;
    const userId = (req as any).user.id;

    if (!versionId) {
      throw createError('versionId is required', 400);
    }

    // Get the version to restore
    const { data: versionData, error: versionError } = await supabase
      .from('questionnaire_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError || !versionData) {
      throw createError('Version not found', 404);
    }

    // Get current template
    const currentTemplate = await supabaseService.getQuestionnaireTemplate(id);
    if (!currentTemplate) {
      throw createError('Template not found', 404);
    }

    // Archive current version to history
    // Include restore information in the changes summary
    const archiveSummary = changesSummary
      ? `Archived before restoring v${versionData.version} - ${changesSummary}`
      : `Archived before restoring v${versionData.version}`;

    await supabaseService.createQuestionnaireVersion({
      template_id: id,
      version: currentTemplate.version,
      config: currentTemplate.config,
      changes_summary: archiveSummary,
      created_by: userId
    });

    // Parse current version and increment minor version
    const versionParts = currentTemplate.version.split('.');
    const major = parseInt(versionParts[0] || '1');
    const minor = parseInt(versionParts[1] || '0');
    const patch = parseInt(versionParts[2] || '0');
    const newVersion = `${major}.${minor + 1}.0`;

    // Update template with restored config and new version
    const updated = await supabaseService.updateQuestionnaireTemplate(id, {
      version: newVersion,
      config: versionData.config,
      status: 'published',
      published_at: new Date().toISOString(),
      published_by: userId
    });

    // NOTE: We do NOT create a version history entry for the newly published version.
    // Version history only contains ARCHIVED versions.
    // The current published version should NOT be in the archive.
    // The restore information is already captured in the archived version's changes_summary.

    res.json({
      success: true,
      data: updated,
      restoredFromVersion: versionData.version,
      newVersion: newVersion,
      message: `Version ${versionData.version} restored and published as ${newVersion}`
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;

