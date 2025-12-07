import { useState, useEffect, useRef } from 'react';
import { User, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileModal = ({ open, onOpenChange }: EditProfileModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load profile data when modal opens
  useEffect(() => {
    if (open && user) {
      loadProfile();
    }
  }, [open, user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get profile data from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setDisplayName(data?.full_name || user.user_metadata?.full_name || '');
      setUsername(data?.username || '');
      setProfilePicture(data?.avatar_url || null);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      // If it's a missing column error, just load from user metadata
      if (error.code === '42703') {
        setDisplayName(user.user_metadata?.full_name || '');
        setProfilePicture(null);
        setUsername('');
      } else {
        toast({
          title: 'Error loading profile',
          description: error.message || 'Failed to load profile data',
          variant: 'destructive',
        });
        // Still try to load from user metadata as fallback
        setDisplayName(user.user_metadata?.full_name || '');
        setProfilePicture(null);
        setUsername('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePicture(previewUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      // Don't include bucket name in path - .from('avatars') already specifies the bucket
      const filePath = fileName;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setProfilePicture(urlData.publicUrl);
      }

      toast({
        title: 'Profile picture uploaded',
        description: 'Your profile picture has been uploaded successfully.',
      });
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      
      // Provide helpful error messages
      let errorMessage = error.message || 'Failed to upload profile picture';
      if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
        errorMessage = 'Storage bucket "avatars" not found. Please create it in your Supabase project under Storage.';
      } else if (error.message?.includes('row-level security policy') || error.message?.includes('RLS')) {
        errorMessage = 'Storage bucket RLS policies not configured. Please run the storage RLS migration SQL in your Supabase project.';
      }
      
      toast({
        title: 'Error uploading picture',
        description: errorMessage,
        variant: 'destructive',
      });
      // Revert to previous picture on error
      loadProfile();
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePicture = async () => {
    if (!profilePicture || !user) return;

    try {
      // Extract file path from URL if it's a storage URL
      let fileName = '';
      if (profilePicture.includes('storage')) {
        try {
          const url = new URL(profilePicture);
          // Supabase storage URLs format: .../storage/v1/object/public/avatars/filename.png
          // Extract the filename from the path
          const pathParts = url.pathname.split('/');
          const avatarsIndex = pathParts.indexOf('avatars');
          if (avatarsIndex !== -1 && avatarsIndex < pathParts.length - 1) {
            fileName = pathParts.slice(avatarsIndex + 1).join('/');
          } else {
            // Fallback: get last part of path
            fileName = pathParts[pathParts.length - 1];
          }
          // Remove query parameters if any
          fileName = fileName.split('?')[0];
        } catch {
          // If URL parsing fails, try simple split
          const urlParts = profilePicture.split('/');
          fileName = urlParts[urlParts.length - 1].split('?')[0];
        }
        
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([fileName]);
          
          if (deleteError) {
            console.error('Error deleting old picture:', deleteError);
          }
        }
      }

      setProfilePicture(null);
      toast({
        title: 'Profile picture removed',
        description: 'Your profile picture has been removed.',
      });
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate username if provided
    if (username && username.length < 3) {
      toast({
        title: 'Invalid username',
        description: 'Username must be at least 3 characters long.',
        variant: 'destructive',
      });
      return;
    }

    // Validate username format (alphanumeric and underscores only)
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: 'Invalid username',
        description: 'Username can only contain letters, numbers, and underscores.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Check if username is already taken by another user (if username is provided)
      if (username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', username.toLowerCase())
          .neq('id', user.id)
          .single();

        if (existingUser) {
          toast({
            title: 'Username already taken',
            description: 'This username is already in use. Please choose another one.',
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }

        // If checkError is not "no rows" error, there might be an issue
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking username:', checkError);
        }
      }

      // Update profile in profiles table
      const updateData: any = {
        id: user.id,
        full_name: displayName,
        email: user.email,
      };

      // Only update avatar_url if profile picture is set
      if (profilePicture) {
        updateData.avatar_url = profilePicture;
      } else {
        updateData.avatar_url = null;
      }

      // Update username if provided
      if (username) {
        updateData.username = username.toLowerCase();
      } else {
        updateData.username = null;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(updateData, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: displayName,
        },
      });

      if (metadataError) throw metadataError;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading profile...</div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-border">
                  {profilePicture ? (
                    <AvatarImage src={profilePicture} alt="Profile" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-2xl">
                    {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                  </AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Picture'}
                </Button>
                {profilePicture && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePicture}
                    disabled={uploading}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG or GIF. Max size 5MB
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                disabled={saving}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Enter your username"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Username can only contain letters, numbers, and underscores. Minimum 3 characters. You can use this to login instead of email.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

