// Input Validation Utilities
import DOMPurify from 'dompurify';

// Sanitize HTML content
export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html);
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^ -@]+@[^ -@]+.[^ -@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[ -()]/g, ''));
};

// Validate Google Sheets ID format
export const validateGoogleSheetsId = (id) => {
  const sheetsIdRegex = /^[a-zA-Z0-9-_]{44}$/;
  return sheetsIdRegex.test(id);
};

// Validate Google Apps Script ID format
export const validateGoogleAppsScriptId = (id) => {
  const scriptIdRegex = /^[a-zA-Z0-9-_]{44}$/;
  return scriptIdRegex.test(id);
};

// Validate Google Maps API Key format
export const validateGoogleMapsApiKey = (key) => {
  const apiKeyRegex = /^AIza[0-9A-Za-z-_]{35}$/;
  return apiKeyRegex.test(key);
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Validate and sanitize form data
export const validateFormData = (formData, schema) => {
  const errors = {};
  const sanitizedData = {};

  Object.keys(schema).forEach((field) => {
    const value = formData[field];
    const rules = schema[field];

    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`;
      return;
    }

    // Type validation
    if (value && rules.type) {
      if (rules.type === 'email' && !validateEmail(value)) {
        errors[field] = `${field} must be a valid email`;
        return;
      }

      if (rules.type === 'phone' && !validatePhone(value)) {
        errors[field] = `${field} must be a valid phone number`;
        return;
      }

      if (rules.type === 'sheets_id' && !validateGoogleSheetsId(value)) {
        errors[field] = `${field} must be a valid Google Sheets ID`;
        return;
      }

      if (rules.type === 'script_id' && !validateGoogleAppsScriptId(value)) {
        errors[field] = `${field} must be a valid Google Apps Script ID`;
        return;
      }

      if (rules.type === 'api_key' && !validateGoogleMapsApiKey(value)) {
        errors[field] = `${field} must be a valid Google Maps API Key`;
        return;
      }
    }

    // Length validation
    if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
      return;
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] =
        `${field} must be no more than ${rules.maxLength} characters`;
      return;
    }

    // Sanitize input
    if (value && rules.sanitize !== false) {
      sanitizedData[field] = sanitizeInput(value);
    } else {
      sanitizedData[field] = value;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData,
  };
};

// Common validation schemas
export const VALIDATION_SCHEMAS = {
  GOOGLE_CONFIG: {
    clientId: {
      required: true,
      type: 'email',
      minLength: 10,
      maxLength: 100,
    },
    spreadsheetId: {
      required: true,
      type: 'sheets_id',
    },
    appsScriptId: {
      required: true,
      type: 'script_id',
    },
    mapsApiKey: {
      required: true,
      type: 'api_key',
    },
  },

  USER_PROFILE: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      required: true,
      type: 'email',
    },
    phone: {
      required: false,
      type: 'phone',
    },
  },
};
