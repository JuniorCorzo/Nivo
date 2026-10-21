# Change Proposal: Unplated Vehicles Photo Capture & Public Digital Ticket (RF-012)

## 1. Problem Statement

In fast-paced parking environments, vehicles without physical license plates (new motorcycles, temporary dealership transit, unplated mopeds) represent a high security and revenue loss risk. Operating booths lacked an automated protocol to register, track, and validate unplated vehicles with non-repudiable photographic proof.

## 2. Proposed Solution

1. **Binary Check-In Modality:** Operators switch seamlessly between "Con Placa" (with CO/VE mask autodetection) and "Sin Placa (Foto obligatoria)".
2. **Synthetic Sequential Plate Generation:** The backend dynamically generates a deterministic, unique sequential code (`SP-1001`, `SP-1002`, etc.) per facility via `UnplatedTicketSequenceGateway`.
3. **Mandatory Photographic Proof:** Check-in requires photo evidence (`photoUrl`); missing images trigger `UnplatedVehiclePhotoRequiredException`.
4. **Public Digital Ticket Web Page:** Drivers receive a public ticket link (`/public-ticket/:id`) via QR or WhatsApp, showing their photo, assigned slot, timestamp, and rate breakdown in a sanitized view.

## 3. Scope & Impact

- **Backend (`apps/api`):** `CheckinVehicleUseCase`, `UnplatedTicketSequenceGateway`, `GetPublicTicketUseCase`, `PublicTicketController`.
- **Frontend (`apps/web`):** `CheckInModalComponent`, `PhotoCaptureComponent`, `PublicTicketPageComponent`, `CheckInFacade`, `PlateMaskDirective`.
- **Database:** `parking_tickets` schema columns `photo_url`, `phone_number`, `plate_country` (`UNPLATED`), and unplated sequence tracker.
