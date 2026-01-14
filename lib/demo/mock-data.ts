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

  const students: Student[] = studentNames.map((name, index) => {
    const hasResume = index % 2 === 0;
    // Ensure more students are in the first university (director's university)
    const universityId = index < 8 ? universityIds[0] : universityIds[index % universityIds.length];
    
    return {
      id: generateId(),
      userId: null, // Will link later
      universityId: universityId,
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
      resume: hasResume ? null : `/uploads/demo/resumes/resume-${index + 1}.pdf`, // Add resume URL for pending resumes
      resumeStatus: hasResume,
      isCoInternship: false,
      presentAddressId: null,
      permanentAddressId: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };
  });

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
  // Create a better distribution: some pending, some confirmed, some rejected
  // For director's university students (first 8 students), ensure good mix
  students.forEach((student, studentIndex) => {
    if (studentIndex < jobPositions.length) {
      const jobPosition = jobPositions[studentIndex % jobPositions.length];
      const company = companies.find((c) => c.id === jobPosition.companyId)!;
      
      // Better status distribution:
      // - 40% approved (isSend="yes", isConfirm="yes")
      // - 40% pending (isSend="yes", isConfirm="no")
      // - 20% rejected (isSend="yes", isConfirm="no", status="rejected")
      let status: "pending" | "approved" | "rejected";
      let isConfirm: "yes" | "no";
      
      if (studentIndex % 5 === 0 || studentIndex % 5 === 1) {
        // 40% approved
        status = "approved";
        isConfirm = "yes";
      } else if (studentIndex % 5 === 2 || studentIndex % 5 === 3) {
        // 40% pending
        status = "pending";
        isConfirm = "no";
      } else {
        // 20% rejected
        status = "rejected";
        isConfirm = "no";
      }

      internships.push({
        id: generateId(),
        studentId: student.id,
        companyId: company.id,
        jobPositionId: jobPosition.id,
        isSend: "yes",
        isConfirm: isConfirm,
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

  // Generate Addresses (Provinces, Districts, Sub-districts)
  const provincesData = [
    { id: "province-1", name: "กรุงเทพมหานคร", code: "10", type: "province" },
    { id: "province-2", name: "นนทบุรี", code: "12", type: "province" },
    { id: "province-3", name: "ปทุมธานี", code: "13", type: "province" },
  ];

  const districtsData = [
    { id: "district-1", name: "เขตจตุจักร", code: "1001", provinceId: "province-1", type: "district" },
    { id: "district-2", name: "เขตบางรัก", code: "1002", provinceId: "province-1", type: "district" },
    { id: "district-3", name: "อำเภอเมืองนนทบุรี", code: "1201", provinceId: "province-2", type: "district" },
  ];

  const subDistrictsData = [
    { id: "subdistrict-1", name: "แขวงจตุจักร", code: "100101", districtId: "district-1", type: "sub-district" },
    { id: "subdistrict-2", name: "แขวงลาดยาว", code: "100102", districtId: "district-1", type: "sub-district" },
    { id: "subdistrict-3", name: "แขวงสีลม", code: "100201", districtId: "district-2", type: "sub-district" },
  ];

  // Generate Addresses for students and companies
  const addresses: any[] = [
    ...provincesData,
    ...districtsData,
    ...subDistrictsData,
  ];

  // Add addresses for students
  students.forEach((student, index) => {
    const addressId = generateId();
    addresses.push({
      id: addressId,
      type: "address",
      studentId: student.id,
      provinceId: provincesData[index % provincesData.length].id,
      districtId: districtsData[index % districtsData.length].id,
      subDistrictId: subDistrictsData[index % subDistrictsData.length].id,
      addressLine: `123/45 ถนนตัวอย่าง ${index + 1}`,
      postalCode: `1000${index}`,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    });
    if (index === 0) {
      student.presentAddressId = addressId;
    } else if (index === 1) {
      student.permanentAddressId = addressId;
    }
  });

  // Add addresses for companies
  companies.forEach((company, index) => {
    const addressId = generateId();
    addresses.push({
      id: addressId,
      type: "address",
      companyId: company.id,
      provinceId: provincesData[index % provincesData.length].id,
      districtId: districtsData[index % districtsData.length].id,
      subDistrictId: subDistrictsData[index % subDistrictsData.length].id,
      addressLine: `456/78 ถนนบริษัท ${index + 1}`,
      postalCode: `2000${index}`,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    });
    company.addressId = addressId;
  });

  // Generate Educations
  const educations: any[] = students.map((student, index) => ({
    id: generateId(),
    studentId: student.id,
    level: "ปริญญาตรี",
    institution: `มหาวิทยาลัยตัวอย่าง ${index + 1}`,
    field: "วิศวกรรมคอมพิวเตอร์",
    startDate: new Date(2020, 0, 1).toISOString() as any,
    endDate: new Date(2024, 5, 30).toISOString() as any,
    gpa: (3.0 + (index % 2) * 0.5).toFixed(2),
    createdAt: new Date("2024-01-01").toISOString() as any,
    updatedAt: new Date("2024-01-01").toISOString() as any,
  }));

  // Generate Contact Persons
  const contactPersons: any[] = students.slice(0, 5).map((student) => ({
    id: generateId(),
    studentId: student.id,
    name: `ผู้ติดต่อ ${student.firstName}`,
    relationship: "เพื่อน",
    phone: `081234567${students.indexOf(student)}`,
    email: `contact${students.indexOf(student)}@example.com`,
    address: "ที่อยู่ผู้ติดต่อ",
    createdAt: new Date("2024-01-01").toISOString() as any,
    updatedAt: new Date("2024-01-01").toISOString() as any,
  }));

  // Generate Email Settings
  const emailSettings: any[] = [
    {
      id: generateId(),
      smtpHost: "smtp.demo.example.com",
      smtpPort: 587,
      smtpUser: "demo@example.com",
      smtpPassword: "demo-password",
      fromEmail: "noreply@demo.example.com",
      fromName: "Demo System",
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
  ];

  // Generate Email Templates
  const emailTemplates: any[] = [
    {
      id: generateId(),
      name: "Welcome Email",
      subject: "ยินดีต้อนรับสู่ระบบ",
      body: "<p>สวัสดี {{name}}, ยินดีต้อนรับสู่ระบบจัดการการฝึกงาน</p>",
      type: "welcome",
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
    {
      id: generateId(),
      name: "Internship Approval",
      subject: "การฝึกงานของคุณได้รับการอนุมัติ",
      body: "<p>สวัสดี {{name}}, การฝึกงานของคุณได้รับการอนุมัติแล้ว</p>",
      type: "internship_approval",
      isActive: true,
      createdAt: new Date("2024-01-01").toISOString() as any,
      updatedAt: new Date("2024-01-01").toISOString() as any,
    },
  ];

  // Generate Backups
  const backups: any[] = [
    {
      id: generateId(),
      name: "Backup 2024-01-15",
      description: "Full system backup",
      size: 1024000,
      status: "completed",
      createdAt: new Date("2024-01-15").toISOString() as any,
      updatedAt: new Date("2024-01-15").toISOString() as any,
    },
    {
      id: generateId(),
      name: "Backup 2024-02-01",
      description: "Incremental backup",
      size: 512000,
      status: "completed",
      createdAt: new Date("2024-02-01").toISOString() as any,
      updatedAt: new Date("2024-02-01").toISOString() as any,
    },
  ];

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
    addresses,
    educations,
    contactPersons,
    emailSettings,
    emailTemplates,
    backups,
  };
}
