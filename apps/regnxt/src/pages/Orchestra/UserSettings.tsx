import {useMemo, useState} from 'react';

import {UserSetting} from '@/types/databaseTypes';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Palette,
  Search,
  Settings2,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';

interface CategoryIcons {
  [key: string]: LucideIcon;
}
interface EditingStates {
  [key: number]: boolean;
}
interface GroupedSettings {
  [key: string]: UserSetting[];
}

const initialSettings: UserSetting[] = [
  {
    setting_id: 1,
    category: 'profile',
    setting_name: 'display_name',
    value: 'John Doe',
    description: 'Your display name shown across the application',
  },
  {
    setting_id: 2,
    category: 'profile',
    setting_name: 'email',
    value: 'john.doe@example.com',
    description: 'Primary email address for notifications',
  },
  {
    setting_id: 3,
    category: 'notifications',
    setting_name: 'email_notifications',
    value: 'enabled',
    description: 'Receive email notifications for important updates',
  },
  {
    setting_id: 4,
    category: 'notifications',
    setting_name: 'desktop_notifications',
    value: 'disabled',
    description: 'Show desktop notifications for alerts',
  },
  {
    setting_id: 5,
    category: 'security',
    setting_name: 'two_factor_auth',
    value: 'disabled',
    description: 'Enable two-factor authentication for added security',
  },
  {
    setting_id: 6,
    category: 'security',
    setting_name: 'session_timeout',
    value: '30',
    description: 'Session timeout in minutes',
  },
  {
    setting_id: 7,
    category: 'appearance',
    setting_name: 'theme',
    value: 'light',
    description: 'Application theme preference',
  },
  {
    setting_id: 8,
    category: 'appearance',
    setting_name: 'compact_view',
    value: 'false',
    description: 'Use compact view mode',
  },
];

const categoryIcons: CategoryIcons = {
  profile: User,
  notifications: Bell,
  security: Shield,
  appearance: Palette,
};

const UserSettings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSetting, setSelectedSetting] = useState<UserSetting | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingStates, setEditingStates] = useState<EditingStates>({});
  const [settings, setSettings] = useState<UserSetting[]>(initialSettings);

  const groupedSettings = useMemo<GroupedSettings>(() => {
    return settings.reduce((acc: GroupedSettings, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});
  }, [settings]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName]
    );
  };

  const filteredCategories = useMemo<[string, UserSetting[]][]>(() => {
    if (!searchTerm) {
      const entries = Object.entries(groupedSettings) as [string, UserSetting[]][];
      return entries;
    }

    const filtered = Object.entries(groupedSettings)
      .map(([category, settingsList]): [string, UserSetting[]] => [
        category,
        settingsList.filter(
          (setting) =>
            setting.setting_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            setting.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
            setting.description.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      ])
      .filter(([_, settingsList]) => settingsList.length > 0);

    return filtered;
  }, [groupedSettings, searchTerm]);
  const getCategoryIcon = (category: string): LucideIcon => {
    return categoryIcons[category as keyof typeof categoryIcons] || Folder;
  };

  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">User Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your personal preferences and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 lg:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Settings</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(groupedSettings).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <Card className="w-full lg:w-80">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Setting Details</h2>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search settings..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="space-y-1">
                {filteredCategories.map(([category, settingsList]) => {
                  const CategoryIcon = getCategoryIcon(category);
                  return (
                    <div
                      key={category}
                      className="space-y-1"
                    >
                      <div
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-center">
                          {expandedCategories.includes(category) ? (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2" />
                          )}
                          <CategoryIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm capitalize">{category}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{settingsList.length}</span>
                      </div>
                      {expandedCategories.includes(category) && (
                        <div className="space-y-1">
                          {settingsList.map((setting) => (
                            <div
                              key={setting.setting_id}
                              className={`flex items-center justify-between ml-8 p-2 hover:bg-accent rounded-lg cursor-pointer ${
                                selectedSetting?.setting_id === setting.setting_id ? 'bg-accent' : ''
                              }`}
                              onClick={() => setSelectedSetting(setting)}
                            >
                              <div className="flex items-start min-w-0">
                                <FileText className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm">{setting.setting_name}</div>
                                  <div className="text-xs text-muted-foreground">{setting.value}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </Card>

        <Card className="flex-1 p-4 lg:p-6">
          {selectedSetting ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold capitalize">
                  {selectedSetting.setting_name.replace(/_/g, ' ')}
                </h2>
                <Button>Edit</Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    value={selectedSetting.value}
                    onChange={(e) => {
                      const newSettings = settings.map((s) =>
                        s.setting_id === selectedSetting.setting_id ? {...s, value: e.target.value} : s
                      );
                      setSettings(newSettings);
                    }}
                    disabled={!editingStates[selectedSetting.setting_id]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">{selectedSetting.description}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-muted-foreground capitalize">{selectedSetting.category}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
              <div className="text-center">
                <Settings2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">No Setting Selected</h3>
                <p className="text-muted-foreground">Select a setting to view and edit its details</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserSettings;
