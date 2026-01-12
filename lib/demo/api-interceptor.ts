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

  // Universities
  if (pathname === "/api/universities" || pathname.startsWith("/api/universities/")) {
    return handleUniversitiesAPI(pathname, method, init);
  }

  // Announcements
  if (pathname === "/api/announcements" || pathname.startsWith("/api/announcements/")) {
    return handleAnnouncementsAPI(pathname, method, init);
  }

  // Notifications
  if (pathname === "/api/notifications" || pathname.startsWith("/api/notifications/")) {
    return handleNotificationsAPI(pathname, method, init);
  }

  // Reports
  if (pathname === "/api/reports") {
    return handleReportsAPI();
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
