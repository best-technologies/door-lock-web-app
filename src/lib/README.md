# State Management Setup

This project uses **Zustand** for client-side state management and **TanStack Query** for server state management.

## Structure

```
src/
├── store/
│   └── auth-store.ts          # Zustand store for authentication state
├── hooks/
│   ├── use-auth.ts            # Auth mutations (sign-in, register, sign-out)
│   └── use-auth-state.ts      # Auth state accessor hook
├── lib/
│   ├── api-client.ts          # Base API client with token management
│   └── api/
│       └── identity.ts        # Identity API endpoints
├── types/
│   └── api.ts                 # TypeScript types and enums
└── providers/
    └── query-provider.tsx     # TanStack Query provider
```

## Usage Examples

### Authentication

#### Sign In
```typescript
import { useSignIn } from "@/hooks/use-auth";

function LoginForm() {
  const signIn = useSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    signIn.mutate({
      email: "user@example.com",
      password: "password123",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={signIn.isPending}>
        {signIn.isPending ? "Signing in..." : "Sign In"}
      </button>
      {signIn.isError && <p>{signIn.error.message}</p>}
    </form>
  );
}
```

#### Register
```typescript
import { useRegister } from "@/hooks/use-auth";
import { UserRole, UserStatus, AccessMethod } from "@/types/api";

function RegisterForm() {
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      role: UserRole.STAFF,
      allowedAccessMethods: [AccessMethod.RFID, AccessMethod.FINGERPRINT],
      status: UserStatus.ACTIVE,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={register.isPending}>
        Register
      </button>
    </form>
  );
}
```

#### Access Auth State
```typescript
import { useAuthState } from "@/hooks/use-auth-state";

function UserProfile() {
  const { user, isAuthenticated } = useAuthState();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

#### Sign Out
```typescript
import { useSignOut } from "@/hooks/use-auth";

function SignOutButton() {
  const signOut = useSignOut();

  return <button onClick={signOut}>Sign Out</button>;
}
```

### API Calls with TanStack Query

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Fetch data
function UsersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get("/users");
      return response.data || [];
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.userId}>{user.email}</li>
      ))}
    </ul>
  );
}

// Mutate data
function CreateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userData: any) => apiClient.post("/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: "New User" })}>
      Create User
    </button>
  );
}
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

## Features

- ✅ JWT token management (automatic inclusion in requests)
- ✅ Persistent auth state (survives page refresh)
- ✅ Type-safe API calls
- ✅ Automatic token refresh handling
- ✅ Query caching and invalidation
- ✅ Error handling
- ✅ Loading states

