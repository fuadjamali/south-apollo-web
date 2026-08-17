import CertificationForm from "@/components/CertificationForm";
import { createCertificationAction } from "../actions";

export default function NewCertificationPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add certification</h1>
        <CertificationForm action={createCertificationAction} submitLabel="Create certification" />
      </div>
    </div>
  );
}
