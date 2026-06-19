# Spendbrains — Security & DPDP

> Phase 1 launch gate. Hub → [README.md](./README.md)  
> Product → [../app-story.md](../app-story.md)

## Authentication (Phase 1)

| Item | Implementation |
|------|----------------|
| Primary auth | Phone OTP via MSG91 |
| OTP | Hashed; 5–10 min TTL; rate limited |
| CAPTCHA | Before OTP send on web |
| Session | JWT + refresh (~30 days) |
| Logout | Current device + all devices |
| HTTPS | Required |

---

## Authorization

NestJS guards: JWT → event membership → role → expense ownership

---

## DPDP launch gate (v1)

- [ ] Privacy Policy + Terms  
- [ ] OTP consent checkbox  
- [ ] Subprocessor list  
- [ ] Privacy contact + user rights process  
- [ ] Retention policy · cookie notice · breach runbook  

---

## Application security

Input validation · Prisma · CORS allowlist · presigned R2 uploads · security headers · redact logs

---

## Subprocessors

MSG91 · Neon · Fly.io · Cloudflare · Apple/Google (Phase 2/3)

---

## Related documents

- [../apps/backend/docs/api/spec.md](../apps/backend/docs/api/spec.md)
- [deployment.md](./deployment.md)
- [../apps/backend/docs/architecture.md](../apps/backend/docs/architecture.md)
