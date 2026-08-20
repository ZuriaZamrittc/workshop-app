import AuthLayout from "@/components/AuthLayout";
import SignupForm from "@/components/SignupForm";
import { brand } from "@/lib/config/brand";

export default function SignupPage() {
  return (
    <AuthLayout
      welcome="Start selling,"
      welcomeAccent="today."
      intro={`Create a free ${brand.name} account and list your first car in a minute. Your listing appears on the homepage for every visitor to see.`}
      title="Create"
      titleAccent="Account"
      subtitle="Join in under a minute"
    >
      <SignupForm />
    </AuthLayout>
  );
}
