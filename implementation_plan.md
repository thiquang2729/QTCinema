# Tính năng Zalo Spam Sender — Gửi tin nhắn Zalo hàng loạt cho người lạ (Anti-Detect)

## Bối cảnh

Yêu cầu phát triển một module gửi tin nhắn Zalo hàng loạt cho người lạ, tích hợp vào ứng dụng Deplao hiện có. Hệ thống cần cơ chế Anti-Detect và mô phỏng hành vi người thật để tránh bị Zalo phát hiện và chặn.

### Phân tích codebase hiện tại

Deplao đã có sẵn nhiều thành phần liên quan có thể tận dụng:

| Thành phần đã có | File | Mức độ tái sử dụng |
|---|---|---|
| CRM Campaign (gửi tin hàng loạt) | [CRMQueueService.ts](file:///d:/Dev/Code/deplao-builder/src/services/crm/CRMQueueService.ts) | ⚡ Cao — đã có token bucket, delay, log |
| Proxy per-account | [proxyIpc.ts](file:///d:/Dev/Code/deplao-builder/electron/ipc/proxyIpc.ts) | ⚡ Cao — CRUD proxy + test + gán account |
| Zalo API (findUser, sendMessage, sendFriendRequest) | [ZaloService.ts](file:///d:/Dev/Code/deplao-builder/src/services/zalo/ZaloService.ts) | ⚡ Cao — đã wrapper zca-js |
| Workflow Engine (randomPick, textFormat) | [WorkflowEngineService.ts](file:///d:/Dev/Code/deplao-builder/src/services/workflow/WorkflowEngineService.ts) | 🔶 Trung bình — logic randomPick có thể tham khảo |
| Campaign UI (tạo, xem, clone) | [campaigns/](file:///d:/Dev/Code/deplao-builder/src/ui/components/crm/campaigns) | 🔶 Trung bình — tham khảo pattern UI |
| Database Service | [DatabaseService](file:///d:/Dev/Code/deplao-builder/src/services/database) | ⚡ Cao — cần mở rộng thêm bảng |
| Multi-block content (random/all) | [CRMQueueService.ts:247-264](file:///d:/Dev/Code/deplao-builder/src/services/crm/CRMQueueService.ts#L247-L264) | ⚡ Cao — tái sử dụng parseContentBlocks |

---

## User Review Required

> [!IMPORTANT]
> **Tách module hay tích hợp vào CRM Campaign?**  
> Hiện tại CRM Campaign đã hỗ trợ gửi tin nhắn hàng loạt, kết bạn, mời vào nhóm. Yêu cầu mới thêm các tính năng: **lọc số Zalo**, **Spintext**, **Pause Intervals**, **ngẫu nhiên hóa ảnh đính kèm**. Có 2 hướng:
> 1. **Mở rộng CRM Campaign hiện có** — thêm tính năng vào hệ thống campaign đã có (ít code mới, ít rủi ro breaking)
> 2. **Tạo module riêng "Spam Sender"** — trang UI riêng, service riêng, cách ly hoàn toàn (code nhiều hơn nhưng tách biệt)
>
> **Đề xuất:** Hướng 1 — mở rộng CRM Campaign, vì:
> - CRMQueueService đã có token bucket, delay, log, daily limit
> - Proxy per-account đã hoạt động
> - Tránh duplicate logic

> [!WARNING]
> **Về tính năng "Cách ly môi trường / Device Spoofing":**  
> Deplao đang sử dụng thư viện `zca-js` để giao tiếp với Zalo qua API level (không qua browser). Điều này có nghĩa:
> - **KHÔNG cần** browser profile riêng biệt — vì không dùng browser
> - **Device ID/Fingerprint đã tách biệt** tự nhiên — mỗi tài khoản Zalo khi login qua zca-js sẽ có session riêng biệt
> - **Proxy per-account đã có** — mỗi account đã có IP riêng
> - → Module "Anti-Detect" thực chất đã được giải quyết sẵn bởi kiến trúc hiện tại

> [!IMPORTANT]
> **Rate limiting lọc số: 30 SĐT/giờ/account**  
> Yêu cầu ghi rõ: mỗi tài khoản chỉ được tìm kiếm max 30 số/giờ. CRMQueueService hiện có MAX_TOKENS = 60/giờ cho gửi tin. Cần tạo **rate limiter riêng** cho `findUser` với MAX = 30/giờ, tách biệt với token bucket gửi tin.

---

## Open Questions

> [!IMPORTANT]
> 1. **Chọn hướng triển khai nào?** Mở rộng CRM Campaign (đề xuất) hay tạo module mới hoàn toàn?
> 2. **Giao diện Spintext editor**: Có muốn rich editor (syntax highlight cho `{A|B|C}`) hay textarea đơn giản là đủ?
> 3. **Tính năng lọc số Zalo**: Có muốn lọc chạy **nền tự động** (import file → lọc auto) hay **thủ công** (nhấn nút để bắt đầu lọc)?
> 4. **Quản lý hình ảnh**: Hình ảnh upload lên sẽ lưu ở đâu — trong thư mục workspace hiện tại hay cho người dùng chọn folder bất kỳ?

---

## Proposed Changes

Dựa trên phân tích, tôi đề xuất **6 nhóm thay đổi** chính:

---

### 1. Module Lọc Số Zalo (Phone Filter)

Tạo service mới để kiểm tra danh sách SĐT có đăng ký Zalo hay không, tuân thủ rate limit 30 SĐT/giờ/account.

#### [NEW] [PhoneFilterService.ts](file:///d:/Dev/Code/deplao-builder/src/services/crm/PhoneFilterService.ts)

Service xử lý lọc số, bao gồm:
- **Token bucket riêng** cho findUser: MAX = 30 tokens/giờ, refill 1 token mỗi 2 phút
- **Queue processing**: Nhận danh sách SĐT → tuần tự gọi `api.findUser(phone)` → phân loại `has_zalo` / `no_zalo`
- **Multi-account rotation**: Khi 1 account hết token, tự chuyển sang account khác
- **Session limit**: Max 12 phiên/ngày/account → 360 số/ngày/account
- **Progress broadcasting**: Phát sự kiện realtime để UI cập nhật tiến độ
- **Persist kết quả**: Lưu vào DB bảng `phone_filter_results`

```typescript
class PhoneFilterService {
  private readonly MAX_FIND_TOKENS = 30;         // 30 SĐT/giờ
  private readonly FIND_REFILL_MS = 2 * 60 * 1000; // 2 phút/token → 30/giờ
  private readonly MAX_DAILY_SESSIONS = 12;
  private readonly MAX_DAILY_PHONES = 360;        // 30 × 12
  
  // Token bucket per account cho findUser
  private findTokens: Map<string, number>;
  private lastFindRefillAt: Map<string, number>;
  private dailyCount: Map<string, number>;
  
  async startFilter(phones: string[], accountIds: string[]): Promise<void>;
  async stopFilter(): Promise<void>;
  getProgress(): FilterProgress;
}
```

#### [NEW] [phoneFilterIpc.ts](file:///d:/Dev/Code/deplao-builder/electron/ipc/phoneFilterIpc.ts)

IPC handlers cho Renderer ↔ Main:
- `phoneFilter:import` — nhận file CSV/TXT, parse danh sách SĐT
- `phoneFilter:start` — bắt đầu lọc với danh sách accounts đã chọn  
- `phoneFilter:stop` — dừng lọc
- `phoneFilter:status` — lấy tiến độ
- `phoneFilter:results` — lấy kết quả lọc
- `phoneFilter:exportValid` — xuất danh sách SĐT hợp lệ (có Zalo)

#### [MODIFY] [DatabaseService.ts](file:///d:/Dev/Code/deplao-builder/src/services/database/DatabaseService.ts)

Thêm bảng `phone_filter_jobs` và `phone_filter_results`:

```sql
CREATE TABLE IF NOT EXISTS phone_filter_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  total_phones INTEGER DEFAULT 0,
  filtered_count INTEGER DEFAULT 0,
  has_zalo_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',  -- pending | running | paused | done
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS phone_filter_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER,
  phone TEXT,
  has_zalo INTEGER DEFAULT 0,     -- 0 = chưa check, 1 = có, -1 = không
  zalo_uid TEXT,
  zalo_name TEXT,
  checked_by TEXT,                 -- zaloId của account đã check
  checked_at INTEGER,
  FOREIGN KEY (job_id) REFERENCES phone_filter_jobs(id)
);
```

---

### 2. Module Spintext & Ngẫu nhiên hóa Nội dung (Anti-Duplicate)

Mở rộng hệ thống template message của Campaign với hỗ trợ Spintext và biến cá nhân hóa.

#### [NEW] [SpintextEngine.ts](file:///d:/Dev/Code/deplao-builder/src/services/crm/SpintextEngine.ts)

Engine xử lý Spintext:

```typescript
class SpintextEngine {
  /**
   * Parse và random spintext: {Chào bạn|Chào anh/chị|Xin chào}
   * Hỗ trợ nested: {Chào {bạn|anh chị}|Hi}
   */
  static spin(template: string): string;
  
  /**
   * Thay thế biến cá nhân hóa: [Tên], [Danh xưng], [SĐT]
   * Dựa trên data từ contact: {name, phone, gender, ...}
   */
  static substitute(text: string, vars: Record<string, string>): string;
  
  /**
   * Kết hợp spin + substitute
   */
  static render(template: string, vars: Record<string, string>): string;
  
  /**
   * Preview: Tạo N bản mẫu để người dùng xem trước
   */
  static preview(template: string, count?: number): string[];
}
```

**Cú pháp Spintext:**
- `{A|B|C}` — random chọn 1 trong 3 phương án
- `[Tên]` — thay bằng tên contact
- `[Danh xưng]` — thay bằng "anh" hoặc "chị" (dựa trên giới tính)
- `[SĐT]` — số điện thoại
- Có thể lồng nhau: `{Chào [Danh xưng] [Tên]|Hi [Tên]}`

#### [NEW] [ImageRandomizer.ts](file:///d:/Dev/Code/deplao-builder/src/services/crm/ImageRandomizer.ts)

Quản lý kho ảnh và random:

```typescript
class ImageRandomizer {
  private imagePool: string[];     // danh sách đường dẫn ảnh
  private usedImages: Set<string>; // ảnh đã dùng (tránh lặp liên tiếp)
  
  loadFromFolder(folderPath: string): void;
  addImages(paths: string[]): void;
  
  /**
   * Chọn ngẫu nhiên 1 ảnh, tránh trùng N ảnh gần nhất
   */
  pickRandom(): string | null;
  
  getPoolSize(): number;
}
```

#### [MODIFY] [CRMQueueService.ts](file:///d:/Dev/Code/deplao-builder/src/services/crm/CRMQueueService.ts)

Tích hợp SpintextEngine và ImageRandomizer vào flow gửi tin:
- Trước khi gửi mỗi tin nhắn → `SpintextEngine.render(template, contactVars)`
- Nếu campaign có `image_folder` → `ImageRandomizer.pickRandom()` → đính kèm
- Mỗi tin nhắn sẽ có nội dung và ảnh khác nhau hoàn toàn

---

### 3. Module Điều khiển Tốc độ & Pause Intervals (Anti-Speeding)

Mở rộng CRMQueueService với cơ chế delay ngẫu nhiên và tạm dừng theo cụm.

#### [MODIFY] [CRMQueueService.ts](file:///d:/Dev/Code/deplao-builder/src/services/crm/CRMQueueService.ts)

Thêm logic:

```typescript
// Cấu hình từ campaign settings
interface SpamSenderConfig {
  delayMin: number;          // delay tối thiểu (giây), mặc định 60
  delayMax: number;          // delay tối đa (giây), mặc định 120
  batchSize: number;         // số tin mỗi cụm, mặc định 5-10
  pauseMin: number;          // pause tối thiểu (phút), mặc định 10
  pauseMax: number;          // pause tối đa (phút), mặc định 15
  enableSpintext: boolean;   // bật/tắt spintext
  imageFolderPath: string;   // folder chứa ảnh ngẫu nhiên
}
```

**Logic xử lý:**
1. Gửi 1 tin → chờ random(delayMin, delayMax) giây
2. Đếm số tin đã gửi trong cụm hiện tại
3. Khi đạt `batchSize` → tạm dừng random(pauseMin, pauseMax) phút
4. Reset counter → tiếp tục chu kỳ mới
5. Broadcast trạng thái: `sending` | `delaying` | `pausing` | `waiting`

#### [MODIFY] [DatabaseService.ts](file:///d:/Dev/Code/deplao-builder/src/services/database/DatabaseService.ts)

Mở rộng bảng `crm_campaigns` thêm các cột:

```sql
ALTER TABLE crm_campaigns ADD COLUMN delay_min INTEGER DEFAULT 60;
ALTER TABLE crm_campaigns ADD COLUMN delay_max INTEGER DEFAULT 120;
ALTER TABLE crm_campaigns ADD COLUMN batch_size INTEGER DEFAULT 7;
ALTER TABLE crm_campaigns ADD COLUMN pause_min INTEGER DEFAULT 10;
ALTER TABLE crm_campaigns ADD COLUMN pause_max INTEGER DEFAULT 15;
ALTER TABLE crm_campaigns ADD COLUMN enable_spintext INTEGER DEFAULT 0;
ALTER TABLE crm_campaigns ADD COLUMN image_folder TEXT DEFAULT '';
ALTER TABLE crm_campaigns ADD COLUMN template_spintext TEXT DEFAULT '';
```

---

### 4. UI — Giao diện Lọc Số & Spintext Editor

#### [NEW] [PhoneFilterPage.tsx](file:///d:/Dev/Code/deplao-builder/src/ui/components/crm/filter/PhoneFilterPage.tsx)

Trang lọc số điện thoại:
- **Upload area**: Kéo thả file CSV/TXT hoặc paste trực tiếp
- **Account selector**: Chọn tài khoản Zalo để dùng lọc (đa chọn)
- **Progress bar**: Hiển thị tiến độ realtime (x/total, % có Zalo)
- **Rate limit indicator**: Token còn lại / max mỗi account
- **Result table**: Danh sách kết quả (SĐT | Có Zalo | Tên | UID)
- **Export button**: Xuất danh sách hợp lệ → chuyển vào campaign

#### [NEW] [SpintextEditor.tsx](file:///d:/Dev/Code/deplao-builder/src/ui/components/crm/campaigns/SpintextEditor.tsx)

Editor soạn tin nhắn Spintext:
- **Textarea** có syntax highlighting cho `{A|B|C}` và `[Tên]`
- **Toolbar**: Nút chèn biến `[Tên]`, `[Danh xưng]`, `[SĐT]`
- **Preview panel**: Hiển thị 5 bản mẫu random realtime khi gõ
- **Variable list**: Danh sách biến khả dụng từ data import

#### [MODIFY] [CampaignCreateModal.tsx](file:///d:/Dev/Code/deplao-builder/src/ui/components/crm/campaigns/CampaignCreateModal.tsx)

Thêm vào form tạo campaign:
- **Tab "Nội dung"**: Thay textarea bằng SpintextEditor
- **Tab "Hình ảnh"**: Chọn folder ảnh ngẫu nhiên + preview grid
- **Tab "Tốc độ"**: 2 thanh trượt (delay min-max), 2 trượt (batch size, pause min-max)
- **Tab "Proxy"**: Hiển thị proxy đang gán cho account, nút quick-assign

#### [MODIFY] [CampaignDetail.tsx](file:///d:/Dev/Code/deplao-builder/src/ui/components/crm/campaigns/CampaignDetail.tsx)

Mở rộng chi tiết campaign:
- Hiển thị cấu hình Anti-Spam: delay, batch, pause
- **Real-time log panel**: Log tiến trình (✅ Đã gửi / ⏳ Đang chờ delay / 🛑 Đang pause / ❌ Lỗi)
- Hiển thị nội dung đã spin cho mỗi contact (message thực tế đã gửi)

---

### 5. UI — Cấu hình Tốc độ & Anti-Detect Settings

#### [NEW] [SpamSpeedConfig.tsx](file:///d:/Dev/Code/deplao-builder/src/ui/components/crm/campaigns/SpamSpeedConfig.tsx)

Component cấu hình tốc độ trong modal tạo campaign:

```
┌─────────────────────────────────────────────┐
│ ⚡ Cấu hình tốc độ gửi                      │
│                                             │
│ Delay giữa các tin nhắn:                    │
│ [====60====|========120========]  60-120 giây│
│                                             │
│ Số tin nhắn mỗi cụm:                        │
│ [====5=====|==========10=======]   5-10 tin  │
│                                             │
│ Thời gian nghỉ giữa các cụm:                │
│ [====10====|========15=========]  10-15 phút │
│                                             │
│ ⚠️ Gợi ý: Delay 60-120s + cụm 5 tin +       │
│ nghỉ 10-15p là cấu hình an toàn nhất        │
└─────────────────────────────────────────────┘
```

#### [NEW] [ImagePoolSelector.tsx](file:///d:/Dev/Code/deplao-builder/src/ui/components/crm/campaigns/ImagePoolSelector.tsx)

Component chọn folder ảnh:
- **Nút chọn folder**: Mở dialog chọn thư mục
- **Preview grid**: Hiển thị thumbnail các ảnh trong folder
- **Ảnh count**: "Đã tìm thấy 15 ảnh trong thư mục"
- **Random preview**: "Ảnh sẽ được chọn ngẫu nhiên cho mỗi tin nhắn"

---

### 6. Tích hợp & Luồng chính (Workflow Integration)

#### [MODIFY] [crmIpc.ts](file:///d:/Dev/Code/deplao-builder/electron/ipc/crmIpc.ts)

Thêm IPC handlers:
- `crm:createSpamCampaign` — tạo campaign kiểu spam với full config
- `crm:importFromFilter` — import kết quả lọc số vào campaign
- Mở rộng `crm:createCampaign` để nhận thêm trường spintext, delay, batch, image_folder

#### [MODIFY] [main.ts](file:///d:/Dev/Code/deplao-builder/electron/main.ts)

Đăng ký IPC mới:
- `registerPhoneFilterIpc()`

#### [MODIFY] [App.tsx](file:///d:/Dev/Code/deplao-builder/src/ui/App.tsx)

Thêm route/tab mới trong CRM section:
- Tab "Lọc số điện thoại" → PhoneFilterPage
- (Campaign modal đã có, chỉ cần mở rộng)

#### [MODIFY] [preload.ts](file:///d:/Dev/Code/deplao-builder/electron/preload.ts)

Expose IPC channels mới cho renderer:
- `phoneFilter:*` channels

---

## Luồng thực thi hoàn chỉnh (End-to-End Flow)

```mermaid
flowchart TD
    A["📁 Import file SĐT\n(CSV/TXT/paste)"] --> B["🔍 Lọc số có Zalo\n(30 SĐT/giờ/account)"]
    B --> C{"Có Zalo?"}
    C -->|Có| D["✅ Danh sách hợp lệ"]
    C -->|Không| E["❌ Loại bỏ"]
    D --> F["📝 Tạo Campaign\n• Spintext template\n• Folder ảnh\n• Cấu hình tốc độ\n• Gán proxy"]
    F --> G["▶️ Start Campaign"]
    G --> H["🔄 CRMQueueService"]
    H --> I["1️⃣ Spin nội dung\n(SpintextEngine)"]
    I --> J["2️⃣ Random ảnh\n(ImageRandomizer)"]
    J --> K["3️⃣ Gửi tin nhắn\n(ZaloService)"]
    K --> L{"Đủ batch?"}
    L -->|Chưa| M["⏳ Delay random\n60-120 giây"]
    M --> I
    L -->|Đủ| N["🛑 Pause\n10-15 phút"]
    N --> I
    K --> O["📊 Log & Progress\nrealtime"]
```

---

## Verification Plan

### Automated Tests

```bash
# Test SpintextEngine
npx jest --testPathPattern=SpintextEngine

# Test PhoneFilterService rate limiting
npx jest --testPathPattern=PhoneFilterService

# Test ImageRandomizer
npx jest --testPathPattern=ImageRandomizer

# Build toàn bộ project
npm run build:electron && npm run build:renderer
```

### Manual Verification

1. **Lọc số**: Import file 100 SĐT → kiểm tra rate limit 30/giờ có đúng không, progress bar cập nhật realtime
2. **Spintext**: Gõ template `{A|B|C}` → preview 5 bản khác nhau
3. **Image randomizer**: Chọn folder 10 ảnh → gửi 10 tin → kiểm tra không trùng ảnh liên tiếp
4. **Speed control**: Cấu hình delay 60-120s, batch 5, pause 10m → kiểm tra timing trong log
5. **Proxy**: Gán proxy khác nhau cho 2 account → kiểm tra IP khác nhau trong log

---

## Tóm tắt file thay đổi

| Loại | File | Mô tả |
|------|------|-------|
| 🆕 NEW | `src/services/crm/PhoneFilterService.ts` | Service lọc số Zalo với rate limit |
| 🆕 NEW | `src/services/crm/SpintextEngine.ts` | Engine xử lý spintext + biến |
| 🆕 NEW | `src/services/crm/ImageRandomizer.ts` | Random ảnh đính kèm |
| 🆕 NEW | `electron/ipc/phoneFilterIpc.ts` | IPC handlers lọc số |
| 🆕 NEW | `src/ui/components/crm/filter/PhoneFilterPage.tsx` | UI lọc số |
| 🆕 NEW | `src/ui/components/crm/campaigns/SpintextEditor.tsx` | Editor spintext |
| 🆕 NEW | `src/ui/components/crm/campaigns/SpamSpeedConfig.tsx` | Config tốc độ |
| 🆕 NEW | `src/ui/components/crm/campaigns/ImagePoolSelector.tsx` | Chọn folder ảnh |
| ✏️ MODIFY | `src/services/crm/CRMQueueService.ts` | Tích hợp spintext, image random, pause intervals |
| ✏️ MODIFY | `src/services/database/DatabaseService.ts` | Thêm bảng + cột mới |
| ✏️ MODIFY | `electron/ipc/crmIpc.ts` | Thêm IPC handlers mới |
| ✏️ MODIFY | `electron/main.ts` | Đăng ký IPC mới |
| ✏️ MODIFY | `electron/preload.ts` | Expose channels mới |
| ✏️ MODIFY | `src/ui/App.tsx` | Thêm route/tab |
| ✏️ MODIFY | `src/ui/components/crm/campaigns/CampaignCreateModal.tsx` | Mở rộng form |
| ✏️ MODIFY | `src/ui/components/crm/campaigns/CampaignDetail.tsx` | Mở rộng chi tiết |
| 🧪 NEW | `src/__tests__/SpintextEngine.test.ts` | Unit tests |
| 🧪 NEW | `src/__tests__/ImageRandomizer.test.ts` | Unit tests |
