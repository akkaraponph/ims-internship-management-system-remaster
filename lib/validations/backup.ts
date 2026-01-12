import { z } from "zod";

export const createBackupSchema = z.object({
  type: z.enum(["full", "partial"]),
  tables: z.array(z.string()).optional(),
});

export const restoreBackupSchema = z.object({
  backupId: z.string().uuid(),
  tables: z.array(z.string()).optional(),
});

export type CreateBackupInput = z.infer<typeof createBackupSchema>;
export type RestoreBackupInput = z.infer<typeof restoreBackupSchema>;
