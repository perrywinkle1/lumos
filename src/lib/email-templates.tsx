import * as React from "react";

// Lumos brand colors
const LUMOS_ORANGE = "#ff6719";
const LUMOS_DARK = "#1a1a1a";
const LUMOS_GRAY = "#666666";
const LUMOS_LIGHT_GRAY = "#f5f5f5";

// Base email wrapper component
interface EmailWrapperProps {
  children: React.ReactNode;
  previewText?: string;
}

function EmailWrapper({ children, previewText }: EmailWrapperProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>Lumos</title>
      </head>
      <body
        style={{
          backgroundColor: LUMOS_LIGHT_GRAY,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        {/* Preview text - hidden but shown in email clients */}
        {previewText && (
          <div
            style={{
              display: "none",
              fontSize: "1px",
              color: LUMOS_LIGHT_GRAY,
              lineHeight: "1px",
              maxHeight: 0,
              maxWidth: 0,
              opacity: 0,
              overflow: "hidden",
            }}
          >
            {previewText}
          </div>
        )}

        {/* Main container */}
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{
            width: "100%",
            backgroundColor: LUMOS_LIGHT_GRAY,
            padding: "40px 20px",
          }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td
                        style={{
                          padding: "32px 40px",
                          borderBottom: `3px solid ${LUMOS_ORANGE}`,
                        }}
                      >
                        <h1
                          style={{
                            margin: 0,
                            fontSize: "28px",
                            fontWeight: 700,
                            color: LUMOS_DARK,
                            letterSpacing: "-0.5px",
                          }}
                        >
                          Lumos
                        </h1>
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td style={{ padding: "40px" }}>{children}</td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          padding: "24px 40px",
                          backgroundColor: LUMOS_LIGHT_GRAY,
                          borderTop: "1px solid #e0e0e0",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: LUMOS_GRAY,
                            textAlign: "center",
                            lineHeight: "20px",
                          }}
                        >
                          Lumos - Your newsletter platform
                          <br />
                          <a
                            href="{{{unsubscribeUrl}}}"
                            style={{
                              color: LUMOS_GRAY,
                              textDecoration: "underline",
                            }}
                          >
                            Unsubscribe
                          </a>
                          {" | "}
                          <a
                            href="{{{preferencesUrl}}}"
                            style={{
                              color: LUMOS_GRAY,
                              textDecoration: "underline",
                            }}
                          >
                            Manage preferences
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

// Button component for emails
interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: LUMOS_ORANGE,
              borderRadius: "6px",
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "14px 28px",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// Welcome Email Template
export interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export function WelcomeEmail({ userName, loginUrl }: WelcomeEmailProps) {
  return (
    <EmailWrapper previewText={`Welcome to Lumos, ${userName}!`}>
      <h2
        style={{
          margin: "0 0 24px",
          fontSize: "24px",
          fontWeight: 600,
          color: LUMOS_DARK,
          lineHeight: "32px",
        }}
      >
        Welcome to Lumos!
      </h2>

      <p
        style={{
          margin: "0 0 16px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        Hi {userName || "there"},
      </p>

      <p
        style={{
          margin: "0 0 16px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        Thank you for joining Lumos! We are excited to have you as part of our
        community of readers and writers.
      </p>

      <p
        style={{
          margin: "0 0 24px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        With Lumos, you can discover amazing newsletters, subscribe to your
        favorite writers, and even start your own publication.
      </p>

      <EmailButton href={loginUrl}>Get Started</EmailButton>

      <p
        style={{
          margin: "24px 0 0",
          fontSize: "14px",
          color: LUMOS_GRAY,
          lineHeight: "22px",
        }}
      >
        If you have any questions, just reply to this email. We are always happy
        to help!
      </p>
    </EmailWrapper>
  );
}

// Subscription Confirmation Email Template
export interface SubscriptionConfirmEmailProps {
  subscriberName?: string;
  publicationName: string;
  publicationUrl: string;
  confirmUrl: string;
}

export function SubscriptionConfirmEmail({
  subscriberName,
  publicationName,
  publicationUrl,
  confirmUrl,
}: SubscriptionConfirmEmailProps) {
  return (
    <EmailWrapper
      previewText={`Confirm your subscription to ${publicationName}`}
    >
      <h2
        style={{
          margin: "0 0 24px",
          fontSize: "24px",
          fontWeight: 600,
          color: LUMOS_DARK,
          lineHeight: "32px",
        }}
      >
        Confirm your subscription
      </h2>

      <p
        style={{
          margin: "0 0 16px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        Hi {subscriberName || "there"},
      </p>

      <p
        style={{
          margin: "0 0 16px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        You requested to subscribe to{" "}
        <a
          href={publicationUrl}
          style={{ color: LUMOS_ORANGE, textDecoration: "none", fontWeight: 600 }}
        >
          {publicationName}
        </a>
        . Please confirm your subscription by clicking the button below.
      </p>

      <p
        style={{
          margin: "0 0 24px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        This helps us ensure that you really want to receive emails from this
        publication.
      </p>

      <EmailButton href={confirmUrl}>Confirm Subscription</EmailButton>

      <p
        style={{
          margin: "24px 0 0",
          fontSize: "14px",
          color: LUMOS_GRAY,
          lineHeight: "22px",
        }}
      >
        If you did not request this subscription, you can safely ignore this
        email.
      </p>
    </EmailWrapper>
  );
}

// New Post Notification Email Template
export interface NewPostEmailProps {
  subscriberName?: string;
  publicationName: string;
  postTitle: string;
  postExcerpt?: string;
  postUrl: string;
  authorName: string;
  unsubscribeUrl: string;
}

export function NewPostEmail({
  subscriberName,
  publicationName,
  postTitle,
  postExcerpt,
  postUrl,
  authorName,
  unsubscribeUrl,
}: NewPostEmailProps) {
  return (
    <EmailWrapper previewText={`New post: ${postTitle}`}>
      {/* Publication name badge */}
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "13px",
          fontWeight: 600,
          color: LUMOS_ORANGE,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {publicationName}
      </p>

      <h2
        style={{
          margin: "0 0 16px",
          fontSize: "28px",
          fontWeight: 700,
          color: LUMOS_DARK,
          lineHeight: "36px",
        }}
      >
        {postTitle}
      </h2>

      <p
        style={{
          margin: "0 0 24px",
          fontSize: "14px",
          color: LUMOS_GRAY,
        }}
      >
        By {authorName}
      </p>

      {postExcerpt && (
        <p
          style={{
            margin: "0 0 24px",
            fontSize: "16px",
            color: LUMOS_GRAY,
            lineHeight: "26px",
            borderLeft: `3px solid ${LUMOS_ORANGE}`,
            paddingLeft: "16px",
          }}
        >
          {postExcerpt}
        </p>
      )}

      <EmailButton href={postUrl}>Read Full Post</EmailButton>

      <hr
        style={{
          margin: "32px 0",
          border: "none",
          borderTop: "1px solid #e0e0e0",
        }}
      />

      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: LUMOS_GRAY,
          lineHeight: "20px",
        }}
      >
        You are receiving this email because you are subscribed to{" "}
        {publicationName}.
        <br />
        <a
          href={unsubscribeUrl}
          style={{ color: LUMOS_GRAY, textDecoration: "underline" }}
        >
          Unsubscribe from this publication
        </a>
      </p>
    </EmailWrapper>
  );
}

// Password Reset Email Template
export interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <EmailWrapper previewText="Reset your Lumos password">
      <h2
        style={{
          margin: "0 0 24px",
          fontSize: "24px",
          fontWeight: 600,
          color: LUMOS_DARK,
          lineHeight: "32px",
        }}
      >
        Reset your password
      </h2>

      <p
        style={{
          margin: "0 0 16px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        Hi {userName || "there"},
      </p>

      <p
        style={{
          margin: "0 0 16px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        We received a request to reset the password for your Lumos account.
        Click the button below to choose a new password.
      </p>

      <p
        style={{
          margin: "0 0 24px",
          fontSize: "16px",
          color: LUMOS_GRAY,
          lineHeight: "26px",
        }}
      >
        This link will expire in 1 hour for security reasons.
      </p>

      <EmailButton href={resetUrl}>Reset Password</EmailButton>

      <p
        style={{
          margin: "24px 0 0",
          fontSize: "14px",
          color: LUMOS_GRAY,
          lineHeight: "22px",
        }}
      >
        If you did not request a password reset, please ignore this email or
        contact support if you have concerns about your account security.
      </p>

      <hr
        style={{
          margin: "24px 0",
          border: "none",
          borderTop: "1px solid #e0e0e0",
        }}
      />

      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: LUMOS_GRAY,
          lineHeight: "20px",
        }}
      >
        Alternatively, copy and paste this link into your browser:
        <br />
        <a
          href={resetUrl}
          style={{
            color: LUMOS_ORANGE,
            textDecoration: "none",
            wordBreak: "break-all",
          }}
        >
          {resetUrl}
        </a>
      </p>
    </EmailWrapper>
  );
}

// Note: The render functions have been moved to email-render.ts to avoid
// importing react-dom/server in client components
