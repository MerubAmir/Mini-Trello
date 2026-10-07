import { NextResponse } from "next/server";

export const databaseError = (error: unknown) => {
  console.error(error);

  return NextResponse.json(
    {
      error:
        "Database connection failed. Check DATABASE_URL, then run prisma db push."
    },
    { status: 500 }
  );
};
