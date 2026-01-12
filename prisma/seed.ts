import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create or update global settings
  const settings = await prisma.settings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      platformFeePercent: 0,
    },
  })
  console.log('✅ Settings created/updated:', settings)

  // Admin email to create/update
  const adminEmail = 'admin@mateodoro.com'
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingUser) {
    // Update existing user to admin
    const admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' },
    })
    console.log('✅ User updated to ADMIN:', admin.email)
  } else {
    // Create new admin user
    const passwordHash = await bcrypt.hash('Admin1234!', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'admin',
        passwordHash,
        role: 'ADMIN',
        creditsBalance: 0,
        mustChangePassword: true,
      },
    })
    console.log('✅ Admin user created:', {
      email: admin.email,
      username: admin.username,
      role: admin.role,
    })
    console.log('⚠️  Default password: Admin1234!')
  }

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
