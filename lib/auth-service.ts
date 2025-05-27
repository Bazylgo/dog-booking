// lib/auth-service.ts
import bcrypt from 'bcryptjs'
import prisma from "@/lib/prisma"

export interface AuthUser {
  id: string
  email: string
  name: string | null
  surname: string | null
  role: 'USER' | 'ADMIN'
}

export class AuthService {
  // Create a new user
  static async createUser(
    email: string,
    password: string,
    name: string,
    surname: string
  ): Promise<AuthUser> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        surname: surname.trim(),
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true
      }
    })

    return user
  }

  // Find user by email
  static async findUserByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        password: true
      }
    })

    return user
  }

  // Verify user password and return user without password
  static async verifyPassword(email: string, password: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        password: true
      }
    })

    if (!user || !user.password) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return null
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // Update user's last login timestamp
  static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    })
  }

  // Get user by ID (for session verification)
  static async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true
      }
    })

    return user
  }
}