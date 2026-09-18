# SMS recovery core

This directory contains the reusable missed-call recovery domain logic. Next.js route handlers only translate Twilio form posts into calls to this core.

## Client deployment

1. Create a client `BrandConfig` with `businessName`, `bookingUrl`, `servicesBlob`, `systemPrompt`, and `fromNumber`. `config.ts` is the Breathe Easy reference.
2. Provide a `RecoveryStore`, `SmsSender`, and `AiReplyGenerator`. The reference uses `JsonRecoveryStore`, Twilio's REST API, and GPT-4o-mini. Implement the same interfaces to move to a database, queue, another SMS carrier, or another model.
3. Set `APP_BASE_URL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, and `OPENAI_API_KEY`. Secrets stay server-side.
4. Configure Twilio to POST call status events to `/api/call/status`, incoming messages to `/api/sms/inbound`, and delivery updates to `/api/sms/status`. See the repository `SETUP.md` for console steps.

The core sends at most one automatic missed-call recovery per phone number every four hours, never sends to a locally opted-out number, and uses at most two AI-authored replies per conversation. The next inbound message gets a callback-time request and sets `needsHuman: true`.

`JsonRecoveryStore` writes `data/missed-call-leads.json` in this shape:

```json
{
  "leads": [
    {
      "caller": "+14045550123",
      "phone": "+14045550123",
      "startedAt": "2026-09-17T12:00:00.000Z",
      "messages": [],
      "status": "new",
      "lastAiReply": null
    }
  ]
}
```

The JSON adapter is appropriate for this reference and a single persistent Node process. For serverless or multi-instance production deployments, replace it with transactional shared storage while keeping the `RecoveryStore` interface; that preserves rate guards and concurrent conversation updates across instances.
