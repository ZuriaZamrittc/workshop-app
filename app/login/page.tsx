import BrandHeader from "@/components/BrandHeader";
import LoginForm from "@/components/LoginForm";
import PhotoBackdrop from "@/components/PhotoBackdrop";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <BrandHeader />
      <PhotoBackdrop className="flex flex-1 items-center">
        {/* The photo leaves space on the right — the card sits there on wide
            screens and centres on narrow ones. */}
        <div className="mx-auto flex w-full max-w-6xl justify-center px-4 py-12 lg:justify-end">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <LoginForm confirmError={error === "confirm"} />
          </div>
        </div>
      </PhotoBackdrop>
    </div>
  );
}
