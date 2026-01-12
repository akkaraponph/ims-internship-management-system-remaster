"use client";

import { DEMO_STORAGE_KEYS, type DemoStorageKey } from "./storage-keys";
import { generateMockData } from "./mock-data";
import type { UserRole, User } from "@/types";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_STORAGE_KEYS.MODE) === "true";
}

export function enableDemoMode(role?: UserRole): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_STORAGE_KEYS.MODE, "true");
  // Set cookie for server-side access
  document.cookie = `demo_mode=true; path=/; max-age=86400`;
  
  // Save role if provided
  if (role) {
    setSelectedRole(role);
  }
  
  // Initialize mock data if not already present
  if (!localStorage.getItem(DEMO_STORAGE_KEYS.UNIVERSITIES)) {
    const mockData = generateMockData();
    
    localStorage.setItem(DEMO_STORAGE_KEYS.UNIVERSITIES, JSON.stringify(mockData.universities));
    localStorage.setItem(DEMO_STORAGE_KEYS.USERS, JSON.stringify(mockData.users));
    localStorage.setItem(DEMO_STORAGE_KEYS.STUDENTS, JSON.stringify(mockData.students));
    localStorage.setItem(DEMO_STORAGE_KEYS.COMPANIES, JSON.stringify(mockData.companies));
    localStorage.setItem(DEMO_STORAGE_KEYS.JOB_POSITIONS, JSON.stringify(mockData.jobPositions));
    localStorage.setItem(DEMO_STORAGE_KEYS.INTERNSHIPS, JSON.stringify(mockData.internships));
    localStorage.setItem(DEMO_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(mockData.announcements));
    localStorage.setItem(DEMO_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockData.notifications));
    localStorage.setItem(DEMO_STORAGE_KEYS.COMPANY_USERS, JSON.stringify(mockData.companyUsers));
    if (mockData.roles) {
      localStorage.setItem(DEMO_STORAGE_KEYS.ROLES, JSON.stringify(mockData.roles));
    }
  }
}

