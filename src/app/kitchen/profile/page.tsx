
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Briefcase, Building } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  branchName: string;
}

const ProfileInfoRow = ({ icon: Icon, label, value, valueClassName }: { icon: React.ElementType, label: string, value: string, valueClassName?: string }) => (
  <div className="flex items-center gap-4">
    <Icon className="h-5 w-5 text-cyan-400" />
    <div className="flex-grow">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-base font-medium ${valueClassName}`}>{value}</p>
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
      <div className="p-4 md:p-8 flex flex-col items-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-8 w-40 mt-4" />
        <Card className="w-full mt-8 bg-card/70 border-white/10 shadow-lg">
          <CardContent className="space-y-4 p-4 md:p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
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
    <div className="p-0 md:p-8">
       <div className="flex flex-col items-center text-center mb-8">
         <Avatar className="h-24 w-24 mb-4 border-4 border-cyan-400/50">
            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}&backgroundColor=transparent&textColor=22d3ee`} alt={profile.name} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
       </div>
      <Card className="w-full mx-auto bg-card/70 border-white/10 shadow-lg">
        <CardContent className="space-y-6 p-6 md:p-6">
            <ProfileInfoRow icon={Mail} label="Email" value={profile.email} />
            <ProfileInfoRow icon={Briefcase} label="Role" value={profile.role} valueClassName="capitalize" />
            <ProfileInfoRow icon={Building} label="Branch" value={profile.branchName} />
        </CardContent>
      </Card>
    </div>
  );
}


