import SignupForm from '@/components/SignupForm';

export const metadata = {
  title: '회원가입 | 스쿨 보드',
  description: '스쿨 보드 회원가입 및 자녀 정보 등록',
};

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
}
