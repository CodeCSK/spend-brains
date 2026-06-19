# API contract

> REST JSON · prefix `/v1` · Full spec → [spec.md](./spec.md)  
> Live docs when server runs → `/apis` (Swagger UI) · `/dashboard` (npm scripts)

## Conventions

JSON · `Authorization: Bearer` · pagination `?page&limit`

## Domain map (leaf docs planned)

```text
/v1/auth/*     → authentication.md
/v1/users/*    → users.md
/v1/events/*   → events.md, expenses.md, settlements.md
```

## Related

- [../architecture.md](../architecture.md)
- [../database/schema.md](../database/schema.md)
- [../../../../docs/ops/security-and-dpdp.md](../../../../docs/ops/security-and-dpdp.md)
- [../../../../docs/app-story.md](../../../../docs/app-story.md)
