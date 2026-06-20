"use client";

import { useState } from "react";

interface Props {
  userEmail: string;
  profile: Record<string, unknown>;
}

export function SettingsForm({ userEmail, profile }: Props) {
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_booking_confirmation: true,
    email_payment_received: true,
    email_invoice_sent: true,
    email_event_reminder: true,
    email_task_assigned: true,
    email_reorder_alert: true,
    sms_booking_confirmation: false,
    sms_payment_received: false,
    sms_event_reminder: false,
    sms_task_assigned: false,
    sms_reorder_alert: true,
  });

  function togglePref(key: string) {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  }

  const notificationGroups = [
    {
      label: "Booking Confirmation",
      emailKey: "email_booking_confirmation",
      smsKey: "sms_booking_confirmation",
    },
    {
      label: "Payment Received",
      emailKey: "email_payment_received",
      smsKey: "sms_payment_received",
    },
    {
      label: "Invoice Sent",
      emailKey: "email_invoice_sent",
      smsKey: null,
    },
    {
      label: "Event Reminder",
      emailKey: "email_event_reminder",
      smsKey: "sms_event_reminder",
    },
    {
      label: "Task Assigned",
      emailKey: "email_task_assigned",
      smsKey: "sms_task_assigned",
    },
    {
      label: "Reorder Alert",
      emailKey: "email_reorder_alert",
      smsKey: "sms_reorder_alert",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Account */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <p className="text-white">{userEmail}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Name</label>
            <p className="text-white">
              {String(profile.full_name || "Not set")}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Role</label>
            <p className="text-white capitalize">
              {String(profile.role || "owner")}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          Notification Preferences
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Toggle email and SMS notifications per type. SMS to couples is
          blocked until A2P registration is complete.
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 font-medium pb-2 border-b border-[#3A3A3A]">
            <span>Notification</span>
            <span className="text-center">Email</span>
            <span className="text-center">SMS</span>
          </div>

          {notificationGroups.map((group) => (
            <div
              key={group.label}
              className="grid grid-cols-3 gap-4 items-center"
            >
              <span className="text-sm text-white">{group.label}</span>
              <div className="text-center">
                <button
                  onClick={() => togglePref(group.emailKey)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    notificationPrefs[
                      group.emailKey as keyof typeof notificationPrefs
                    ]
                      ? "bg-[#D4AF37]"
                      : "bg-[#3A3A3A]"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      notificationPrefs[
                        group.emailKey as keyof typeof notificationPrefs
                      ]
                        ? "translate-x-5"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="text-center">
                {group.smsKey ? (
                  <button
                    onClick={() => togglePref(group.smsKey!)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      notificationPrefs[
                        group.smsKey as keyof typeof notificationPrefs
                      ]
                        ? "bg-[#D4AF37]"
                        : "bg-[#3A3A3A]"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        notificationPrefs[
                          group.smsKey as keyof typeof notificationPrefs
                        ]
                          ? "translate-x-5"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                ) : (
                  <span className="text-xs text-gray-500">N/A</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] text-sm">
          Save Preferences
        </button>
      </div>

      {/* Branding */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Branding</h2>
        <p className="text-sm text-gray-400 mb-4">
          Customize the look of your couple portal and communications.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Business Name
            </label>
            <input
              type="text"
              defaultValue="Willow Acres"
              className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Logo Upload
            </label>
            <div className="flex items-center gap-2">
              <label className="px-3 py-2 bg-[#3A3A3A] text-white rounded text-sm cursor-pointer hover:bg-[#4A4A4A]">
                Choose File
                <input type="file" className="hidden" accept="image/*" />
              </label>
              <span className="text-xs text-gray-500">
                PNG, SVG, or WebP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations status */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Integration Status
        </h2>
        <div className="space-y-3">
          {[
            { name: "Supabase", status: "connected", detail: "trellis-dev (us-east-2)" },
            { name: "Vercel", status: "connected", detail: "Auto-deploy active" },
            { name: "QuickBooks", status: "pending", detail: "Connection Session needed" },
            { name: "Square", status: "pending", detail: "Connection Session needed" },
            { name: "Resend (Email)", status: "connected", detail: "Send-only key" },
            { name: "Twilio (SMS)", status: "pending", detail: "A2P registration pending" },
            { name: "Anthropic AI", status: "pending", detail: "API key needed" },
            { name: "Deepgram STT", status: "pending", detail: "API key needed" },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded"
            >
              <div>
                <span className="text-white text-sm font-medium">
                  {integration.name}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {integration.detail}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  integration.status === "connected"
                    ? "bg-green-900 text-green-200"
                    : "bg-yellow-900 text-yellow-200"
                }`}
              >
                {integration.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
