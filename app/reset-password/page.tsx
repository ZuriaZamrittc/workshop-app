import AuthLayout from "@/components/AuthLayout";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      welcome="Almost there,"
      welcomeAccent="one step left."
      intro="Choose a new password. Once it's saved you'll be signed straight in to your listings."
      title="New"
      titleAccent="Password"
      subtitle="Choose something you'll remember"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
