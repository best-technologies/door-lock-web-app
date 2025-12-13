export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Converts technical errors to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return getUserFriendlyMessage(error.message, error.statusCode);
  }

  // Handle NetworkError instances
  if (error instanceof NetworkError) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Network-related errors
    if (
      errorMessage.includes("fetch") ||
      errorMessage.includes("network") ||
      errorMessage.includes("failed to fetch")
    ) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }

    // CORS errors
    if (errorMessage.includes("cors")) {
      return "Connection error. Please try again later.";
    }

    // Timeout errors
    if (errorMessage.includes("timeout")) {
      return "The request took too long. Please try again.";
    }

    // JSON parsing errors
    if (errorMessage.includes("json") || errorMessage.includes("parse")) {
      return "Invalid response from server. Please try again later.";
    }

    // Route/endpoint errors
    if (
      errorMessage.includes("cannot post") ||
      errorMessage.includes("cannot get") ||
      errorMessage.includes("cannot put") ||
      errorMessage.includes("cannot patch") ||
      errorMessage.includes("cannot delete")
    ) {
      // In development, provide more helpful error message
      if (process.env.NODE_ENV === "development") {
        return `Endpoint not found. Please verify the API endpoint exists on the server. (${message})`;
      }
      return "The service is temporarily unavailable. Please try again later.";
    }

    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      if (process.env.NODE_ENV === "development") {
        return `The requested endpoint was not found (404). Please check if the API route exists.`;
      }
      return "The requested resource was not found.";
    }

    // Return the original message if it seems user-friendly
    if (
      errorMessage.includes("invalid email") ||
      errorMessage.includes("invalid password") ||
      errorMessage.includes("user account") ||
      errorMessage.includes("already exists")
    ) {
      return error.message;
    }

    // Default for unknown errors
    return "An unexpected error occurred. Please try again.";
  }

  // Handle string errors
  if (typeof error === "string") {
    return getUserFriendlyMessage(error);
  }

  // Fallback for unknown error types
  return "An unexpected error occurred. Please try again.";
}

/**
 * Converts API error messages to user-friendly messages based on status code and message
 */
function getUserFriendlyMessage(
  message: string,
  statusCode?: number
): string {
  const lowerMessage = message.toLowerCase();

  // Handle specific status codes
  if (statusCode === 401) {
    if (lowerMessage.includes("suspended")) {
      return "Your account has been suspended. Please contact support.";
    }
    if (lowerMessage.includes("invalid") || lowerMessage.includes("password")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    return "Invalid email or password. Please check your credentials and try again.";
  }

  if (statusCode === 400) {
    if (lowerMessage.includes("validation")) {
      return "Please check your input and try again.";
    }
    return "Invalid request. Please check your input and try again.";
  }

  if (statusCode === 409) {
    if (lowerMessage.includes("email")) {
      return "An account with this email already exists.";
    }
    if (lowerMessage.includes("employee")) {
      return "An account with this employee ID already exists.";
    }
    return "This information is already in use. Please use different details.";
  }

  if (statusCode === 404) {
    // Check if it's a "Cannot POST/GET" error (Express route not found)
    if (lowerMessage.includes("cannot post") || lowerMessage.includes("cannot get")) {
      if (process.env.NODE_ENV === "development") {
        return `API endpoint not found. The route "${message.replace(/Cannot (POST|GET) /i, '')}" doesn't exist on the server. Please verify the backend API is running and the route is configured.`;
      }
      return "The API endpoint is not available. Please contact support.";
    }
    return "The requested resource was not found.";
  }

  if (statusCode === 500) {
    return "Server error. Please try again later.";
  }

  if (statusCode === 503) {
    return "Service temporarily unavailable. Please try again later.";
  }

  // Handle specific error messages
  if (lowerMessage.includes("invalid email or password")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }

  if (lowerMessage.includes("user account is suspended")) {
    return "Your account has been suspended. Please contact support.";
  }

  if (lowerMessage.includes("user with this email already exists")) {
    return "An account with this email already exists.";
  }

  if (lowerMessage.includes("validation failed")) {
    return "Please check your input and try again.";
  }

  // Return original message if it's already user-friendly
  return message;
}

