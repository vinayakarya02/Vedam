import { Suspense } from "react";
import { RegistrationSuccess } from "@/features/registration/registration-success";

export default function RegistrationSuccessPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center">
      <div className="mx-auto max-w-lg px-4 w-full">
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
          <RegistrationSuccess />
        </Suspense>
      </div>
    </div>
  );
}
