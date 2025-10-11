
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Building, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  branchName: string;
}

const ProfileInfoRow = ({ icon: Icon, label, value, valueClassName }: { icon: React.ElementType, label: string, value: string, valueClassName?: string }) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-cyan-400 mt-1" />
    <div className="flex-grow">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-lg font-medium ${valueClassName}`}>{value}</p>
    </div>
  </div>
);


export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      // Use the static profile which is not modified by the branch switcher
      const storedProfile = localStorage.getItem('staticUserProfile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-card/70 border-white/10 shadow-lg">
        <CardHeader className="text-center">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-8 w-48 mt-4 mx-auto" />
            <Skeleton className="h-4 w-64 mt-2 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-6 p-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p>No profile data found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl mx-auto bg-card/70 border-white/10 shadow-lg">
        <CardHeader className="text-center items-center">
          <Avatar className="h-24 w-24 mb-4 border-4 border-cyan-400/50">
            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`} alt={profile.name} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-white">{profile.name}</CardTitle>
          <CardDescription className="text-cyan-400 capitalize">{profile.role}</CardDescription>
        </CardHeader>
        <Separator className="my-4 bg-white/10" />
        <CardContent className="space-y-6 p-8">
            <ProfileInfoRow icon={Mail} label="Email" value={profile.email} />
            <ProfileInfoRow icon={Briefcase} label="Role" value={profile.role} valueClassName="capitalize" />
            <ProfileInfoRow icon={Building} label="Branch" value={profile.branchName} />
        </CardContent>
      </Card>
    </div>
  );
}
