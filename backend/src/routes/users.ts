import { Router, Request, Response } from 'express';
import { supabaseService, User, UserRole } from '../services/supabaseService';

const router = Router();

// GET /api/users - Get all users with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user_type, status, organization_id } = req.query;
    
    const filters: any = {};
    if (user_type) filters.user_type = user_type as string;
    if (status) filters.status = status as string;
    if (organization_id) filters.organization_id = organization_id as string;

    const users = await supabaseService.getUsers(filters);

    res.json({
      success: true,
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users'
    });
  }
});

// GET /api/users/with-roles - Get users with their roles (must be before /:id route)
router.get('/with-roles', async (req: Request, res: Response) => {
  try {
    const usersWithRoles = await supabaseService.getUsersWithRoles();

    res.json({
      success: true,
      data: usersWithRoles
    });

  } catch (error) {
    console.error('Error getting users with roles:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users with roles'
    });
  }
});

// GET /api/users/roles - Get role definitions
router.get('/roles', async (req: Request, res: Response) => {
  try {
    const roles = await supabaseService.getRoleDefinitions();

    res.json({
      success: true,
      data: roles
    });

  } catch (error) {
    console.error('Error getting role definitions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get role definitions'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    const user = await supabaseService.getUser(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user'
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, phone, organizationId, userType, roleType } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !userType) {
      res.status(400).json({
        success: false,
        error: 'Email, first name, last name, and user type are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await supabaseService.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
      return;
    }

    // Create user
    const userData: User = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      organization_id: organizationId,
      user_type: userType,
      status: 'active'
    };

    const newUser = await supabaseService.createUser(userData);

    // Assign role if provided
    if (roleType) {
      const userRole: UserRole = {
        user_id: newUser.id!,
        role_type: roleType,
        organization_id: organizationId,
        granted_by: newUser.id || 'system', // For now, self-assigned
        is_active: true
      };

      await supabaseService.assignRole(userRole);
    }

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phone, status } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    // Check if user exists
    const existingUser = await supabaseService.getUser(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Prepare updates
    const updates: Partial<User> = {};
    if (email !== undefined) updates.email = email;
    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (status !== undefined) updates.status = status;

    const updatedUser = await supabaseService.updateUser(id, updates);

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user'
    });
  }
});



// POST /api/users/:id/roles - Assign role to user
router.post('/:id/roles', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roleType, organizationId } = req.body;

    if (!id || !roleType) {
      res.status(400).json({
        success: false,
        error: 'User ID and role type are required'
      });
      return;
    }

    // Check if user exists
    const user = await supabaseService.getUser(id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const userRole: UserRole = {
      user_id: id,
      role_type: roleType,
      organization_id: organizationId,
      granted_by: id, // For now, self-assigned
      is_active: true
    };

    const assignedRole = await supabaseService.assignRole(userRole);

    res.status(201).json({
      success: true,
      data: assignedRole,
      message: 'Role assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign role'
    });
  }
});

// DELETE /api/users/:id/roles/:roleType - Remove role from user
router.delete('/:id/roles/:roleType', async (req: Request, res: Response) => {
  try {
    const { id, roleType } = req.params;
    const { organizationId } = req.query;

    if (!id || !roleType) {
      res.status(400).json({
        success: false,
        error: 'User ID and role type are required'
      });
      return;
    }

    await supabaseService.removeRole(id, roleType, organizationId as string);

    res.json({
      success: true,
      message: 'Role removed successfully'
    });

  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove role'
    });
  }
});

export default router;
