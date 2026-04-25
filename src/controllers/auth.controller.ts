import { Request, Response } from 'express';
import { MockDataService } from '../services/mockData.service';
import { UserRole } from '../data/models';

export class AuthController {
  /**
   * POST /api/auth/login
   * One-time login system
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      console.log(`📥 Login attempt - Email: ${email}, Role: ${role || 'not specified'}`);

      // Smart role detection:
      // 1. If role is explicitly provided, use it
      // 2. If email is admin@suraksha.ai, treat as admin
      // 3. Otherwise, check if user exists and use their role
      // 4. Default to citizen for new users
      
      let detectedRole = role;
      
      // Auto-detect admin by email
      if (email === 'admin@suraksha.ai' || email.toLowerCase().includes('admin')) {
        detectedRole = UserRole.ADMIN;
      }
      
      // Check if user exists and get their role
      const existingUser = MockDataService.getUserByEmail(email);
      if (existingUser) {
        detectedRole = existingUser.role;
      }
      
      // Default to citizen if still not determined
      if (!detectedRole) {
        detectedRole = UserRole.CITIZEN;
      }

      console.log(`🔍 Detected role: ${detectedRole}`);

      // ============ ADMIN LOGIN ============
      if (detectedRole === UserRole.ADMIN || detectedRole === 'admin' || detectedRole === 'administrator') {
        // Admin login - check credentials
        if (email === 'admin@suraksha.ai' && password === '123456') {
          // Valid admin credentials
          let user = MockDataService.getUserByEmail(email);
          if (!user) {
            // Create admin user if doesn't exist
            user = {
              id: 'admin-user-001',
              email: 'admin@suraksha.ai',
              password: '123456',
              role: UserRole.ADMIN,
              name: 'Police Admin',
              phone: '+919876543210',
              createdAt: new Date(),
              lastLoginAt: new Date()
            };
          } else {
            user.lastLoginAt = new Date();
          }

          console.log(`✅ Admin login successful: ${email}`);

          res.status(200).json({
            success: true,
            token: 'dummy-jwt-token-admin-2026',
            user: {
              id: user.id,
              email: user.email,
              role: UserRole.ADMIN,
              name: user.name,
              phone: user.phone
            }
          });
          return;
        } else {
          // Invalid admin credentials
          console.log(`❌ Invalid admin credentials for ${email}`);
          res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
          return;
        }
      }

      // ============ CITIZEN LOGIN ============
      let user = existingUser;
      
      if (!user) {
        // Create new citizen user with provided password
        user = MockDataService.createCitizenUser(email, password);
        console.log(`✅ New citizen registered: ${email}`);
      } else {
        // Validate password for existing user
        if (user.password && user.password !== password) {
          console.log(`❌ Invalid password for ${email}. Expected: ${user.password}, Got: ${password}`);
          res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
          return;
        }
        
        // Update last login for existing user
        user.lastLoginAt = new Date();
        console.log(`✅ Citizen login successful: ${email}`);
      }

      res.status(200).json({
        success: true,
        token: 'dummy-jwt-token-citizen-2026',
        user: {
          id: user.id,
          email: user.email,
          role: user.role || UserRole.CITIZEN,
          name: user.name,
          phone: user.phone
        }
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/auth/me
   * Get current user info from token
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a real app, we'd verify the JWT token
      // For dummy backend, we'll simulate token verification
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'No token provided'
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      
      // Mock token verification
      if (!token.includes('dummy-jwt-token')) {
        res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
        return;
      }

      // Extract user ID from token (simulated)
      // In real app, we'd decode JWT
      let userId = '';
      if (token.includes('admin')) {
        userId = 'admin-id';
      } else {
        // For citizen, we need to get from request or use a default
        userId = req.query.userId as string || 'citizen-default-id';
      }

      const user = MockDataService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          phone: user.phone,
          lastLoginAt: user.lastLoginAt
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}