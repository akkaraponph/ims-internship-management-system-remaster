"use client";

import { isDemoMode, getEntity, setEntity, addEntity, updateEntity, deleteEntity, getEntityById, getSession, setSession } from "./demo-service";
import { DEMO_STORAGE_KEYS } from "./storage-keys";
import type { User, Student, Company, Internship, JobPosition, University, Announcement, Notification, CompanyUser } from "@/types";

let originalFetch: typeof fetch | null = null;
let isInterceptorActive = false;

export function initializeApiInterceptor() {
  if (typeof window === "undefined") return;
  
  if (!originalFetch) {
    originalFetch = window.fetch;
  }

  if (isInterceptorActive) return; // Already initialized

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    
    // Only intercept API calls when demo mode is active
    if (isDemoMode() && url.startsWith("/api/")) {
      try {
        const response = await handleDemoAPI(url, init);
        return response;
      } catch (error) {
        console.error("Demo API error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Pass through to original fetch for non-API or non-demo calls
    if (originalFetch) {
      return originalFetch(input, init);
    }
    throw new Error("Original fetch not available");
  };

  isInterceptorActive = true;
}

export function restoreApiInterceptor() {
  if (typeof window === "undefined" || !originalFetch) return;
  window.fetch = originalFetch;
  isInterceptorActive = false;
}

async function handleDemoAPI(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method || "GET";
  const urlObj = new URL(url, window.location.origin);
  const pathname = urlObj.pathname;

  // Auth endpoints
  if (pathname.startsWith("/api/auth/")) {
    // Handle NextAuth session endpoint
    if (pathname === "/api/auth/session" && method === "GET") {
      return handleSession();
    }
    if (pathname.includes("/login") && method === "POST") {
      return handleLogin(init);
    }
    if (pathname.includes("/register") && method === "POST") {
      return handleRegister(init);
    }
    if (pathname.includes("/register-company") && method === "POST") {
      return handleRegisterCompany(init);
    }
    // For other NextAuth endpoints, return empty response to prevent errors
    return jsonResponse({}, 200);
  }

  // Users
  if (pathname === "/api/users" || pathname.startsWith("/api/users/")) {
    return handleUsersAPI(pathname, method, init);
  }

  // Students
  if (pathname === "/api/students" || pathname.startsWith("/api/students/")) {
    return handleStudentsAPI(pathname, method, init);
  }

  // Companies
  if (pathname === "/api/companies" || pathname.startsWith("/api/companies/")) {
    // Check for public endpoint first
    if (pathname === "/api/companies/public") {
      return handleCompaniesPublicAPI(url, method, init);
    }
    return handleCompaniesAPI(pathname, method, init);
  }

  // Internships
  if (pathname === "/api/internships" || pathname.startsWith("/api/internships/")) {
    return handleInternshipsAPI(pathname, method, init);
  }

  // Job Positions
  if (pathname === "/api/job-positions" || pathname.startsWith("/api/job-positions/")) {
    return handleJobPositionsAPI(pathname, method, init);
  }

  // Public Jobs API
  if (pathname === "/api/jobs/public") {
    return handleJobsPublicAPI(url, method, init);
  }

  // Universities
  if (pathname === "/api/universities" || pathname.startsWith("/api/universities/")) {
    return handleUniversitiesAPI(pathname, method, init);
  }

  // Announcements
  if (pathname === "/api/announcements" || pathname.startsWith("/api/announcements/")) {
    // Check for public endpoint first
    if (pathname === "/api/announcements/public") {
      return handleAnnouncementsPublicAPI(url, method, init);
    }
    return handleAnnouncementsAPI(pathname, method, init);
  }

  // Public Statistics API
  if (pathname === "/api/statistics/public") {
    return handleStatisticsPublicAPI(url, method, init);
  }

  // Notifications
  if (pathname === "/api/notifications" || pathname.startsWith("/api/notifications/")) {
    return handleNotificationsAPI(pathname, method, init);
  }

  // Reports
  if (pathname === "/api/reports") {
    return handleReportsAPI();
  }

  // Addresses
  if (pathname.startsWith("/api/addresses")) {
    return handleAddressesAPI(pathname, method, init, url);
  }

  // Roles
  if (pathname.startsWith("/api/roles")) {
    return handleRolesAPI(pathname, method, init);
  }

  // Company Users
  if (pathname.startsWith("/api/companies/") && pathname.includes("/users")) {
    return handleCompanyUsersAPI(pathname, method, init);
  }

  // Student-specific APIs
  if (pathname.startsWith("/api/students/") && pathname.includes("/educations")) {
    return handleStudentEducationsAPI(pathname, method, init);
  }
  if (pathname.startsWith("/api/students/") && pathname.includes("/resume")) {
    return handleStudentResumeAPI(pathname, method, init);
  }
  if (pathname.startsWith("/api/students/") && pathname.includes("/contact-person")) {
    return handleStudentContactPersonAPI(pathname, method, init);
  }
  if (pathname.startsWith("/api/students/") && pathname.includes("/profile/token")) {
    return handleStudentProfileTokenAPI(pathname, method, init);
  }
  if (pathname.startsWith("/api/students/public/")) {
    return handleStudentPublicAPI(pathname, method, init);
  }
  if (pathname === "/api/students/resumes/pending") {
    return handleStudentResumesPendingAPI(method, init);
  }

  // Internship-specific APIs
  if (pathname.startsWith("/api/internships/") && (pathname.includes("/confirm") || pathname.includes("/unconfirm") || pathname.includes("/send") || pathname.includes("/unsend") || pathname.includes("/return") || pathname.includes("/detail"))) {
    return handleInternshipActionsAPI(pathname, method, init);
  }
  if (pathname === "/api/internships/co-students") {
    return handleInternshipCoStudentsAPI(method, init);
  }

  // Upload APIs
  if (pathname.startsWith("/api/upload")) {
    return handleUploadAPI(pathname, method, init);
  }

  // Email APIs
  if (pathname.startsWith("/api/email")) {
    return handleEmailAPI(pathname, method, init);
  }

  // Backup APIs
  if (pathname.startsWith("/api/backups")) {
    return handleBackupAPI(pathname, method, init);
  }

  // Announcement-specific APIs
  if (pathname.startsWith("/api/announcements/") && (pathname.includes("/read") || pathname === "/api/announcements/unread")) {
    return handleAnnouncementActionsAPI(pathname, method, init);
  }

  // University-specific APIs
  if (pathname.startsWith("/api/universities/") && pathname.includes("/regenerate-invite")) {
    return handleUniversityRegenerateInviteAPI(pathname, method, init);
  }
  if (pathname === "/api/universities/validate-invite") {
    return handleUniversityValidateInviteAPI(method, init);
  }

  // Notification Settings
  if (pathname === "/api/notifications/settings") {
    return handleNotificationSettingsAPI(method, init);
  }

  // Default 404
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

// Auth handlers
async function handleSession(): Promise<Response> {
  const session = getSession();
  if (session) {
    return jsonResponse({
      user: {
        id: session.id,
        username: session.username,
        role: session.role,
        isActive: session.isActive,
        universityId: session.universityId,
        companyId: session.companyId,
      },
      expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours
    });
  }
  return jsonResponse({}, 200); // Return empty session when not logged in
}

async function handleLogin(init?: RequestInit): Promise<Response> {
  const body = await parseBody(init);
  const users = getEntity<User>(DEMO_STORAGE_KEYS.USERS);
  const user = users.find((u) => u.username === body.username);

  if (!user || !user.isActive) {
    return jsonResponse({ error: "Invalid credentials" }, 401);
  }

  // Get additional user info based on role
  let sessionData: any = {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    universityId: user.universityId,
    companyId: null,
  };

  if (user.role === "company") {
    const companyUser = getEntity<CompanyUser>(DEMO_STORAGE_KEYS.COMPANY_USERS).find(
      (cu) => cu.userId === user.id
    );
    if (companyUser) {
      sessionData.companyId = companyUser.companyId;
    }
  }

  setSession(sessionData);

  return jsonResponse({
    user: sessionData,
  });
}

async function handleRegister(init?: RequestInit): Promise<Response> {
  const body = await parseBody(init);
  const users = getEntity<User>(DEMO_STORAGE_KEYS.USERS);
  
  if (users.find((u) => u.username === body.username)) {
    return jsonResponse({ error: "Username already exists" }, 400);
  }

  // In demo mode, just return success
  return jsonResponse({
    message: "Registration successful",
    user: { username: body.username, role: "student" },
  }, 201);
}

async function handleRegisterCompany(init?: RequestInit): Promise<Response> {
  const body = await parseBody(init);
  // In demo mode, just return success
  return jsonResponse({
    message: "Registration successful",
    user: { username: body.username, role: "company" },
  }, 201);
}

// Users API
async function handleUsersAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (pathname === "/api/users") {
    if (method === "GET") {
      const users = getEntity<User>(DEMO_STORAGE_KEYS.USERS);
      // Filter based on role
      if (session.role === "super-admin") {
        return jsonResponse(users);
      }
      if (session.role === "admin" && session.universityId) {
        return jsonResponse(users.filter((u) => u.universityId === session.universityId));
      }
      return jsonResponse([]);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newUser: User = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.USERS, newUser);
      return jsonResponse(newUser, 201);
    }
  }

  const match = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const user = getEntityById<User>(DEMO_STORAGE_KEYS.USERS, id);
      if (!user) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(user);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity<User>(DEMO_STORAGE_KEYS.USERS, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.USERS, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Students API
async function handleStudentsAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (pathname === "/api/students") {
    if (method === "GET") {
      let students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
      
      if (session.role === "student") {
        const user = getEntityById<User>(DEMO_STORAGE_KEYS.USERS, session.id);
        students = students.filter((s) => s.userId === user?.id);
      } else if (session.role === "admin" || session.role === "director") {
        if (session.universityId) {
          students = students.filter((s) => s.universityId === session.universityId);
        }
      }
      
      return jsonResponse(students);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newStudent: Student = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      } as Student;
      addEntity(DEMO_STORAGE_KEYS.STUDENTS, newStudent);
      return jsonResponse(newStudent, 201);
    }
  }

  const match = pathname.match(/^\/api\/students\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const student = getEntityById<Student>(DEMO_STORAGE_KEYS.STUDENTS, id);
      if (!student) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(student);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.STUDENTS, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Companies API
async function handleCompaniesAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (pathname === "/api/companies") {
    if (method === "GET") {
      let companies = getEntity<Company>(DEMO_STORAGE_KEYS.COMPANIES);
      
      if (session.role === "company" && session.companyId) {
        companies = companies.filter((c) => c.id === session.companyId);
      } else if (session.role === "admin" || session.role === "director") {
        if (session.universityId) {
          companies = companies.filter((c) => c.universityId === session.universityId);
        }
      }
      
      return jsonResponse(companies);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newCompany: Company = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.COMPANIES, newCompany);
      return jsonResponse(newCompany, 201);
    }
  }

  const match = pathname.match(/^\/api\/companies\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const company = getEntityById<Company>(DEMO_STORAGE_KEYS.COMPANIES, id);
      if (!company) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(company);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity<Company>(DEMO_STORAGE_KEYS.COMPANIES, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.COMPANIES, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Internships API
async function handleInternshipsAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (pathname === "/api/internships") {
    if (method === "GET") {
      let internships = getEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS);
      
      if (session.role === "student") {
        const students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
        const student = students.find((s) => s.userId === session.id);
        if (student) {
          internships = internships.filter((i) => i.studentId === student.id);
        } else {
          internships = [];
        }
      } else if (session.role === "company" && session.companyId) {
        internships = internships.filter((i) => i.companyId === session.companyId);
      } else if (session.role === "admin" || session.role === "director") {
        if (session.universityId) {
          const students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
          const universityStudentIds = students
            .filter((s) => s.universityId === session.universityId)
            .map((s) => s.id);
          internships = internships.filter((i) => 
            i.studentId && universityStudentIds.includes(i.studentId)
          );
        }
      }
      
      return jsonResponse(internships);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      // Handle date strings from form inputs
      const internshipData = {
        ...body,
        startDate: body.startDate ? (typeof body.startDate === "string" ? body.startDate : new Date(body.startDate).toISOString()) : null,
        endDate: body.endDate ? (typeof body.endDate === "string" ? body.endDate : new Date(body.endDate).toISOString()) : null,
      };
      
      const newInternship: Internship = {
        id: generateId(),
        ...internshipData,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      } as Internship;
      addEntity(DEMO_STORAGE_KEYS.INTERNSHIPS, newInternship);
      return jsonResponse(newInternship, 201);
    }
  }

  const match = pathname.match(/^\/api\/internships\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const internship = getEntityById<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS, id);
      if (!internship) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(internship);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      // Handle date strings
      const updateData: any = { ...body };
      if (body.startDate) {
        updateData.startDate = typeof body.startDate === "string" ? body.startDate : new Date(body.startDate).toISOString();
      }
      if (body.endDate) {
        updateData.endDate = typeof body.endDate === "string" ? body.endDate : new Date(body.endDate).toISOString();
      }
      updateData.updatedAt = new Date().toISOString();
      const updated = updateEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.INTERNSHIPS, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Job Positions API
async function handleJobPositionsAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (pathname === "/api/job-positions") {
    if (method === "GET") {
      let jobPositions = getEntity<JobPosition>(DEMO_STORAGE_KEYS.JOB_POSITIONS);
      
      if (session.role === "company" && session.companyId) {
        jobPositions = jobPositions.filter((jp) => jp.companyId === session.companyId);
      }
      
      return jsonResponse(jobPositions);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const jobPositionData = {
        ...body,
        startDate: body.startDate ? (typeof body.startDate === "string" ? body.startDate : new Date(body.startDate).toISOString()) : null,
        endDate: body.endDate ? (typeof body.endDate === "string" ? body.endDate : new Date(body.endDate).toISOString()) : null,
      };
      
      const newJobPosition: JobPosition = {
        id: generateId(),
        ...jobPositionData,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      } as JobPosition;
      addEntity(DEMO_STORAGE_KEYS.JOB_POSITIONS, newJobPosition);
      return jsonResponse(newJobPosition, 201);
    }
  }

  const match = pathname.match(/^\/api\/job-positions\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const jobPosition = getEntityById<JobPosition>(DEMO_STORAGE_KEYS.JOB_POSITIONS, id);
      if (!jobPosition) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(jobPosition);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity(DEMO_STORAGE_KEYS.JOB_POSITIONS, id, body);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.JOB_POSITIONS, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Universities API
async function handleUniversitiesAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (pathname === "/api/universities") {
    if (method === "GET") {
      const universities = getEntity<University>(DEMO_STORAGE_KEYS.UNIVERSITIES);
      return jsonResponse(universities);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newUniversity: University = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.UNIVERSITIES, newUniversity);
      return jsonResponse(newUniversity, 201);
    }
  }

  const match = pathname.match(/^\/api\/universities\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const university = getEntityById<University>(DEMO_STORAGE_KEYS.UNIVERSITIES, id);
      if (!university) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(university);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity<University>(DEMO_STORAGE_KEYS.UNIVERSITIES, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Announcements API
async function handleAnnouncementsAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (pathname === "/api/announcements") {
    if (method === "GET") {
      const announcements = getEntity<Announcement>(DEMO_STORAGE_KEYS.ANNOUNCEMENTS);
      return jsonResponse(announcements.filter((a) => a.isActive));
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newAnnouncement: Announcement = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.ANNOUNCEMENTS, newAnnouncement);
      return jsonResponse(newAnnouncement, 201);
    }
  }

  const match = pathname.match(/^\/api\/announcements\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const announcement = getEntityById<Announcement>(DEMO_STORAGE_KEYS.ANNOUNCEMENTS, id);
      if (!announcement) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(announcement);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity<Announcement>(DEMO_STORAGE_KEYS.ANNOUNCEMENTS, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.ANNOUNCEMENTS, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Notifications API
async function handleNotificationsAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  // Notifications are stored as Record<string, Notification[]>
  const notificationsDataRaw = localStorage.getItem(DEMO_STORAGE_KEYS.NOTIFICATIONS);
  let notificationsData: Notification[] = [];
  if (notificationsDataRaw) {
    try {
      const parsed = JSON.parse(notificationsDataRaw);
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        notificationsData = Object.values(parsed).flat() as Notification[];
      } else if (Array.isArray(parsed)) {
        notificationsData = parsed;
      }
    } catch {
      notificationsData = [];
    }
  }
  
  const userNotifications = notificationsData.filter((n) => n.userId === session.id);

  if (pathname === "/api/notifications") {
    if (method === "GET") {
      return jsonResponse(userNotifications);
    }
  }

  if (pathname === "/api/notifications/unread/count") {
    const unreadCount = userNotifications.filter((n) => !n.isRead).length;
    return jsonResponse({ count: unreadCount });
  }

  if (pathname === "/api/notifications/mark-all-read" && method === "POST") {
    // Get all notifications and update
    const allNotifications = notificationsData;
    allNotifications.forEach((n) => {
      if (n.userId === session.id) {
        updateEntity<Notification>(DEMO_STORAGE_KEYS.NOTIFICATIONS, n.id, { isRead: true } as any);
      }
    });
    return jsonResponse({ message: "All notifications marked as read" });
  }

  const match = pathname.match(/^\/api\/notifications\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity<Notification>(DEMO_STORAGE_KEYS.NOTIFICATIONS, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Reports API
async function handleReportsAPI(): Promise<Response> {
  const users = getEntity<User>(DEMO_STORAGE_KEYS.USERS);
  const students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
  const companies = getEntity<Company>(DEMO_STORAGE_KEYS.COMPANIES);
  const internships = getEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS);

  return jsonResponse({
    totalUsers: users.length,
    totalStudents: students.length,
    totalCompanies: companies.length,
    totalInternships: internships.length,
    pendingInternships: internships.filter((i) => i.status === "pending").length,
    approvedInternships: internships.filter((i) => i.status === "approved").length,
    rejectedInternships: internships.filter((i) => i.status === "rejected").length,
  });
}

// Addresses API
async function handleAddressesAPI(pathname: string, method: string, init?: RequestInit, url?: string): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  // Provinces
  if (pathname === "/api/addresses/provinces" && method === "GET") {
    const addresses = getEntity<any>(DEMO_STORAGE_KEYS.ADDRESSES);
    const provinces = addresses.filter((a: any) => a.type === "province");
    return jsonResponse(provinces);
  }

  // Districts
  if (pathname === "/api/addresses/districts" && method === "GET") {
    let provinceId: string | null = null;
    if (url) {
      const urlObj = new URL(url, window.location.origin);
      provinceId = urlObj.searchParams.get("provinceId");
    }
    const addresses = getEntity<any>(DEMO_STORAGE_KEYS.ADDRESSES);
    let districts = addresses.filter((a: any) => a.type === "district");
    if (provinceId) {
      districts = districts.filter((d: any) => d.provinceId === provinceId);
    }
    return jsonResponse(districts);
  }

  // Sub-districts
  if (pathname === "/api/addresses/sub-districts" && method === "GET") {
    let districtId: string | null = null;
    if (url) {
      const urlObj = new URL(url, window.location.origin);
      districtId = urlObj.searchParams.get("districtId");
    }
    const addresses = getEntity<any>(DEMO_STORAGE_KEYS.ADDRESSES);
    let subDistricts = addresses.filter((a: any) => a.type === "sub-district");
    if (districtId) {
      subDistricts = subDistricts.filter((sd: any) => sd.districtId === districtId);
    }
    return jsonResponse(subDistricts);
  }

  // Main addresses endpoint
  if (pathname === "/api/addresses") {
    if (method === "GET") {
      const addresses = getEntity<any>(DEMO_STORAGE_KEYS.ADDRESSES);
      return jsonResponse(addresses.filter((a: any) => a.type === "address"));
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newAddress: any = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.ADDRESSES, newAddress);
      return jsonResponse(newAddress, 201);
    }
  }

  // Address by ID
  const match = pathname.match(/^\/api\/addresses\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const address = getEntityById<any>(DEMO_STORAGE_KEYS.ADDRESSES, id);
      if (!address) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(address);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity<any>(DEMO_STORAGE_KEYS.ADDRESSES, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.ADDRESSES, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Roles API
async function handleRolesAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  if (pathname === "/api/roles") {
    if (method === "GET") {
      const roles = getEntity<any>(DEMO_STORAGE_KEYS.ROLES);
      return jsonResponse(roles);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newRole: any = {
        id: generateId(),
        ...body,
        isSystemRole: false,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.ROLES, newRole);
      return jsonResponse(newRole, 201);
    }
  }

  // Role by ID
  const match = pathname.match(/^\/api\/roles\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const role = getEntityById<any>(DEMO_STORAGE_KEYS.ROLES, id);
      if (!role) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(role);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString() as any,
      };
      const updated = updateEntity<any>(DEMO_STORAGE_KEYS.ROLES, id, updateData);
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.ROLES, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  // Role permissions
  const permissionsMatch = pathname.match(/^\/api\/roles\/([^/]+)\/permissions$/);
  if (permissionsMatch) {
    const id = permissionsMatch[1];
    if (method === "GET") {
      const role = getEntityById<any>(DEMO_STORAGE_KEYS.ROLES, id);
      if (!role) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ permissions: role.permissions || [] });
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const role = getEntityById<any>(DEMO_STORAGE_KEYS.ROLES, id);
      if (!role) return jsonResponse({ error: "Not found" }, 404);
      const updated = updateEntity<any>(DEMO_STORAGE_KEYS.ROLES, id, {
        permissions: body.permissions,
        updatedAt: new Date().toISOString() as any,
      });
      return jsonResponse(updated);
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Company Users API
async function handleCompanyUsersAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  const companyUsersMatch = pathname.match(/^\/api\/companies\/([^/]+)\/users$/);
  if (companyUsersMatch) {
    const companyId = companyUsersMatch[1];
    if (method === "GET") {
      const companyUsers = getEntity<CompanyUser>(DEMO_STORAGE_KEYS.COMPANY_USERS);
      const filtered = companyUsers.filter((cu) => cu.companyId === companyId);
      return jsonResponse(filtered);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newCompanyUser: CompanyUser = {
        id: generateId(),
        userId: body.userId,
        companyId: companyId,
        position: body.position || "Staff",
        isPrimary: body.isPrimary || false,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.COMPANY_USERS, newCompanyUser);
      return jsonResponse(newCompanyUser, 201);
    }
  }

  const userMatch = pathname.match(/^\/api\/companies\/([^/]+)\/users\/([^/]+)$/);
  if (userMatch) {
    const companyId = userMatch[1];
    const userId = userMatch[2];
    if (method === "GET") {
      const companyUsers = getEntity<CompanyUser>(DEMO_STORAGE_KEYS.COMPANY_USERS);
      const companyUser = companyUsers.find((cu) => cu.companyId === companyId && cu.userId === userId);
      if (!companyUser) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(companyUser);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const companyUsers = getEntity<CompanyUser>(DEMO_STORAGE_KEYS.COMPANY_USERS);
      const index = companyUsers.findIndex((cu) => cu.companyId === companyId && cu.userId === userId);
      if (index === -1) return jsonResponse({ error: "Not found" }, 404);
      companyUsers[index] = { ...companyUsers[index], ...body, updatedAt: new Date().toISOString() as any };
      setEntity(DEMO_STORAGE_KEYS.COMPANY_USERS, companyUsers);
      return jsonResponse(companyUsers[index]);
    }
    if (method === "DELETE") {
      const companyUsers = getEntity<CompanyUser>(DEMO_STORAGE_KEYS.COMPANY_USERS);
      const filtered = companyUsers.filter((cu) => !(cu.companyId === companyId && cu.userId === userId));
      if (filtered.length === companyUsers.length) return jsonResponse({ error: "Not found" }, 404);
      setEntity(DEMO_STORAGE_KEYS.COMPANY_USERS, filtered);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Student Educations API
async function handleStudentEducationsAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  const match = pathname.match(/^\/api\/students\/([^/]+)\/educations$/);
  if (match) {
    const studentId = match[1];
    if (method === "GET") {
      const educations = getEntity<any>(DEMO_STORAGE_KEYS.EDUCATIONS);
      return jsonResponse(educations.filter((e: any) => e.studentId === studentId));
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newEducation: any = {
        id: generateId(),
        studentId: studentId,
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.EDUCATIONS, newEducation);
      return jsonResponse(newEducation, 201);
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Student Resume API
async function handleStudentResumeAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  // Approve resume
  const approveMatch = pathname.match(/^\/api\/students\/([^/]+)\/resume\/approve$/);
  if (approveMatch && method === "POST") {
    const studentId = approveMatch[1];
    const student = getEntityById<Student>(DEMO_STORAGE_KEYS.STUDENTS, studentId);
    if (!student) return jsonResponse({ error: "Not found" }, 404);
    const updated = updateEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS, studentId, { resumeStatus: true });
    return jsonResponse(updated);
  }

  // Reject resume
  const rejectMatch = pathname.match(/^\/api\/students\/([^/]+)\/resume\/reject$/);
  if (rejectMatch && method === "POST") {
    const studentId = rejectMatch[1];
    const student = getEntityById<Student>(DEMO_STORAGE_KEYS.STUDENTS, studentId);
    if (!student) return jsonResponse({ error: "Not found" }, 404);
    const updated = updateEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS, studentId, { resumeStatus: false });
    return jsonResponse(updated);
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Student Contact Person API
async function handleStudentContactPersonAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  const match = pathname.match(/^\/api\/students\/([^/]+)\/contact-person$/);
  if (match) {
    const studentId = match[1];
    const contactPersons = getEntity<any>(DEMO_STORAGE_KEYS.CONTACT_PERSONS);
    const contactPerson = contactPersons.find((cp: any) => cp.studentId === studentId);

    if (method === "GET") {
      return jsonResponse(contactPerson || null);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newContactPerson: any = {
        id: generateId(),
        studentId: studentId,
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.CONTACT_PERSONS, newContactPerson);
      return jsonResponse(newContactPerson, 201);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      if (!contactPerson) return jsonResponse({ error: "Not found" }, 404);
      const updated = updateEntity<any>(DEMO_STORAGE_KEYS.CONTACT_PERSONS, contactPerson.id, {
        ...body,
        updatedAt: new Date().toISOString() as any,
      });
      return jsonResponse(updated);
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Student Profile Token API
async function handleStudentProfileTokenAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  const match = pathname.match(/^\/api\/students\/([^/]+)\/profile\/token$/);
  if (match && method === "GET") {
    const studentId = match[1];
    const token = `demo-token-${studentId}-${Date.now()}`;
    return jsonResponse({ token });
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Student Public API
async function handleStudentPublicAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const match = pathname.match(/^\/api\/students\/public\/([^/]+)$/);
  if (match && method === "GET") {
    const token = match[1];
    // In demo mode, return a sample student
    const students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
    return jsonResponse(students[0] || null);
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Jobs Public API
async function handleJobsPublicAPI(url: string, method: string, init?: RequestInit): Promise<Response> {
  if (method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const urlObj = new URL(url, window.location.origin);
  const search = urlObj.searchParams.get("search");
  const companyId = urlObj.searchParams.get("companyId");
  const location = urlObj.searchParams.get("location");

  const jobPositions = getEntity<JobPosition>(DEMO_STORAGE_KEYS.JOB_POSITIONS);
  const companies = getEntity<Company>(DEMO_STORAGE_KEYS.COMPANIES);

  // Filter active jobs only
  let filteredJobs = jobPositions.filter((jp) => jp.isActive);

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredJobs = filteredJobs.filter(
      (jp) =>
        jp.title?.toLowerCase().includes(searchLower) ||
        jp.description?.toLowerCase().includes(searchLower) ||
        jp.location?.toLowerCase().includes(searchLower)
    );
  }

  if (companyId) {
    filteredJobs = filteredJobs.filter((jp) => jp.companyId === companyId);
  }

  if (location) {
    const locationLower = location.toLowerCase();
    filteredJobs = filteredJobs.filter((jp) => jp.location?.toLowerCase().includes(locationLower));
  }

  // Join with companies
  const jobsWithCompanies = filteredJobs.map((job) => {
    const company = companies.find((c) => c.id === job.companyId);
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      startDate: job.startDate,
      endDate: job.endDate,
      maxApplicants: job.maxApplicants,
      createdAt: job.createdAt,
      company: company
        ? {
            id: company.id,
            name: company.name,
            type: company.type,
            activities: company.activities,
          }
        : null,
    };
  });

  return jsonResponse(jobsWithCompanies);
}

// Companies Public API
async function handleCompaniesPublicAPI(url: string, method: string, init?: RequestInit): Promise<Response> {
  if (method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const urlObj = new URL(url, window.location.origin);
  const search = urlObj.searchParams.get("search");
  const type = urlObj.searchParams.get("type");

  const companies = getEntity<Company>(DEMO_STORAGE_KEYS.COMPANIES);
  const jobPositions = getEntity<JobPosition>(DEMO_STORAGE_KEYS.JOB_POSITIONS);

  // Filter active companies only
  let filteredCompanies = companies.filter((c) => c.isActive);

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredCompanies = filteredCompanies.filter(
      (c) =>
        c.name?.toLowerCase().includes(searchLower) ||
        c.type?.toLowerCase().includes(searchLower) ||
        c.activities?.toLowerCase().includes(searchLower)
    );
  }

  if (type) {
    const typeLower = type.toLowerCase();
    filteredCompanies = filteredCompanies.filter((c) => c.type?.toLowerCase().includes(typeLower));
  }

  // Add active jobs count
  const companiesWithJobs = filteredCompanies.map((company) => {
    const activeJobsCount = jobPositions.filter(
      (jp) => jp.companyId === company.id && jp.isActive
    ).length;

    return {
      ...company,
      activeJobsCount,
    };
  });

  return jsonResponse(companiesWithJobs);
}

// Statistics Public API
async function handleStatisticsPublicAPI(url: string, method: string, init?: RequestInit): Promise<Response> {
  if (method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
  const companies = getEntity<Company>(DEMO_STORAGE_KEYS.COMPANIES);
  const jobPositions = getEntity<JobPosition>(DEMO_STORAGE_KEYS.JOB_POSITIONS);
  const internships = getEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS);
  const users = getEntity<User>(DEMO_STORAGE_KEYS.USERS);
  const universities = getEntity<University>(DEMO_STORAGE_KEYS.UNIVERSITIES);

  // Calculate statistics
  const activeCompanies = companies.filter((c) => c.isActive);
  const activeJobPositions = jobPositions.filter((jp) => jp.isActive);
  const activeInternships = internships.filter((i) => i.status === "approved");
  const completedInternships = internships.filter((i) => i.status === "completed");

  // Internships by status
  const internshipsByStatus = internships.reduce((acc, internship) => {
    const status = internship.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Companies by type
  const companiesByType = activeCompanies.reduce((acc, company) => {
    const type = company.type || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly stats (last 12 months)
  const monthlyStats: Array<{ month: string; count: number }> = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const count = internships.filter((i) => {
      const createdAt = new Date(i.createdAt as any);
      return (
        createdAt.getFullYear() === date.getFullYear() &&
        createdAt.getMonth() === date.getMonth()
      );
    }).length;
    monthlyStats.push({ month, count });
  }

  // Stats by university
  const statsByUniversity = students.reduce((acc, student) => {
    const universityId = student.universityId || "unknown";
    acc[universityId] = (acc[universityId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return jsonResponse({
    overview: {
      totalStudents: students.length,
      totalCompanies: activeCompanies.length,
      totalJobPositions: activeJobPositions.length,
      totalInternships: internships.length,
      activeInternships: activeInternships.length,
      completedInternships: completedInternships.length,
      totalUsers: users.length,
      totalUniversities: universities.length,
    },
    internshipsByStatus: Object.entries(internshipsByStatus).map(([status, count]) => ({
      status,
      count,
    })),
    companiesByType: Object.entries(companiesByType)
      .filter(([type]) => type !== "unknown")
      .map(([type, count]) => ({
        type,
        count,
      })),
    monthlyStats,
    statsByUniversity: Object.entries(statsByUniversity).map(([universityId, count]) => ({
      universityId,
      count,
    })),
  });
}

// Announcements Public API
async function handleAnnouncementsPublicAPI(
  url: string,
  method: string,
  init?: RequestInit
): Promise<Response> {
  if (method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const urlObj = new URL(url, window.location.origin);
  const search = urlObj.searchParams.get("search");
  const type = urlObj.searchParams.get("type");
  const priority = urlObj.searchParams.get("priority");
  const page = parseInt(urlObj.searchParams.get("page") || "1");
  const limit = parseInt(urlObj.searchParams.get("limit") || "10");

  let announcements = getEntity<Announcement>(DEMO_STORAGE_KEYS.ANNOUNCEMENTS);

  // Filter active and public announcements (no target roles or empty target roles)
  announcements = announcements.filter(
    (a) =>
      a.isActive &&
      (!a.targetRoles || (Array.isArray(a.targetRoles) && a.targetRoles.length === 0))
  );

  // Filter by expiration
  const now = new Date();
  announcements = announcements.filter((a) => {
    if (!a.expiresAt) return true;
    return new Date(a.expiresAt as any) > now;
  });

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    announcements = announcements.filter(
      (a) =>
        a.title?.toLowerCase().includes(searchLower) ||
        a.content?.toLowerCase().includes(searchLower)
    );
  }

  if (type) {
    announcements = announcements.filter((a) => a.type === type);
  }

  if (priority) {
    announcements = announcements.filter((a) => a.priority === priority);
  }

  // Sort by createdAt descending
  announcements.sort((a, b) => {
    const dateA = new Date(a.createdAt as any).getTime();
    const dateB = new Date(b.createdAt as any).getTime();
    return dateB - dateA;
  });

  // Pagination
  const total = announcements.length;
  const offset = (page - 1) * limit;
  const paginatedAnnouncements = announcements.slice(offset, offset + limit);

  return jsonResponse({
    announcements: paginatedAnnouncements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// Student Resumes Pending API
async function handleStudentResumesPendingAPI(method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session || (session.role !== "admin" && session.role !== "director")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  if (method === "GET") {
    const students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
    const pending = students.filter((s) => s.resumeStatus === false || s.resumeStatus === null);
    return jsonResponse(pending);
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Internship Actions API
async function handleInternshipActionsAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  // Confirm
  const confirmMatch = pathname.match(/^\/api\/internships\/([^/]+)\/confirm$/);
  if (confirmMatch && method === "POST") {
    const id = confirmMatch[1];
    const updated = updateEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS, id, {
      isConfirm: "yes",
      status: "approved",
      updatedAt: new Date().toISOString() as any,
    });
    if (!updated) return jsonResponse({ error: "Not found" }, 404);
    return jsonResponse(updated);
  }

  // Unconfirm
  const unconfirmMatch = pathname.match(/^\/api\/internships\/([^/]+)\/unconfirm$/);
  if (unconfirmMatch && method === "POST") {
    const id = unconfirmMatch[1];
    const updated = updateEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS, id, {
      isConfirm: "no",
      updatedAt: new Date().toISOString() as any,
    });
    if (!updated) return jsonResponse({ error: "Not found" }, 404);
    return jsonResponse(updated);
  }

  // Send
  const sendMatch = pathname.match(/^\/api\/internships\/([^/]+)\/send$/);
  if (sendMatch && method === "POST") {
    const id = sendMatch[1];
    const updated = updateEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS, id, {
      isSend: "yes",
      updatedAt: new Date().toISOString() as any,
    });
    if (!updated) return jsonResponse({ error: "Not found" }, 404);
    return jsonResponse(updated);
  }

  // Unsend
  const unsendMatch = pathname.match(/^\/api\/internships\/([^/]+)\/unsend$/);
  if (unsendMatch && method === "POST") {
    const id = unsendMatch[1];
    const updated = updateEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS, id, {
      isSend: "no",
      updatedAt: new Date().toISOString() as any,
    });
    if (!updated) return jsonResponse({ error: "Not found" }, 404);
    return jsonResponse(updated);
  }

  // Return
  const returnMatch = pathname.match(/^\/api\/internships\/([^/]+)\/return$/);
  if (returnMatch && method === "POST") {
    const id = returnMatch[1];
    const updated = updateEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS, id, {
      status: "pending",
      isSend: "no",
      updatedAt: new Date().toISOString() as any,
    });
    if (!updated) return jsonResponse({ error: "Not found" }, 404);
    return jsonResponse(updated);
  }

  // Detail
  const detailMatch = pathname.match(/^\/api\/internships\/([^/]+)\/detail$/);
  if (detailMatch && method === "GET") {
    const id = detailMatch[1];
    const internship = getEntityById<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS, id);
    if (!internship) return jsonResponse({ error: "Not found" }, 404);
    // Return internship with related data
    const students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
    const companies = getEntity<Company>(DEMO_STORAGE_KEYS.COMPANIES);
    const jobPositions = getEntity<JobPosition>(DEMO_STORAGE_KEYS.JOB_POSITIONS);
    const student = students.find((s) => s.id === internship.studentId);
    const company = companies.find((c) => c.id === internship.companyId);
    const jobPosition = jobPositions.find((jp) => jp.id === internship.jobPositionId);
    return jsonResponse({
      ...internship,
      student,
      company,
      jobPosition,
    });
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Internship Co-Students API
async function handleInternshipCoStudentsAPI(method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (method === "GET") {
    const internships = getEntity<Internship>(DEMO_STORAGE_KEYS.INTERNSHIPS);
    const students = getEntity<Student>(DEMO_STORAGE_KEYS.STUDENTS);
    // Return students who have internships at the same company
    const coStudents: any[] = [];
    internships.forEach((internship) => {
      const student = students.find((s) => s.id === internship.studentId);
      if (student) {
        coStudents.push({
          ...student,
          companyId: internship.companyId,
          internshipId: internship.id,
        });
      }
    });
    return jsonResponse(coStudents);
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Upload API
async function handleUploadAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (method === "POST") {
    // Return mock URL for uploaded file
    const mockUrl = `/uploads/demo/${generateId()}.${pathname.includes("resume") ? "pdf" : "jpg"}`;
    return jsonResponse({ url: mockUrl, filename: `demo-file-${Date.now()}` });
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Email API
async function handleEmailAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  // Send email
  if (pathname === "/api/email/send" && method === "POST") {
    return jsonResponse({ success: true, message: "Email sent successfully (demo mode)" });
  }

  // Email settings
  if (pathname === "/api/email/settings") {
    if (method === "GET") {
      const settings = getEntity<any>(DEMO_STORAGE_KEYS.EMAIL_SETTINGS);
      return jsonResponse(settings[0] || null);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newSetting: any = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.EMAIL_SETTINGS, newSetting);
      return jsonResponse(newSetting, 201);
    }
  }

  // Email settings by ID
  const settingsMatch = pathname.match(/^\/api\/email\/settings\/([^/]+)$/);
  if (settingsMatch) {
    const id = settingsMatch[1];
    if (method === "GET") {
      const setting = getEntityById<any>(DEMO_STORAGE_KEYS.EMAIL_SETTINGS, id);
      if (!setting) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(setting);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updated = updateEntity<any>(DEMO_STORAGE_KEYS.EMAIL_SETTINGS, id, {
        ...body,
        updatedAt: new Date().toISOString() as any,
      });
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
  }

  // Email templates
  if (pathname === "/api/email/templates") {
    if (method === "GET") {
      const templates = getEntity<any>(DEMO_STORAGE_KEYS.EMAIL_TEMPLATES);
      return jsonResponse(templates);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newTemplate: any = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.EMAIL_TEMPLATES, newTemplate);
      return jsonResponse(newTemplate, 201);
    }
  }

  // Email template by ID
  const templateMatch = pathname.match(/^\/api\/email\/templates\/([^/]+)$/);
  if (templateMatch) {
    const id = templateMatch[1];
    if (method === "GET") {
      const template = getEntityById<any>(DEMO_STORAGE_KEYS.EMAIL_TEMPLATES, id);
      if (!template) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(template);
    }
    if (method === "PATCH") {
      const body = await parseBody(init);
      const updated = updateEntity<any>(DEMO_STORAGE_KEYS.EMAIL_TEMPLATES, id, {
        ...body,
        updatedAt: new Date().toISOString() as any,
      });
      if (!updated) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(updated);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.EMAIL_TEMPLATES, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Backup API
async function handleBackupAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  if (pathname === "/api/backups") {
    if (method === "GET") {
      const backups = getEntity<any>(DEMO_STORAGE_KEYS.BACKUPS);
      return jsonResponse(backups);
    }
    if (method === "POST") {
      const body = await parseBody(init);
      const newBackup: any = {
        id: generateId(),
        ...body,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      addEntity(DEMO_STORAGE_KEYS.BACKUPS, newBackup);
      return jsonResponse(newBackup, 201);
    }
  }

  // Backup by ID
  const match = pathname.match(/^\/api\/backups\/([^/]+)$/);
  if (match) {
    const id = match[1];
    if (method === "GET") {
      const backup = getEntityById<any>(DEMO_STORAGE_KEYS.BACKUPS, id);
      if (!backup) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse(backup);
    }
    if (method === "DELETE") {
      const deleted = deleteEntity(DEMO_STORAGE_KEYS.BACKUPS, id);
      if (!deleted) return jsonResponse({ error: "Not found" }, 404);
      return jsonResponse({ message: "Deleted successfully" });
    }
  }

  // Download backup
  const downloadMatch = pathname.match(/^\/api\/backups\/([^/]+)\/download$/);
  if (downloadMatch && method === "GET") {
    const id = downloadMatch[1];
    const backup = getEntityById<any>(DEMO_STORAGE_KEYS.BACKUPS, id);
    if (!backup) return jsonResponse({ error: "Not found" }, 404);
    // Return mock file data
    return new Response(JSON.stringify({ data: "mock-backup-data" }), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup-${id}.json"`,
      },
    });
  }

  // Restore backup
  const restoreMatch = pathname.match(/^\/api\/backups\/([^/]+)\/restore$/);
  if (restoreMatch && method === "POST") {
    return jsonResponse({ success: true, message: "Backup restored successfully (demo mode)" });
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Announcement Actions API
async function handleAnnouncementActionsAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  // Mark as read
  const readMatch = pathname.match(/^\/api\/announcements\/([^/]+)\/read$/);
  if (readMatch && method === "POST") {
    return jsonResponse({ success: true, message: "Announcement marked as read" });
  }

  // Unread announcements
  if (pathname === "/api/announcements/unread" && method === "GET") {
    const announcements = getEntity<Announcement>(DEMO_STORAGE_KEYS.ANNOUNCEMENTS);
    return jsonResponse(announcements.filter((a) => a.isActive));
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// University Regenerate Invite API
async function handleUniversityRegenerateInviteAPI(pathname: string, method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const match = pathname.match(/^\/api\/universities\/([^/]+)\/regenerate-invite$/);
  if (match && method === "POST") {
    const id = match[1];
    const university = getEntityById<University>(DEMO_STORAGE_KEYS.UNIVERSITIES, id);
    if (!university) return jsonResponse({ error: "Not found" }, 404);
    const newInviteCode = `DEMO${Date.now()}`;
    const updated = updateEntity<University>(DEMO_STORAGE_KEYS.UNIVERSITIES, id, {
      inviteCode: newInviteCode,
      updatedAt: new Date().toISOString() as any,
    });
    return jsonResponse(updated);
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// University Validate Invite API
async function handleUniversityValidateInviteAPI(method: string, init?: RequestInit): Promise<Response> {
  if (method === "POST") {
    const body = await parseBody(init);
    const universities = getEntity<University>(DEMO_STORAGE_KEYS.UNIVERSITIES);
    const university = universities.find((u) => u.inviteCode === body.inviteCode);
    if (university) {
      return jsonResponse({ valid: true, university });
    }
    return jsonResponse({ valid: false }, 400);
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Notification Settings API
async function handleNotificationSettingsAPI(method: string, init?: RequestInit): Promise<Response> {
  const session = getSession();
  if (!session) return jsonResponse({ error: "Unauthorized" }, 401);

  if (method === "GET") {
    // Return default settings
    return jsonResponse({
      email: true,
      push: true,
      sms: false,
    });
  }
  if (method === "POST") {
    const body = await parseBody(init);
    return jsonResponse({ ...body, message: "Settings saved successfully" });
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function parseBody(init?: RequestInit): Promise<any> {
  if (!init?.body) return {};
  if (typeof init.body === "string") {
    return JSON.parse(init.body);
  }
  if (init.body instanceof FormData) {
    const obj: any = {};
    init.body.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  return {};
}

function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
