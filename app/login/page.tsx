import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";
import { brand } from "@/lib/config/brand";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthLayout
      welcome="Welcome back,"
      welcomeAccent="seller."
      intro={`Sign in to manage your ${brand.name} listings — add a car, update the details, or take one off the market.`}
      title="Seller"
      titleAccent="Portal"
      subtitle="Please sign in to continue"
    >
      <LoginForm confirmError={error === "confirm"} />
    </AuthLayout>
  );
}
