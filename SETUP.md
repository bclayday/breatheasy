# Breathe Easy setup

## Missed-call recovery

1. Copy `.env.example` to `.env.local`. Set `APP_BASE_URL` to the production HTTPS origin, set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` from Twilio, and set `OPENAI_API_KEY`. Never put these values in client-side (`NEXT_PUBLIC_`) variables.
2. In Twilio Console, go to **Develop → Phone Numbers → Manage → Active numbers**, select the Breathe Easy number, and open **Voice configuration**.
3. Under **Call status changes**, set the status callback URL to `https://YOUR_DOMAIN/api/call/status` and select **HTTP POST**. Save the number. Twilio posts the terminal `CallStatus`; the endpoint acts only on inbound `no-answer`, `busy`, or `failed` values. Keep the existing incoming-call webhook at `https://YOUR_DOMAIN/api/call`.
4. On the same number, open **Messaging configuration**. For **A message comes in**, choose **Webhook**, enter `https://YOUR_DOMAIN/api/sms/inbound`, and select **HTTP POST**. Save the number configuration.
5. Outbound messages automatically send delivery updates to `https://YOUR_DOMAIN/api/sms/status` when `APP_BASE_URL` is set. To set it explicitly in Twilio, use that URL as the message status callback with **HTTP POST**.
6. Place an inbound test call and let it reach a `no-answer`, `busy`, or `failed` state. Confirm one recovery SMS arrives, reply to it, and check **Owner Dashboard → Missed Calls**. A repeat missed call from the same caller within four hours must not send another recovery message.

### A2P registration

US application-to-person traffic from local 10DLC numbers must use an approved Twilio A2P 10DLC brand and messaging campaign. In Twilio Console, complete **Messaging → Regulatory Compliance → A2P 10DLC**, associate this number (or its Messaging Service) with the approved campaign, and use the documented opt-in flow. Keep the `Reply STOP to opt out` language; Twilio handles standard STOP filtering at the carrier layer and this app also records the opt-out locally.

If the number belongs to a Messaging Service, configure the inbound webhook on that service instead of the individual number. Toll-free senders require Twilio toll-free verification rather than A2P 10DLC registration.
