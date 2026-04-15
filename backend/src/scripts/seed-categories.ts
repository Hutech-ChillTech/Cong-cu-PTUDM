import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed Categories cho Blog và Course (IT Topics)
 */
async function seedCategories() {
  console.log('🌱 Seeding Categories...');

  const categories = [
    // Content Type Categories
    {
      name: 'Tutorial',
      slug: 'tutorial',
      description: 'Hướng dẫn từng bước chi tiết về lập trình và công nghệ',
      orderIndex: 1,
    },
    {
      name: 'News',
      slug: 'news',
      description: 'Tin tức công nghệ mới nhất trong và ngoài nước',
      orderIndex: 2,
    },
    {
      name: 'Best Practices',
      slug: 'best-practices',
      description: 'Các phương pháp, chuẩn mực coding tốt nhất',
      orderIndex: 3,
    },
    {
      name: 'Tips & Tricks',
      slug: 'tips-tricks',
      description: 'Mẹo và thủ thuật giúp code nhanh hơn, hiệu quả hơn',
      orderIndex: 4,
    },
    {
      name: 'Career Guide',
      slug: 'career-guide',
      description: 'Định hướng nghề nghiệp, phỏng vấn và phát triển bản thân',
      orderIndex: 5,
    },
    {
      name: 'Review',
      slug: 'review',
      description: 'Đánh giá công nghệ, sách, khóa học, thiết bị',
      orderIndex: 6,
    },
    {
      name: 'Case Study',
      slug: 'case-study',
      description: 'Phân tích các dự án thực tế và bài học kinh nghiệm',
      orderIndex: 7,
    },
    
    // Topic Categories (Domain specific)
    {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Tất cả về lập trình web (Frontend, Backend, Fullstack)',
      orderIndex: 10,
    },
    {
      name: 'Mobile App',
      slug: 'mobile-app',
      description: 'Lập trình ứng dụng di động (iOS, Android, Cross-platform)',
      orderIndex: 11,
    },
    {
      name: 'AI & Machine Learning',
      slug: 'ai-ml',
      description: 'Trí tuệ nhân tạo và Máy học',
      orderIndex: 12,
    },
    {
      name: 'DevOps & Cloud',
      slug: 'devops-cloud',
      description: 'Vận hành hệ thống, CI/CD và Điện toán đám mây',
      orderIndex: 13,
    },
    {
      name: 'Data Sciene',
      slug: 'data-science',
      description: 'Khoa học dữ liệu và Big Data',
      orderIndex: 14,
    },
    {
      name: 'Cyber Security',
      slug: 'cyber-security',
      description: 'An toàn thông tin và bảo mật mạng',
      orderIndex: 15,
    },
    {
        name: 'Blockchain',
        slug: 'blockchain',
        description: 'Công nghệ chuỗi khối và Web3',
        orderIndex: 16,
    }
  ];

  let created = 0;
  let skipped = 0;

  for (const cat of categories) {
    try {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          orderIndex: cat.orderIndex,
        },
        create: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            orderIndex: cat.orderIndex,
        },
      });
      created++;
      console.log(`  ✅ ${cat.name}`);
    } catch (error) {
      skipped++;
      console.log(`  ⏭️  ${cat.name} (error: ${error})`);
    }
  }

  console.log(`\n✅ Seeding Categories completed!`);
  console.log(`   Created/Updated: ${created} categories`);
  console.log(`   Skipped/Failed: ${skipped} categories`);
}

/**
 * Main function
 */
async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
