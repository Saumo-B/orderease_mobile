
'use client';

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Themes</h1>
        <p className="text-muted-foreground">
          Switch between dark and light mode.
        </p>
      </div>
      <div className="space-y-4">
        <Card className="bg-card/70 border-white/10 shadow-lg">
          <div className="px-4 py-2 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <Moon className="h-5 w-5 text-cyan-300" />
              <span className="text-base font-medium text-white transition-colors">
                Dark
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Switch checked={true} />
            </div>
          </div>
        </Card>
        <Card className="bg-card/70 border-white/10 shadow-lg">
          <div className="px-4 py-2 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <Sun className="h-5 w-5 text-cyan-300" />
              <span className="text-base font-medium text-white transition-colors">
                Light
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Switch checked={false} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
