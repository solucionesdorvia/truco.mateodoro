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

  // Create admin user if doesn't exist
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@truco.com' },
  })

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin1234!', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@truco.com',
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
      mustChangePassword: admin.mustChangePassword,
    })
    console.log('⚠️  IMPORTANT: Admin must change password on first login!')
    console.log('   Default credentials: admin@truco.com / Admin1234!')
  } else {
    console.log('ℹ️  Admin user already exists:', existingAdmin.email)
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