export function disableDemoMode(): void {
  if (typeof window === "undefined") return;
  
  // Clear all demo data including selected role
  Object.values(DEMO_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  clearSelectedRole();
  clearSession();
  // Clear demo mode cookie
  document.cookie = "demo_mode=; path=/; max-age=0";
}

export function getEntity<T>(key: DemoStorageKey): T[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    // Handle notifications which is stored as Record<string, Notification[]>
    if (key === DEMO_STORAGE_KEYS.NOTIFICATIONS && typeof parsed === "object" && !Array.isArray(parsed)) {
      // Flatten the object into an array
      return Object.values(parsed).flat() as T[];
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setEntity<T>(key: DemoStorageKey, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

export function getEntityById<T extends { id: string }>(key: DemoStorageKey, id: string): T | null {
  const entities = getEntity<T>(key);
  return entities.find((e) => e.id === id) || null;
}

export function addEntity<T extends { id: string }>(key: DemoStorageKey, entity: T): T {
  if (key === DEMO_STORAGE_KEYS.NOTIFICATIONS) {
    // Notifications are stored as Record<string, Notification[]>
    const data = localStorage.getItem(key);
    let notifications: Record<string, any[]> = {};
    if (data) {
      try {
        notifications = JSON.parse(data);
      } catch {
        notifications = {};
      }
    }
    const notification = entity as any;
    if (!notifications[notification.userId]) {
      notifications[notification.userId] = [];
    }
    notifications[notification.userId].push(notification);
    localStorage.setItem(key, JSON.stringify(notifications));
    return entity;
  }
  
  const entities = getEntity<T>(key);
  entities.push(entity);
  setEntity(key, entities);
  return entity;
}

export function updateEntity<T extends { id: string }>(key: DemoStorageKey, id: string, updates: Partial<T>): T | null {
  if (key === DEMO_STORAGE_KEYS.NOTIFICATIONS) {
    // Handle notifications specially
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      const notifications: Record<string, any[]> = JSON.parse(data);
      for (const userId in notifications) {
        const index = notifications[userId].findIndex((n: any) => n.id === id);
        if (index !== -1) {
          notifications[userId][index] = { ...notifications[userId][index], ...updates };
          localStorage.setItem(key, JSON.stringify(notifications));
          return notifications[userId][index] as T;
        }
      }
    } catch {
      return null;
    }
    return null;
  }
  
  const entities = getEntity<T>(key);
  const index = entities.findIndex((e) => e.id === id);
  if (index === -1) return null;
  
  // Preserve updatedAt if not provided
  const finalUpdates = { ...updates };
  if (!finalUpdates.updatedAt && (entities[index] as any).updatedAt) {
    finalUpdates.updatedAt = new Date().toISOString() as any;
  }
  
  entities[index] = { ...entities[index], ...finalUpdates };
  setEntity(key, entities);
  return entities[index];
}

export function deleteEntity<T extends { id: string }>(key: DemoStorageKey, id: string): boolean {
  const entities = getEntity<T>(key);
  const filtered = entities.filter((e) => e.id !== id);
  if (filtered.length === entities.length) return false;
  
  setEntity(key, filtered);
  return true;
}

export function getSession(): any {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(DEMO_STORAGE_KEYS.SESSION);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setSession(session: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_STORAGE_KEYS.SESSION, JSON.stringify(session));
  // Also set cookie for server-side access
  document.cookie = `demo_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400`;
  // Also set demo_mode cookie to indicate demo mode is active
  document.cookie = `demo_mode=true; path=/; max-age=86400`;
  // Dispatch custom event to notify session change
  window.dispatchEvent(new Event("demo-session-changed"));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_STORAGE_KEYS.SESSION);
  // Clear cookies
  document.cookie = "demo_session=; path=/; max-age=0";
  // Dispatch custom event to notify session change
  window.dispatchEvent(new Event("demo-session-changed"));
}

export function clearDemoSessionOnly(): void {
  if (typeof window === "undefined") return;
  
  // Clear session only
  localStorage.removeItem(DEMO_STORAGE_KEYS.SESSION);
  localStorage.removeItem(DEMO_STORAGE_KEYS.SELECTED_ROLE);
  
  // Clear session cookies
  document.cookie = "demo_session=; path=/; max-age=0";
  
  // Clear demo_mode cookie (so middleware doesn't think demo is active)
  document.cookie = "demo_mode=; path=/; max-age=0";
  
  // Clear demo mode flag in localStorage (so isDemoMode() returns false)
  localStorage.removeItem(DEMO_STORAGE_KEYS.MODE);
  
  // Dispatch event for UI updates
  window.dispatchEvent(new Event("demo-session-changed"));
  
  // Note: All demo data (users, students, companies, internships, etc.) is preserved
}

export function resetDemoData(): void {
  if (typeof window === "undefined") return;
  
  // Clear all demo data except mode and selected role
  const mode = localStorage.getItem(DEMO_STORAGE_KEYS.MODE);
  const selectedRole = getSelectedRole();
  Object.values(DEMO_STORAGE_KEYS).forEach((key) => {
    if (key !== DEMO_STORAGE_KEYS.MODE && key !== DEMO_STORAGE_KEYS.SELECTED_ROLE) {
      localStorage.removeItem(key);
    }
  });
  
  // Regenerate mock data
  if (mode === "true") {
    enableDemoMode(selectedRole || undefined);
  }
}

// Role selection functions
export function getSelectedRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(DEMO_STORAGE_KEYS.SELECTED_ROLE);
  if (!role) return null;
  return role as UserRole;
}

export function setSelectedRole(role: UserRole): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_STORAGE_KEYS.SELECTED_ROLE, role);
}

export function clearSelectedRole(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_STORAGE_KEYS.SELECTED_ROLE);
}

// Auto-login function
export function loginAsRole(role: UserRole): { success: boolean; session?: any; error?: string } {
  if (typeof window === "undefined") {
    return { success: false, error: "Not in browser environment" };
  }

  const users = getEntity<User>(DEMO_STORAGE_KEYS.USERS);
  const user = users.find((u) => u.role === role && u.isActive);

  if (!user) {
    return { success: false, error: `No active user found for role: ${role}` };
  }

  // Get companyId if company user
  let companyId = null;
  if (role === "company") {
    const companyUsers = getEntity(DEMO_STORAGE_KEYS.COMPANY_USERS);
    const companyUser = companyUsers.find((cu: any) => cu.userId === user.id);
    if (companyUser) {
      companyId = companyUser.companyId;
    }
  }

  const sessionData = {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    universityId: user.universityId,
    companyId: companyId,
  };

  setSession(sessionData);
  setSelectedRole(role);

  return { success: true, session: sessionData };
}
