import {
  ProfileInfoCard,
  SecurityCard,
  SessionsCard,
} from "@/features/profile";

export function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink tracking-tight">
        Hồ sơ của tôi
      </h1>

      <ProfileInfoCard />
      <SecurityCard />
      <SessionsCard />
    </div>
  );
}

export default ProfilePage;
