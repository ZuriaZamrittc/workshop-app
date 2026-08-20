import AuthLayout from "@/components/AuthLayout";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      welcome="Locked out?"
      welcomeAccent="No problem."
      intro="Tell us the email address on your account and we'll send a link to set a new password."
      title="Reset"
      titleAccent="Password"
      subtitle="We'll email you a secure link"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
