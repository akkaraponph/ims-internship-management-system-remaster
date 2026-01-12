# Internship Management System

ระบบจัดการการฝึกงานที่พัฒนาด้วย Next.js 16, Tailwind CSS, shadcn/ui, Formik + Zod, Drizzle ORM, และ PostgreSQL (Neon)

## เกี่ยวกับโปรเจกต์

โปรเจกต์นี้เป็นเวอร์ชันรีมาสเตอร์จาก:
- [internship-management-system](https://github.com/akkaraponph/internship-management-system)
- [internship-management-system-nextjs-node-ts](https://github.com/akkaraponph/internship-management-system-nextjs-node-ts)

## เทคโนโลยีที่ใช้

- **Framework**: Next.js 16 (App Router)
- **Package Manager**: Bun
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: Formik with Zod validation
- **Database**: Drizzle ORM + PostgreSQL (Neon)
- **Authentication**: NextAuth.js v5
- **Type Safety**: TypeScript

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
bun install
```

2. สร้างไฟล์ `.env.local` จาก `.env.example` และตั้งค่าตัวแปรสภาพแวดล้อม:
```bash
cp .env.example .env.local
```

จากนั้นแก้ไข `.env.local` และตั้งค่า:
- `DATABASE_URL`: Connection string จาก Neon PostgreSQL
- `NEXTAUTH_SECRET`: สร้าง secret key ด้วยคำสั่ง `openssl rand -base64 32`
- `NEXTAUTH_URL`: URL ของแอปพลิเคชัน (สำหรับ development ใช้ `http://localhost:3000`)

3. รัน migrations:
```bash
bun run db:push
# หรือ
bun run db:generate
bun run db:migrate
```

4. รัน development server:
```bash
bun run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## โครงสร้างโปรเจกต์

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Layout components
│   └── forms/           # Form components
├── lib/
│   ├── db/              # Database schema and connection
│   ├── auth.ts          # NextAuth configuration
│   ├── validations/     # Zod schemas
│   └── utils.ts         # Utilities
└── types/               # TypeScript types
```

## สคริปต์ที่มีให้

- `bun run dev` - รัน development server
- `bun run build` - Build สำหรับ production
- `bun run start` - รัน production server
- `bun run lint` - ตรวจสอบโค้ดด้วย ESLint
- `bun run db:generate` - สร้าง migrations
- `bun run db:migrate` - รัน migrations
- `bun run db:push` - Push schema ไปยัง database
- `bun run db:studio` - เปิด Drizzle Studio

## บทบาทผู้ใช้

- **Admin**: ผู้ดูแลระบบ - จัดการผู้ใช้, นักศึกษา, บริษัท, และการฝึกงานทั้งหมด
- **Director**: อาจารย์ที่ปรึกษา - ดูแลนักศึกษาในความดูแลและอนุมัติการฝึกงาน
- **Student**: นักศึกษา - จัดการข้อมูลส่วนตัวและสมัครฝึกงาน

## สถานะการพัฒนา

✅ โครงสร้างพื้นฐาน
✅ การตั้งค่า Next.js 16 และ Tailwind CSS
✅ การตั้งค่า shadcn/ui
✅ Database schema (Drizzle ORM)
✅ Authentication (NextAuth.js)
✅ Dashboard layouts และ components
✅ API routes พื้นฐาน
🚧 หน้าจัดการข้อมูล (อยู่ระหว่างการพัฒนา)
🚧 Forms ด้วย Formik + Zod (อยู่ระหว่างการพัฒนา)
🚧 Features เพิ่มเติม (อยู่ระหว่างการพัฒนา)

## หมายเหตุ

โปรเจกต์นี้ยังอยู่ระหว่างการพัฒนา โปรดตรวจสอบและปรับปรุงตามความต้องการของคุณ
