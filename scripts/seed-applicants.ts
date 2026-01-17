import { prisma } from '../src/lib/prisma.js';

async function seedApplicants() {
  const applicants = [
    {
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      country: 'USA',
    },
    {
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      country: 'Canada',
    },
    {
      full_name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1234567892',
      country: 'USA',
    },
    {
      full_name: 'Alice Williams',
      email: 'alice.williams@example.com',
      phone: '+1234567893',
      country: 'Canada',
    },
    {
      full_name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      phone: '+1234567894',
      country: 'UK',
    },
  ];

  for (const applicant of applicants) {
    await prisma.applicants.upsert({
      where: { email: applicant.email },
      update: {},
      create: applicant,
    });
  }

  console.log(`✓ Seeded ${applicants.length} applicants`);
}

seedApplicants()
  .catch((error) => {
    console.error('Error seeding applicants:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
