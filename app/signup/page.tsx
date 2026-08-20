import BrandHeader from "@/components/BrandHeader";
import SignupForm from "@/components/SignupForm";
import PhotoBackdrop from "@/components/PhotoBackdrop";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <BrandHeader />
      <PhotoBackdrop className="flex flex-1 items-center">
        <div className="mx-auto flex w-full max-w-6xl justify-center px-4 py-12 lg:justify-end">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <SignupForm />
          </div>
        </div>
      </PhotoBackdrop>
    </div>
  );
}
