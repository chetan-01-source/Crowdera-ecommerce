import { Router, Request, Response } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { UserService } from "../services/userService";
import { UserRole } from "../types/user";
import { ApiResponse } from "../types/auth";
import { validateUserUpdate } from "../middleware/user";
const router = Router();


router.use(authenticate);
router.use(requireAdmin);



router.get("/users", async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { cursor, limit = '30', sortOrder = 'desc' } = req.query;
    
    // Validate and parse limit
    const parsedLimit = Math.min(parseInt(limit as string) || 30, 100); // Max 100 users per request
    const sort = sortOrder === 'asc' ? 1 : -1;
    
    // Build query
    const query: any = {};
    
    // Add cursor condition for pagination
    if (cursor && typeof cursor === 'string') {
      try {
        query._id = sort === -1 ? { $lt: cursor } : { $gt: cursor };
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Invalid cursor format",
        });
        return;
      }
    }
    const users = await UserService.getAllUsersWithPagination(query, parsedLimit + 1, sort);
    
  
    const hasMore = users.length > parsedLimit;
    const userList = hasMore ? users.slice(0, parsedLimit) : users;
    
   
    const nextCursor = userList.length > 0 ? (userList[userList.length - 1] as any)._id.toString() : null;

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: { 
        users: userList, 
        count: userList.length,
        pagination: {
          hasMore,
          nextCursor: hasMore ? nextCursor : null,
          limit: parsedLimit,
          sortOrder
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve users",
    });
  }
});


/**
 * GET /admin/users/:id - Get user by ID
 */
router.get("/users/:id",async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const user = await UserService.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Return user without password
    const userResponse = {
      id: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      age: user.age,
      address: user.address,
      mobileNumber: user.mobileNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve user",
    });
  }
});




/**
 * DELETE /admin/users/:id - Delete user
 */
router.delete("/users/:id", async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await UserService.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Prevent admin from deleting themselves
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
      return;
    }

    // Delete user
    const deleted = await UserService.deleteUser(id);
    if (!deleted) {
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    });
  }
});




export default router;