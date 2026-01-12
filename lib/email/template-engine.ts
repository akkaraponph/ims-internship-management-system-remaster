export interface TemplateVariables {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Renders an email template by replacing variables in the format {{variableName}}
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let rendered = template;

  // Replace all {{variable}} patterns
  Object.keys(variables).forEach((key) => {
    const value = variables[key];
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(regex, String(value ?? ""));
  });

  // Remove any remaining {{variable}} patterns that weren't replaced
  rendered = rendered.replace(/\{\{[^}]+\}\}/g, "");

  return rendered;
}

/**
 * Extracts variable names from a template
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Validates that all required variables are provided
 */
export function validateVariables(
  template: string,
  providedVariables: TemplateVariables
): { valid: boolean; missing: string[] } {
  const required = extractVariables(template);
  const provided = Object.keys(providedVariables);
  const missing = required.filter((v) => !provided.includes(v));

  return {
    valid: missing.length === 0,
    missing,
  };
}
