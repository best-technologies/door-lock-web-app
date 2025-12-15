import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://embedded-door-lock.onrender.com";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters from the request
    const searchParams = request.nextUrl.searchParams;
    
    // Build the query string for the backend API
    const queryString = searchParams.toString();
    const backendUrl = `${API_BASE_URL}${API_VERSION}/attendance/stats${queryString ? `?${queryString}` : ""}`;
    
    // Get the authorization token from the request headers
    const authHeader = request.headers.get("authorization");
    
    // Prepare headers for the backend request
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    // Log the request being made
    console.log("\n📡 [ATTENDANCE STATS API] Fetching attendance statistics from backend...");
    console.log("📍 URL:", backendUrl);
    console.log("🔧 Method: GET");
    console.log("📤 Headers:", {
      ...headers,
      Authorization: authHeader ? "Bearer ***" : undefined,
    });
    console.log("🔍 Query Params:", Object.fromEntries(searchParams.entries()));
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
    });
    
    // Get the response data
    const responseData = await response.json();
    
    // Log the response to terminal
    console.log("\n✅ [ATTENDANCE STATS API] Backend Response Received:");
    console.log("📊 Status:", response.status, response.statusText);
    console.log("📥 Response Data:", JSON.stringify(responseData, null, 2));
    console.log("📏 Response Size:", JSON.stringify(responseData).length, "bytes");
    
    if (responseData.data) {
      console.log("📈 Stats Data:", responseData.data);
    }
    console.log("─".repeat(80) + "\n");
    
    // Return the response to the client
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("\n❌ [ATTENDANCE STATS API] Error fetching attendance statistics:");
    console.error("Error:", error);
    console.log("─".repeat(80) + "\n");
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch attendance statistics",
      },
      { status: 500 }
    );
  }
}

