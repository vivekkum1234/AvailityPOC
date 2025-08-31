"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseService_1 = require("../services/supabaseService");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { user_type, status, organization_id } = req.query;
        const filters = {};
        if (user_type)
            filters.user_type = user_type;
        if (status)
            filters.status = status;
        if (organization_id)
            filters.organization_id = organization_id;
        const users = await supabaseService_1.supabaseService.getUsers(filters);
        res.json({
            success: true,
            data: users,
            count: users.length
        });
    }
    catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get users'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
            return;
        }
        const user = await supabaseService_1.supabaseService.getUser(id);
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
    }
    catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get user'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const { email, firstName, lastName, phone, organizationId, userType, roleType } = req.body;
        if (!email || !firstName || !lastName || !userType) {
            res.status(400).json({
                success: false,
                error: 'Email, first name, last name, and user type are required'
            });
            return;
        }
        const existingUser = await supabaseService_1.supabaseService.getUserByEmail(email);
        if (existingUser) {
            res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
            return;
        }
        const userData = {
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            organization_id: organizationId,
            user_type: userType,
            status: 'active'
        };
        const newUser = await supabaseService_1.supabaseService.createUser(userData);
        if (roleType) {
            const userRole = {
                user_id: newUser.id,
                role_type: roleType,
                organization_id: organizationId,
                granted_by: newUser.id || 'system',
                is_active: true
            };
            await supabaseService_1.supabaseService.assignRole(userRole);
        }
        res.status(201).json({
            success: true,
            data: newUser,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create user'
        });
    }
});
router.put('/:id', async (req, res) => {
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
        const existingUser = await supabaseService_1.supabaseService.getUser(id);
        if (!existingUser) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        const updates = {};
        if (email !== undefined)
            updates.email = email;
        if (firstName !== undefined)
            updates.first_name = firstName;
        if (lastName !== undefined)
            updates.last_name = lastName;
        if (phone !== undefined)
            updates.phone = phone;
        if (status !== undefined)
            updates.status = status;
        const updatedUser = await supabaseService_1.supabaseService.updateUser(id, updates);
        res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update user'
        });
    }
});
router.get('/roles', async (req, res) => {
    try {
        const roles = await supabaseService_1.supabaseService.getRoleDefinitions();
        res.json({
            success: true,
            data: roles
        });
    }
    catch (error) {
        console.error('Error getting role definitions:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get role definitions'
        });
    }
});
router.get('/with-roles', async (req, res) => {
    try {
        const usersWithRoles = await supabaseService_1.supabaseService.getUsersWithRoles();
        res.json({
            success: true,
            data: usersWithRoles
        });
    }
    catch (error) {
        console.error('Error getting users with roles:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get users with roles'
        });
    }
});
router.post('/:id/roles', async (req, res) => {
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
        const user = await supabaseService_1.supabaseService.getUser(id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        const userRole = {
            user_id: id,
            role_type: roleType,
            organization_id: organizationId,
            granted_by: id,
            is_active: true
        };
        const assignedRole = await supabaseService_1.supabaseService.assignRole(userRole);
        res.status(201).json({
            success: true,
            data: assignedRole,
            message: 'Role assigned successfully'
        });
    }
    catch (error) {
        console.error('Error assigning role:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to assign role'
        });
    }
});
router.delete('/:id/roles/:roleType', async (req, res) => {
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
        await supabaseService_1.supabaseService.removeRole(id, roleType, organizationId);
        res.json({
            success: true,
            message: 'Role removed successfully'
        });
    }
    catch (error) {
        console.error('Error removing role:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove role'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map