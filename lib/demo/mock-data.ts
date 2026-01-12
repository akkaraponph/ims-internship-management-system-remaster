import type { University, User, Student, Company, Internship, JobPosition, Announcement, Notification, CompanyUser, Role } from "@/types";
import { companyRoles } from "@/lib/permissions/company-roles";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMockData() {
  // Generate Universities
  const universities: University[] = [
    {
      id: generateId(),
      name: "มหาวิทยาลัยเทคโนโลยีราชมงคล",
      code: "RMUT",
      inviteCode: "RMUT2024",
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
    {
      id: generateId(),
      name: "มหาวิทยาลัยเกษตรศาสตร์",
      code: "KU",
      inviteCode: "KU2024",
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
    {
      id: generateId(),
      name: "จุฬาลงกรณ์มหาวิทยาลัย",
      code: "CU",
      inviteCode: "CU2024",
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
  ];

  const universityIds = universities.map((u) => u.id);

  // Generate Users
  const users: User[] = [
    // Super Admin
    {
      id: generateId(),
      username: "superadmin",
      password: "$2a$10$dummy", // Hashed password
      role: "super-admin",
      universityId: null,
      customRoleId: null,
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
    // Admins
    {
      id: generateId(),
      username: "admin1",
      password: "$2a$10$dummy",
      role: "admin",
      universityId: universityIds[0],
      customRoleId: null,
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
    // Directors
    {
      id: generateId(),
      username: "director1",
      password: "$2a$10$dummy",
      role: "director",
      universityId: universityIds[0],
      customRoleId: null,
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
  ];

  // Generate Students
  const studentNames = [
    { first: "สมชาย", last: "ใจดี" },
    { first: "สมหญิง", last: "รักเรียน" },
    { first: "วิชัย", last: "เก่งมาก" },
    { first: "มาลี", last: "สวยงาม" },
    { first: "ประเสริฐ", last: "ดีมาก" },
    { first: "นิดา", last: "ขยัน" },
    { first: "ธีร", last: "ฉลาด" },
    { first: "ปิยะ", last: "เก่ง" },
    { first: "สุชาดา", last: "ดี" },
    { first: "กิตติ", last: "ยอดเยี่ยม" },
    { first: "อรทัย", last: "สวย" },
    { first: "ธนพล", last: "เก่ง" },
  ];

  const students: Student[] = studentNames.map((name, index) => ({
    id: generateId(),
    userId: null, // Will link later
    universityId: universityIds[index % universityIds.length],
    email: `student${index + 1}@example.com`,
    idCard: `1234567890${index}`,
    firstName: name.first,
    lastName: name.last,
    phone: `081234567${index}`,
    program: "วิศวกรรมคอมพิวเตอร์",
    department: "คณะวิศวกรรมศาสตร์",
    skill: "Programming, Web Development",
    interest: "Software Engineering",
    projectTopic: "ระบบจัดการข้อมูล",
      dateOfBirth: new Date(2000 + (index % 5), index % 12, (index % 28) + 1).toISOString() as any,
    experience: "เคยฝึกงานที่บริษัท ABC",
    religion: "พุทธ",
    fatherName: `พ่อ${name.first}`,
    fatherJob: "พนักงานบริษัท",
    motherName: `แม่${name.first}`,
    motherJob: "แม่บ้าน",
    presentGpa: (3.0 + (index % 2)).toFixed(2),
    image: null,
    resumeStatus: index % 2 === 0,
    isCoInternship: false,
    presentAddressId: null,
    permanentAddressId: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }));

  // Create student users
  students.forEach((student, index) => {
    const studentUser: User = {
      id: generateId(),
      username: `student${index + 1}`,
      password: "$2a$10$dummy",
      role: "student",
      universityId: student.universityId,
      customRoleId: null,
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    };
    users.push(studentUser);
    student.userId = studentUser.id;
  });

  // Generate Companies
  const companyNames = [
    "บริษัท เทคโนโลยี จำกัด",
    "บริษัท ซอฟต์แวร์ สมาร์ท จำกัด",
    "บริษัท ไอที โซลูชั่น จำกัด",
    "บริษัท ดิจิทัล อินโนเวชั่น จำกัด",
    "บริษัท คลาวด์ เซอร์วิส จำกัด",
    "บริษัท ไซเบอร์ ซีเคียวริตี้ จำกัด",
    "บริษัท เอไอ เทคโนโลยี จำกัด",
    "บริษัท โมบาย แอป จำกัด",
  ];

  const companies: Company[] = companyNames.map((name, index) => ({
    id: generateId(),
    universityId: universityIds[index % universityIds.length],
    name: name,
    type: "เทคโนโลยี",
    activities: "พัฒนาซอฟต์แวร์และระบบ",
    proposeTo: "นักศึกษาวิศวกรรมคอมพิวเตอร์",
    phone: `02-1234-567${index}`,
    addressId: null,
    contactPersonName: `ผู้ติดต่อ ${index + 1}`,
    contactPersonPosition: "HR Manager",
    contactPersonPhone: `081234567${index}`,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }));

  // Generate Company Roles
  const roles: Role[] = companyRoles.map((roleDef, index) => ({
    id: generateId(),
    name: roleDef.name,
    description: roleDef.description,
    permissions: roleDef.permissions,
    isSystemRole: false,
    createdAt: new Date("2024-01-01").toISOString() as any,
    updatedAt: new Date("2024-01-01").toISOString() as any,
  }));

  const companyHRRoleId = roles.find((r) => r.name === "Company HR")!.id;
  const companyManagerRoleId = roles.find((r) => r.name === "Company Manager")!.id;
  const companyStaffRoleId = roles.find((r) => r.name === "Company Staff")!.id;

  // Generate Company Users - Multiple users per company with different roles
  const companyUsers: CompanyUser[] = [];
  companies.forEach((company, index) => {
    // Primary user (Manager role)
    const primaryUser: User = {
      id: generateId(),
      username: `company${index + 1}`,
      password: "$2a$10$dummy",
      role: "company",
      universityId: company.universityId,
      customRoleId: companyManagerRoleId,
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    };
    users.push(primaryUser);

    companyUsers.push({
      id: generateId(),
      userId: primaryUser.id,
      companyId: company.id,
      position: "Manager",
      isPrimary: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    });

    // HR user
    const hrUser: User = {
      id: generateId(),
      username: `company${index + 1}_hr`,
      password: "$2a$10$dummy",
      role: "company",
      universityId: company.universityId,
      customRoleId: companyHRRoleId,
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    };
    users.push(hrUser);

    companyUsers.push({
      id: generateId(),
      userId: hrUser.id,
      companyId: company.id,
      position: "HR",
      isPrimary: false,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    });

    // Staff user (for some companies)
    if (index % 2 === 0) {
      const staffUser: User = {
        id: generateId(),
        username: `company${index + 1}_staff`,
        password: "$2a$10$dummy",
        role: "company",
        universityId: company.universityId,
        customRoleId: companyStaffRoleId,
        isActive: true,
        createdAt: new Date("2024-01-01").toISOString() as any,
        updatedAt: new Date("2024-01-01").toISOString() as any,
      };
      users.push(staffUser);

      companyUsers.push({
        id: generateId(),
        userId: staffUser.id,
        companyId: company.id,
        position: "Staff",
        isPrimary: false,
        createdAt: new Date("2024-01-01").toISOString() as any,
        updatedAt: new Date("2024-01-01").toISOString() as any,
      });
    }
  });

  // Generate Job Positions
  const jobTitles = [
    "นักพัฒนาซอฟต์แวร์",
    "นักวิเคราะห์ระบบ",
    "นักพัฒนาเว็บแอปพลิเคชัน",
    "นักพัฒนาโมบายแอป",
    "นักทดสอบซอฟต์แวร์",
    "นักออกแบบ UX/UI",
    "นักวิเคราะห์ข้อมูล",
    "นักพัฒนา Backend",
    "นักพัฒนา Frontend",
    "DevOps Engineer",
  ];

  const jobPositions: JobPosition[] = [];
  companies.forEach((company, companyIndex) => {
    const positionsPerCompany = 2;
    for (let i = 0; i < positionsPerCompany; i++) {
      const titleIndex = (companyIndex * positionsPerCompany + i) % jobTitles.length;
      jobPositions.push({
        id: generateId(),
        companyId: company.id,
        title: jobTitles[titleIndex],
        description: `ตำแหน่งงานสำหรับนักศึกษาฝึกงานในตำแหน่ง${jobTitles[titleIndex]}`,
        requirements: "กำลังศึกษาระดับปริญญาตรี สาขาวิศวกรรมคอมพิวเตอร์หรือสาขาที่เกี่ยวข้อง",
        location: "กรุงเทพมหานคร",
        startDate: new Date(2024, 5, 1).toISOString() as any,
        endDate: new Date(2024, 11, 31).toISOString() as any,
        maxApplicants: 5,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
    }
  });

  // Generate Internships
  const internships: Internship[] = [];
  const statuses: ("pending" | "approved" | "rejected")[] = ["pending", "approved", "rejected"];
  
  students.forEach((student, studentIndex) => {
    if (studentIndex < jobPositions.length) {
      const jobPosition = jobPositions[studentIndex % jobPositions.length];
      const company = companies.find((c) => c.id === jobPosition.companyId)!;
      const status = statuses[studentIndex % statuses.length];

      internships.push({
        id: generateId(),
        studentId: student.id,
        companyId: company.id,
        jobPositionId: jobPosition.id,
        isSend: "yes",
        isConfirm: status === "approved" ? "yes" : "no",
        status: status,
        startDate: status === "approved" ? new Date(2024, 5, 1).toISOString() as any : null,
        endDate: status === "approved" ? new Date(2024, 11, 31).toISOString() as any : null,
        createdAt: new Date(2024, 0, studentIndex + 1).toISOString() as any,
        updatedAt: new Date(2024, 0, studentIndex + 1).toISOString() as any,
      });
    }
  });

  // Generate Announcements
  const announcements: Announcement[] = [
    {
      id: generateId(),
      title: "ประกาศรับสมัครฝึกงาน",
      content: "มหาวิทยาลัยเปิดรับสมัครนักศึกษาฝึกงานประจำปี 2024",
      type: "info",
      priority: "high",
      isActive: true,
      targetRoles: ["student"],
      targetUniversities: null,
      createdBy: users.find((u) => u.role === "admin")!.id,
      createdAt: new Date("2024-01-15").toISOString() as any,
      updatedAt: new Date("2024-01-15").toISOString() as any,
      expiresAt: new Date(2024, 11, 31).toISOString() as any,
    },
    {
      id: generateId(),
      title: "กำหนดส่งเอกสาร",
      content: "กรุณาส่งเอกสารการฝึกงานภายในวันที่ 30 เมษายน 2024",
      type: "warning",
      priority: "medium",
      isActive: true,
      targetRoles: ["student"],
      targetUniversities: null,
      createdBy: users.find((u) => u.role === "admin")!.id,
      createdAt: new Date("2024-02-01").toISOString() as any,
      updatedAt: new Date("2024-02-01").toISOString() as any,
      expiresAt: new Date(2024, 3, 30).toISOString() as any,
    },
  ];

  // Generate Notifications (grouped by userId)
  const notifications: Record<string, Notification[]> = {};
  users.forEach((user) => {
    const userNotifications: Notification[] = [];
    
    if (user.role === "student") {
      userNotifications.push({
        id: generateId(),
        userId: user.id,
        type: "internship",
        title: "สถานะการฝึกงาน",
        message: "การสมัครฝึกงานของคุณอยู่ในสถานะรอดำเนินการ",
        link: "/internship",
        isRead: false,
        createdAt: new Date("2024-01-20").toISOString() as any,
      });
    }
    
    if (user.role === "company") {
      userNotifications.push({
        id: generateId(),
        userId: user.id,
        type: "internship",
        title: "มีผู้สมัครใหม่",
        message: "มีนักศึกษาสมัครฝึกงานตำแหน่งงานของคุณ",
        link: "/company/applications",
        isRead: false,
        createdAt: new Date("2024-01-20").toISOString() as any,
      });
    }

    if (userNotifications.length > 0) {
      notifications[user.id] = userNotifications;
    }
  });

  return {
    universities,
    users,
    students,
    companies,
    jobPositions,
    internships,
    announcements,
    notifications,
    companyUsers,
    roles,
  };
}
