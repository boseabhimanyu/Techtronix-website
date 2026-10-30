"use client";

import axios from "axios";
import QRCode from "qrcode";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import api from "@/lib/api";
import { useNotification } from "@/components/notifications/notification-provider";

type SecurityFormProps = {
  twoFactorEnabled: boolean;
};

type SetupResponse = {
  message: string;
  otpauthUrl: string;
  secret: string;
};

type VerifySetupResponse = {
  backupCodes: string[];
  backupCodesLow: boolean;
  backupCodesRemaining: number;
  message: string;
  twoFactorEnabled: boolean;
};

type DisableResponse = {
  message: string;
  twoFactorEnabled: boolean;
};

type PasswordResponse = {
  message: string;
};

type BackupCodesResponse = {
  backupCodes: string[];
  backupCodesLow: boolean;
  backupCodesRemaining: number;
  message: string;
};

export default function SecurityForm({
  twoFactorEnabled: initialTwoFactorEnabled,
}: SecurityFormProps) {
  const { showNotification } = useNotification();

  const [twoFactorEnabled, setTwoFactorEnabled] =
    useState(initialTwoFactorEnabled);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [passwordLoading, setPasswordLoading] =
    useState(false);
  const [passwordMessage, setPasswordMessage] =
    useState("");

  // 2FA setup
  const [setupStarted, setSetupStarted] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] =
    useState(false);

  // 2FA disable
  const [disableMode, setDisableMode] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  // Backup codes
  const [backupCodes, setBackupCodes] = useState<string[]>(
    [],
  );
  const [showBackupCodes, setShowBackupCodes] =
    useState(false);
  const [copied, setCopied] = useState(false);

  const [capsLockOn, setCapsLockOn] = useState(false);

  // Backup code regeneration
  const [showBackupCodeRegeneration, setShowBackupCodeRegeneration] =
    useState(false);

  const [backupCodeVerification, setBackupCodeVerification] =
    useState("");

  const [
    backupCodeRegenerationLoading,
    setBackupCodeRegenerationLoading,
  ] = useState(false);

  const [
    backupCodeRegenerationError,
    setBackupCodeRegenerationError,
  ] = useState("");

  const [newBackupCodes, setNewBackupCodes] =
    useState<string[] | null>(null);

  const [backupCodesCopied, setBackupCodesCopied] =
    useState(false);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  useEffect(() => {
    if (!otpauthUrl) {
      setQrCode("");
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(otpauthUrl, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) {
          setQrCode(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrCode("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [otpauthUrl]);

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        "New password and re-entered password do not match.",
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const response =
        await api.patch<PasswordResponse>(
          "/auth/password",
          {
            currentPassword,
            newPassword,
          },
        );

      showNotification(
        response.data?.message ??
          "Password changed successfully.",
        "success",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          error.response?.data?.message ??
          error.response?.data?.error;

        showNotification(
          backendMessage ??
            "Unable to change password.",
          "error",
        );
      } else {
        showNotification(
          "Unable to connect to the server.",
          "error",
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  async function startTwoFactorSetup() {
    setTwoFactorLoading(true);

    try {
      const response =
        await api.post<SetupResponse>(
          "/auth/2fa/setup",
        );

      setOtpauthUrl(response.data.otpauthUrl);
      setSecret(response.data.secret);
      setSetupStarted(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showNotification(
          error.response?.data?.message ??
            error.response?.data?.error ??
            "Unable to start two-factor authentication.",
          "error",
        );
      } else {
        showNotification(
          "Unable to connect to the server.",
          "error",
        );
      }
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function verifyTwoFactorSetup() {
    setTwoFactorLoading(true);

    try {
      const response =
        await api.post<VerifySetupResponse>(
          "/auth/2fa/verify-setup",
          {
            code: setupCode.trim(),
          },
        );

      setTwoFactorEnabled(
        response.data.twoFactorEnabled,
      );

      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
      setCopied(false);

      setSetupStarted(false);
      setSetupCode("");
      setOtpauthUrl("");
      setSecret("");
      setQrCode("");

      showNotification(
        response.data.message ??
          "Two-factor authentication enabled successfully.",
        "success",
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showNotification(
          error.response?.data?.message ??
            error.response?.data?.error ??
            "Unable to verify two-factor authentication.",
          "error",
        );
      } else {
        showNotification(
          "Unable to connect to the server.",
          "error",
        );
      }
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function disableTwoFactor() {
    setTwoFactorLoading(true);

    try {
      const response =
        await api.post<DisableResponse>(
          "/auth/2fa/disable",
          {
            code: disableCode.trim(),
          },
        );

      setTwoFactorEnabled(
        response.data.twoFactorEnabled,
      );

      setDisableMode(false);
      setDisableCode("");

      showNotification(
        response.data.message ??
          "Two-factor authentication disabled successfully.",
        "success",
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showNotification(
          error.response?.data?.message ??
            error.response?.data?.error ??
            "Unable to disable two-factor authentication.",
          "error",
        );
      } else {
        showNotification(
          "Unable to connect to the server.",
          "error",
        );
      }
    } finally {
      setTwoFactorLoading(false);
    }
  }

    async function copyBackupCodes() {
    try {
      await navigator.clipboard.writeText(
        backupCodes.join("\n"),
      );

      setCopied(true);

      // Automatically resets the "Copied" status after 2 seconds
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
      
    } catch {
      setCopied(false);
    }
  }


  function closeBackupCodes() {
    setShowBackupCodes(false);
    setBackupCodes([]);
    setCopied(false);
  }

  function handlePasswordKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    setCapsLockOn(
      event.getModifierState("CapsLock"),
    );
  }

  function handlePasswordKeyUp(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    setCapsLockOn(
      event.getModifierState("CapsLock"),
    );
  }

  async function handleBackupCodeRegeneration(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setBackupCodeRegenerationError("");

    const code = backupCodeVerification.trim();

    if (!code) {
      setBackupCodeRegenerationError(
        "Enter your authenticator code or backup code.",
      );
      return;
    }

    setBackupCodeRegenerationLoading(true);

    try {
      const response =
        await api.post<BackupCodesResponse>(
          "/auth/2fa/backup-codes/regenerate",
          {
            code,
          },
        );

      setNewBackupCodes(
        response.data.backupCodes ?? [],
      );

      setBackupCodeVerification("");
      setShowBackupCodeRegeneration(false);

      showNotification(
        response.data.message ??
          "Backup codes regenerated successfully.",
        "success",
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          error.response?.data?.message ??
          error.response?.data?.error;

        setBackupCodeRegenerationError(
          backendMessage ??
            "Unable to regenerate backup codes.",
        );
      } else {
        setBackupCodeRegenerationError(
          "Unable to connect to the server.",
        );
      }
    } finally {
      setBackupCodeRegenerationLoading(false);
    }
  }

  async function handleCopyNewBackupCodes() {
    if (!newBackupCodes) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        newBackupCodes.join("\n"),
      );

      setBackupCodesCopied(true);

      window.setTimeout(() => {
        setBackupCodesCopied(false);
      }, 2000);
    } catch {
      setBackupCodesCopied(false);
    }
  }

  function closeNewBackupCodes() {
    setNewBackupCodes(null);
    setBackupCodesCopied(false);
  }

  return (
    <>
  <div className="space-y-6">
    {/* Password Reset Section */}
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <div>
        <h2 className="text-base font-bold tracking-tight text-white">
          Password reset
        </h2>
      </div>

      <form
        onSubmit={handlePasswordSubmit}
        className="mt-6 max-w-xl space-y-4"
      >
        <SecurityField
          id="current-password"
          label="Old password"
          type="password"
          value={currentPassword}
          autoComplete="current-password"
          onChange={(event) =>
            setCurrentPassword(event.target.value)
          }
          onKeyDown={handlePasswordKeyDown}
          onKeyUp={handlePasswordKeyUp}
          onBlur={() => setCapsLockOn(false)}
        />

        <SecurityField
          id="new-password"
          label="New password"
          type="password"
          value={newPassword}
          autoComplete="new-password"
          onChange={(event) =>
            setNewPassword(event.target.value)
          }
          onKeyDown={handlePasswordKeyDown}
          onKeyUp={handlePasswordKeyUp}
          onBlur={() => setCapsLockOn(false)}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirm-password"
            className="text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Re-enter new password
          </label>

          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            onKeyDown={handlePasswordKeyDown}
            onKeyUp={handlePasswordKeyUp}
            onBlur={() => setCapsLockOn(false)}
            className={`h-11 rounded-xl border px-4 text-sm text-white placeholder-slate-500 shadow-sm outline-none backdrop-blur-xl transition ${
              passwordsMatch
                ? "border-emerald-500/50 bg-emerald-950/20 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
                : "border-slate-700 bg-slate-800/80 focus:border-cyan-500 focus:bg-slate-800 focus:ring-1 focus:ring-cyan-500/40"
            }`}
          />
        </div>

        {capsLockOn && (
          <p className="text-xs font-medium text-amber-400">
            Caps Lock is on
          </p>
        )}

        {passwordMessage && (
          <p className="text-sm font-medium text-red-400">
            {passwordMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={passwordLoading}
          className="h-11 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {passwordLoading ? "Changing..." : "Change password"}
        </button>
      </form>
    </section>

    {/* 2FA Section */}
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <div>
        <h2 className="text-base font-bold tracking-tight text-white">
          Two-factor authentication
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Add an extra layer of security to your account.
        </p>
      </div>

      {!twoFactorEnabled && !setupStarted && (
        <div className="mt-6">
          <button
            type="button"
            onClick={startTwoFactorSetup}
            disabled={twoFactorLoading}
            className="h-11 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {twoFactorLoading ? "Starting..." : "Enable 2FA"}
          </button>
        </div>
      )}

      {!twoFactorEnabled && setupStarted && (
        <div className="mt-6 max-w-xl space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Scan this QR code
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Scan the code with your authenticator app.
            </p>

            <div className="mt-4 flex min-h-64 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
              {qrCode ? (
                <div className="rounded-xl border border-slate-600 bg-white p-3 shadow-lg">
                  <img
                    src={qrCode}
                    alt="Two-factor authentication QR code"
                    className="h-56 w-56 rounded-lg"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Generating QR code...
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              Setup key
            </p>

            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 font-mono text-sm tracking-widest text-cyan-400 shadow-inner">
              {secret}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white">
              Verify your authenticator
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Enter the 6-digit code shown in your authenticator app to complete two-factor authentication setup.
            </p>

            <div className="mt-4">
              <SecurityField
                id="setup-code"
                label="Authentication code"
                value={setupCode}
                inputMode="numeric"
                onChange={(event) =>
                  setSetupCode(event.target.value)
                }
              />
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={verifyTwoFactorSetup}
                disabled={twoFactorLoading}
                className="h-11 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {twoFactorLoading ? "Verifying..." : "Verify and enable 2FA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {twoFactorEnabled && !disableMode && (
        <div className="mt-6">
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-sm font-medium text-emerald-300">
            Two-factor authentication is enabled.
          </div>

          <button
            type="button"
            onClick={() => {
              setDisableMode(true);
            }}
            className="h-11 rounded-xl border border-red-500/30 bg-red-950/40 px-5 text-sm font-semibold text-red-300 transition hover:border-red-500/50 hover:bg-red-900/50 hover:text-red-100 active:scale-[0.98]"
          >
            Disable 2FA
          </button>
        </div>
      )}

      {twoFactorEnabled && disableMode && (
        <div className="mt-6 max-w-xl space-y-4">
          <p className="text-sm text-slate-400">
            Enter your current authenticator code to disable two-factor authentication.
          </p>

          <SecurityField
            id="disable-code"
            label="Authentication code"
            value={disableCode}
            inputMode="numeric"
            onChange={(event) =>
              setDisableCode(event.target.value)
            }
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={disableTwoFactor}
              disabled={twoFactorLoading}
              className="h-11 rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {twoFactorLoading ? "Disabling..." : "Disable 2FA"}
            </button>

            <button
              type="button"
              onClick={() => {
                setDisableMode(false);
                setDisableCode("");
              }}
              className="h-11 rounded-xl border border-slate-700 bg-slate-800/80 px-5 text-sm font-medium text-slate-300 shadow-sm transition hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  </div>

  {/* Backup Codes Section */}
  {twoFactorEnabled && (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
      <div>
        <h2 className="text-base font-bold tracking-tight text-white">
          Backup codes
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Generate a new set of backup codes if you need to replace your current codes.
        </p>
      </div>

      {!showBackupCodeRegeneration && (
        <button
          type="button"
          onClick={() => {
            setShowBackupCodeRegeneration(true);
            setBackupCodeRegenerationError("");
          }}
          className="mt-5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-[0.98]"
        >
          Generate new backup codes
        </button>
      )}

      {showBackupCodeRegeneration && (
        <form
          onSubmit={handleBackupCodeRegeneration}
          className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-5"
        >
          <h3 className="text-sm font-bold text-white">
            Verify your identity
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            Enter your authenticator code or backup code to generate a new set of backup codes.
          </p>

          <input
            type="text"
            value={backupCodeVerification}
            onChange={(event) =>
              setBackupCodeVerification(event.target.value)
            }
            placeholder="TOTP or backup code"
            autoComplete="one-time-code"
            className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none backdrop-blur-xl transition focus:border-cyan-500 focus:bg-slate-800 focus:ring-1 focus:ring-cyan-500/40"
          />

          {backupCodeRegenerationError && (
            <p className="mt-2 text-sm font-medium text-red-400">
              {backupCodeRegenerationError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={backupCodeRegenerationLoading}
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {backupCodeRegenerationLoading ? "Generating..." : "Generate new backup codes"}
            </button>

            <button
              type="button"
              disabled={backupCodeRegenerationLoading}
              onClick={() => {
                setShowBackupCodeRegeneration(false);
                setBackupCodeVerification("");
                setBackupCodeRegenerationError("");
              }}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )}

  {/* 2FA Setup Backup Codes Popup */}
  {showBackupCodes && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close backup codes"
        className="absolute inset-0 cursor-default"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            Save your backup codes
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Two-factor authentication is now enabled. Save these backup codes somewhere safe. They will not be shown again.
          </p>
        </div>

        <div className="mt-5 max-h-[45vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/50 p-3 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {backupCodes.map((code) => (
              <div
                key={code}
                className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2.5 text-center font-mono text-sm tracking-wider text-slate-200 shadow-sm"
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={copyBackupCodes}
            className="h-11 rounded-xl border border-slate-700 bg-slate-800/80 px-5 text-sm font-semibold text-slate-200 shadow-sm transition hover:bg-slate-700 hover:text-white active:scale-[0.98]"
          >
            {copied ? "Copied" : "Copy all codes"}
          </button>

          <button
            type="button"
            onClick={closeBackupCodes}
            className="h-11 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98]"
          >
            I've saved them
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Regenerated Backup Codes Popup */}
  {newBackupCodes !== null && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
        <h2 className="text-lg font-bold tracking-tight text-white">
          New backup codes
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Save these backup codes somewhere secure. They will not be shown again after you close this window.
        </p>

        <div className="mt-5 grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:grid-cols-2">
          {newBackupCodes.map((backupCode) => (
            <div
              key={backupCode}
              className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-center font-mono text-sm tracking-wider text-slate-200"
            >
              {backupCode}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleCopyNewBackupCodes}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            {backupCodesCopied ? "Copied" : "Copy all codes"}
          </button>

          <button
            type="button"
            onClick={closeNewBackupCodes}
            className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98]"
          >
            I've saved them
          </button>
        </div>
      </div>
    </div>
  )}
</>
  );
}

type SecurityFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric";
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  onKeyUp?: (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  onBlur?: (
    event: React.FocusEvent<HTMLInputElement>,
  ) => void;
};

function SecurityField({
  id,
  label,
  type = "text",
  value,
  autoComplete,
  inputMode,
  onChange,
  onKeyDown,
  onKeyUp,
  onBlur,
}: SecurityFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
  <label
    htmlFor={id}
    className="text-xs font-semibold uppercase tracking-wider text-slate-400"
  >
    {label}
  </label>

  <input
    id={id}
    name={id}
    type={type}
    value={value}
    autoComplete={autoComplete}
    inputMode={inputMode}
    onChange={onChange}
    onKeyDown={onKeyDown}
    onKeyUp={onKeyUp}
    onBlur={onBlur}
    className="h-11 rounded-xl border border-slate-700 bg-slate-800/80 px-4 text-sm text-white placeholder-slate-500 shadow-sm outline-none backdrop-blur-xl transition hover:border-slate-600 focus:border-cyan-500 focus:bg-slate-800 focus:ring-1 focus:ring-cyan-500/40"
  />
</div>
  );
}