"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, AlertCircle, CheckCircle } from "lucide-react";

interface AccountFormProps {
  email: string;
  hasPassword: boolean;
  onPasswordChange: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  isLoading?: boolean;
}

export function AccountForm({
  email,
  hasPassword,
  onPasswordChange,
  isLoading = false,
}: AccountFormProps) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = React.useState("");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      if (newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(newPassword)) {
        newErrors.newPassword = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(newPassword)) {
        newErrors.newPassword = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(newPassword)) {
        newErrors.newPassword = "Password must contain at least one number";
      }
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      await onPasswordChange({ currentPassword, newPassword });
      setSuccessMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ currentPassword: error.message });
      }
    }
  };

  const passwordStrength = React.useMemo(() => {
    if (!newPassword) return { score: 0, label: "" };

    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score: 2, label: "Medium", color: "bg-yellow-500" };
    return { score: 3, label: "Strong", color: "bg-green-500" };
  }, [newPassword]);

  return (
    <div className="space-y-8">
      {/* Email Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Address</h3>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Mail className="h-5 w-5 text-gray-400" />
          <span className="text-gray-700">{email}</span>
          <span className="ml-auto text-sm text-gray-500">Primary</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Your email address is used for login and notifications.
        </p>
      </div>

      {/* Password Section */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

        {!hasPassword ? (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">OAuth Account</p>
              <p className="text-amber-700 text-sm mt-1">
                You signed in using a social provider. Password changes are not available
                for OAuth accounts.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            )}

            <Input
              label="Current Password"
              variant="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={errors.currentPassword}
              leftIcon={<Lock className="h-5 w-5" />}
            />

            <Input
              label="New Password"
              variant="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              leftIcon={<Lock className="h-5 w-5" />}
            />

            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength.score >= level
                          ? passwordStrength.color
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Password strength: <span className="font-medium">{passwordStrength.label}</span>
                </p>
              </div>
            )}

            <Input
              label="Confirm New Password"
              variant="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<Lock className="h-5 w-5" />}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
              >
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-red-800">Delete Account</p>
              <p className="text-sm text-red-600 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="secondary"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                // Placeholder for account deletion
                alert("Account deletion would be implemented here");
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
