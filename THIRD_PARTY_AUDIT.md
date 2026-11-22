# FITSYNC — Third-Party Audit & Dependency Governance

This audit inventories all third-party libraries, SDKs, and external API integrations utilized in FITSYNC, detailing purpose, license, and data privacy implications.

---

## 1. Backend Dependencies

| Package | Version | License | Purpose | Data Handling & Privacy Note |
|---|---|---|---|---|
| `express` | ^4.21.0 | MIT | Core HTTP routing framework | Operates locally in memory; no telemetry |
| `better-sqlite3` | ^11.6.0 | MIT | Embedded synchronous SQLite database | Local filesystem storage only; zero cloud leaks |
| `bcryptjs` | ^2.4.3 | MIT | One-way password hashing (salt rounds) | Client passwords never stored plaintext |
| `jsonwebtoken` | ^9.0.2 | MIT | Stateless JWT authentication tokens | Cryptographic verification |
| `helmet` | ^8.0.0 | MIT | Security HTTP response headers | Enforces browser security policies |
| `multer` | ^1.4.5 | MIT | Multipart image upload streaming | Local storage streaming |
| `sharp` | ^0.33.5 | Apache-2.0 | High-performance image thumbnail generation | Strips EXIF metadata before persistence |
| `cors` | ^2.8.5 | MIT | Cross-Origin Resource Sharing control | Restricts API requests to configured frontend |
| `express-rate-limit`| ^7.4.1 | MIT | IP-based request throttling | Mitigates brute-force attacks |
| `express-validator` | ^7.2.0 | MIT | Input sanitization and validation schemas | Blocks injection payloads |
| `cookie-parser` | ^1.4.7 | MIT | HTTP cookie header parsing | Parses session tokens |
| `dotenv` | ^16.4.5 | BSD-2-Clause | Environment variable management | Keeps secrets out of source code |
| `uuid` | ^10.0.0 | MIT | RFC4122 cryptographic UUID generation | Zero collisions across entities |

---

## 2. Frontend Dependencies

| Package | Version | License | Purpose | Data Handling & Privacy Note |
|---|---|---|---|---|
| `react` / `react-dom`| ^19.0.0 | MIT | Component UI rendering engine | Client-side execution |
| `react-router-dom` | ^7.0.1 | MIT | Client-side SPA routing & navigation | Client-side routing |
| `lucide-react` | ^0.460.0| ISC | Minimalist SVG iconography | Clean local SVG assets |
| `zustand` | ^5.0.1 | MIT | Reactive state management stores | Client-side memory cache |
| `axios` | ^1.7.7 | MIT | HTTP client for backend REST API calls | Sends JWT Authorization header |
| `react-dropzone` | ^14.3.5 | MIT | Drag-and-drop file upload zone | Client-side file preview generator |
| `react-hot-toast` | ^2.4.1 | MIT | Accessible toast notifications | Ephemeral UI alerts |
| `date-fns` | ^4.1.0 | MIT | Date formatting & calendar utilities | Client-side formatting |
| `clsx` | ^2.1.1 | MIT | Dynamic Tailwind class composition | Zero runtime overhead |
| `tailwindcss` | ^3.4.15 | MIT | Utility-first CSS design token compiler | Build-time CSS compilation |

---

## 3. External API Integrations

### OpenAI Vision (`gpt-4o`) — *Optional Configurable Provider*
- **Purpose**: Identifies garment categories, dominant colors, fabric materials, and formality levels from uploaded images.
- **Data Minimization**: Only the cropped garment photograph is transmitted. No user identity, email, or profile metadata is shared with OpenAI.
- **Provider Abstraction**: When API keys are not supplied in `.env`, the system runs on the built-in `DemoProvider`, returning realistic mock recognitions without connecting to external networks.
