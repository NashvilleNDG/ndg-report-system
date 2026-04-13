import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "TEAM" | "CLIENT";
      clientId: string | null;
    };
  }

  interface User {
    role: "ADMIN" | "TEAM" | "CLIENT";
    clientId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "TEAM" | "CLIENT";
    clientId: string | null;
  }
}
