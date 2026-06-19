import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, LogIn, Send, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AppLogo } from '../components/AppLogo'
import { Icon } from '../components/Icon'
import { Alert, Button } from '../components/ui'
import {
  AuthCard,
  AuthFooter,
  AuthLogoHeader,
  PageLayout,
} from '../components/layout'
import { ApiError, sendOtp, verifyOtp } from '../lib/api'
import { setTokens } from '../lib/auth-storage'
import { useToast } from '../lib/store/useToast'
import {
  INDIAN_PHONE_E164_REGEX,
  normalizeIndianPhone,
} from '../lib/phone'

const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone is required')
    .transform(normalizeIndianPhone)
    .refine(
      (phone) => INDIAN_PHONE_E164_REGEX.test(phone),
      'Enter a valid Indian mobile (+91 or 10 digits)',
    ),
  otpConsent: z.boolean().refine((value) => value, {
    message: 'You must consent to receive OTP via SMS',
  }),
})

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

type SendOtpForm = z.infer<typeof sendOtpSchema>
type VerifyOtpForm = z.infer<typeof verifyOtpSchema>

const isBetaMode = import.meta.env.VITE_BETA_MODE === 'true'

export function LoginPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [phone, setPhone] = useState<string | null>(null)

  const sendForm = useForm<SendOtpForm>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      phone: '',
      otpConsent: false,
    },
  })

  const verifyForm = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  })

  const sendOtpMutation = useMutation({
    mutationFn: (values: SendOtpForm) => sendOtp(values.phone),
    onSuccess: (data, variables) => {
      setPhone(variables.phone)
      toast.success(data.message)
      verifyForm.reset({ otp: '' })
    },
  })

  const verifyOtpMutation = useMutation({
    mutationFn: (values: VerifyOtpForm) => {
      if (!phone) {
        throw new Error('Phone number missing')
      }
      return verifyOtp(phone, values.otp)
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      navigate('/app/events', { replace: true })
    },
  })

  const sendError =
    sendOtpMutation.error instanceof ApiError
      ? sendOtpMutation.error.message
      : sendOtpMutation.error?.message

  const verifyError =
    verifyOtpMutation.error instanceof ApiError
      ? verifyOtpMutation.error.message
      : verifyOtpMutation.error?.message

  return (
    <PageLayout width="auth">
      <AuthLogoHeader>
        <AppLogo size="md" />
      </AuthLogoHeader>

      <AuthCard>
        <h1 className="xp-page-title">
          <Icon icon={LogIn} size={24} className="text-primary" aria-hidden />
          Sign in
        </h1>
        <p className="xp-page-subtitle">
          {isBetaMode
            ? 'Private beta — enter your mobile number, then use the last 6 digits of that number as the OTP.'
            : 'Enter your mobile number to receive a one-time password.'}
        </p>

        {isBetaMode && !phone && (
          <Alert variant="info" className="mt-4">
            No SMS in beta. After Send OTP, enter the last 6 digits of your mobile
            number (e.g. …9876543210 → 543210).
          </Alert>
        )}

        {!phone ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={sendForm.handleSubmit((values) =>
              sendOtpMutation.mutate(values),
            )}
          >
            <div>
              <label htmlFor="phone" className="xp-label">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91XXXXXXXXXX or 10 digits"
                className="xp-input"
                {...sendForm.register('phone')}
              />
              {sendForm.formState.errors.phone && (
                <p className="mt-1 text-sm text-error-text">
                  {sendForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm text-text-label">
              <input
                type="checkbox"
                className="mt-1 accent-[var(--color-primary)]"
                {...sendForm.register('otpConsent')}
              />
              <span>I consent to receive a one-time password via SMS.</span>
            </label>
            {sendForm.formState.errors.otpConsent && (
              <p className="text-sm text-error-text">
                {sendForm.formState.errors.otpConsent.message}
              </p>
            )}

            {sendError && <Alert variant="error">{sendError}</Alert>}

            <Button
              type="submit"
              loading={sendOtpMutation.isPending}
              className="w-full"
            >
              <Icon icon={Send} size={20} aria-hidden />
              {sendOtpMutation.isPending ? 'Sending…' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={verifyForm.handleSubmit((values) =>
              verifyOtpMutation.mutate(values),
            )}
          >
            <p className="text-sm text-text-secondary">
              {isBetaMode ? (
                <>
                  Enter the last 6 digits of{' '}
                  <span className="font-medium text-text-primary">{phone}</span>{' '}
                  as the OTP.
                </>
              ) : (
                <>
                  Code sent to{' '}
                  <span className="font-medium text-text-primary">{phone}</span>.
                  Check the backend terminal for the OTP in local dev.
                </>
              )}
            </p>

            <div>
              <label htmlFor="otp" className="xp-label">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                className="xp-input tracking-widest"
                {...verifyForm.register('otp')}
              />
              {verifyForm.formState.errors.otp && (
                <p className="mt-1 text-sm text-error-text">
                  {verifyForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            {verifyError && <Alert variant="error">{verifyError}</Alert>}

            <Button
              type="submit"
              loading={verifyOtpMutation.isPending}
              className="w-full"
            >
              <Icon icon={ShieldCheck} size={20} aria-hidden />
              {verifyOtpMutation.isPending ? 'Verifying…' : 'Verify OTP'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setPhone(null)
                sendOtpMutation.reset()
                verifyOtpMutation.reset()
              }}
            >
              <Icon icon={ArrowLeft} size={16} aria-hidden />
              Use a different number
            </Button>
          </form>
        )}
      </AuthCard>

      <AuthFooter>
        Backend: {import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}
      </AuthFooter>
    </PageLayout>
  )
}
