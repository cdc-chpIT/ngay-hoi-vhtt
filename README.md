# Web Ngày hội Văn hóa – Thể thao CHP 2026

Trang web một chiều cuộn cho **Ngày hội Văn hóa – Thể thao CHP 2026**,
Thứ Bảy **17/10/2026**, Hội trường Viện Hàn lâm Khoa học xã hội Việt Nam (số 1 Liễu Giai, Hà Nội).
Chủ đề: *Xây dựng Văn hóa CHP — Truyền thống · Tự lực · Thích ứng*.

Nội dung trên trang: ba trục văn hóa, chương trình cả ngày, ba diễn giả, mini game,
lịch thi đấu và nhánh đấu buổi chiều, danh sách đội, luật thi đấu, giải thưởng, ảnh ngày hội.
Có form đặt câu hỏi cho diễn giả, mã QR để mọi người quét vào trang, bảng nhập kết quả cho BTC,
và **phần "Đang diễn ra"** tự cập nhật theo giờ.

Trang chạy hoàn toàn bằng file tĩnh — **không cần cài đặt gì, không cần Node, không cần build**.

---

## 0. Phần "Đang diễn ra" — điểm mới

Mở trang bất cứ lúc nào trong ngày hội là thấy ngay đang tới phần nào, còn bao nhiêu phút,
và tiếp theo là gì. Có ba chỗ hiển thị:

- **Thanh mỏng bám đầu trang** — hiện suốt lúc ngày hội đang chạy.
- **Bảng lớn ở mục “Đang diễn ra”** — tên hoạt động, người phụ trách, thanh tiến độ,
  hoạt động tiếp theo. Buổi chiều có thêm bảng **trận đang đánh trên từng sân**.
- **Dòng thời gian** — mốc đang diễn ra được tô sáng.

Cách hoạt động:

| Buổi | Căn cứ |
|---|---|
| Sáng | Theo đồng hồ, vì chương trình đã chốt từng phút trong kế hoạch |
| Chiều | Theo kết quả đã nhập (trận nào chưa có điểm là trận đang/sắp đánh); chưa có kết quả thì bám theo đồng hồ |

Mọi mốc giờ quy về **giờ Việt Nam (+07:00)**, nên người ở TP.HCM hay ở nước ngoài
xem trên điện thoại lệch múi giờ vẫn thấy đúng.

### Xem thử trước ngày hội

Thêm `?gio=` vào cuối địa chỉ để xem trang như đang ở thời điểm đó:

```
http://localhost:4173/?gio=09:20     → đang nghe Bài 2 (Văn hóa tự lực)
http://localhost:4173/?gio=10:40     → đang chơi mini game
http://localhost:4173/?gio=14:30     → đang thi đấu, xem bảng 5 sân
http://localhost:4173/?gio=12:00     → đang nghỉ trưa
```

Trong mục “Đang diễn ra” cũng có sẵn hai nút **Xem thử 9:20** và **Xem thử 14:30**.

---

## 1. Chạy thử trên máy

Mở thẳng `index.html` bằng trình duyệt là xem được (trừ mã QR — xem mục 4).

Muốn giống hệt lúc lên mạng thì chạy một web server nhỏ ngay trong thư mục này:

```bash
python -m http.server 4173
```

Rồi mở `http://localhost:4173`.

---

## 2. Đưa lên mạng

Chọn một trong các cách sau, cách nào cũng được và đều miễn phí:

| Cách | Làm gì |
|---|---|
| **Netlify Drop** | Vào `app.netlify.com/drop`, kéo cả thư mục này thả vào. Xong là có link. |
| **GitHub Pages** | Push thư mục này lên một repo, vào *Settings → Pages*, chọn nhánh `main` thư mục `/ (root)`. |
| **Vercel** | `vercel deploy` trong thư mục này, chọn framework *Other*. |
| **Server nội bộ công ty** | Copy cả thư mục vào thư mục web của server. |

Sau khi có địa chỉ, nhớ điền vào `siteUrl` trong `assets/js/config.js` (mục 4).

---

## 3. Những chỗ cần sửa trước ngày hội

Mở `assets/js/config.js` — mọi thứ quan trọng nằm ở đó, có chú thích tiếng Việt từng dòng.

| Việc | Sửa ở đâu |
|---|---|
| Ngày diễn ra sự kiện | `eventDate` trong `config.js` — đang là `'2026-10-17T08:30'` |
| Địa điểm | `venueName`, `venueAddress` trong `config.js` |
| Google Form đặt câu hỏi | `formEmbedUrl`, `formOpenUrl` trong `config.js` |
| Link phòng mini game | `quizJoinUrl` trong `config.js` |
| Địa chỉ web để tạo QR | `siteUrl` trong `config.js` |
| Cập nhật kết quả trực tiếp | `resultsCsvUrl` trong `config.js` |
| Chương trình buổi sáng | mảng `timeline` trong `assets/js/data.js` |
| Ba trục văn hóa | mảng `pillars` trong `assets/js/data.js` |
| Diễn giả & bài chia sẻ | mảng `talks` trong `assets/js/data.js` |
| Mini game | object `miniGame` trong `assets/js/data.js` |
| Ảnh ngày hội | mảng `gallery` trong `assets/js/data.js` |
| Danh sách đội, vận động viên | mảng `events` và `jumpRope` trong `assets/js/data.js` |
| Kết quả trận đấu | object `results` trong `assets/js/data.js` |

### Thêm ảnh thật

**Ảnh diễn giả.** Bỏ ảnh vào `assets/img/`, rồi thêm trường `photo` cho bài tương ứng
trong mảng `talks` ở `data.js`:

```js
{ no: 2, pillar: 'tuluc', ..., photo: 'assets/img/dien-gia-2.jpg' }
```

Chưa có ảnh thì trang dùng chân dung vẽ sẵn (mỗi bài một dáng khác nhau).
Ảnh nên cắt vuông, tối thiểu 200×200.

**Ảnh ngày hội.** Khai báo trong `gallery` ở `data.js`:

```js
gallery: [
  { src: 'assets/img/check-in.jpg', caption: 'Đón khách từ 08h00' },
  { src: 'assets/img/bai-2.jpg',    caption: 'Chuyện kể từ công trường Đại Ngãi' }
],
```

Để trống thì mục Ảnh hiện bốn khung chờ.

**Tường người tham dự** ở mục *Các đội* tự dựng từ danh sách đăng ký trong `data.js` —
63 người, chữ cái đầu, màu theo bộ phận, số nội dung mỗi người đăng ký. Không cần làm gì thêm.

### Gắn Google Form

1. Mở Google Form → bấm **Gửi** (Send).
2. Chọn tab `<>`.
3. Copy giá trị trong `src="…"` (dạng `https://docs.google.com/forms/d/e/…/viewform?embedded=true`).
4. Dán vào `formEmbedUrl` trong `config.js`.
5. Lấy thêm link rút gọn ở tab 🔗 rồi dán vào `formOpenUrl` (dùng cho nút "Mở form ở tab mới").

Chưa gắn thì trang vẫn chạy bình thường, chỗ form hiện hướng dẫn 3 bước này.

---

## 4. Mã QR

Mã QR trỏ tới chính địa chỉ của trang. Trang tự lấy địa chỉ trên thanh URL, nên:

- Mở bằng `file://` (nháy đúp `index.html`) → **không tạo được QR**, trang sẽ báo rõ.
- Đã đưa lên mạng → QR tự đúng. Muốn chắc chắn thì điền `siteUrl` trong `config.js`.

**Chế độ máy chiếu:** bấm nút *Mở chế độ máy chiếu* ở mục Hỏi diễn giả,
hoặc mở `địa-chỉ-trang/?qr=1`, hoặc bấm `Shift + Q`.
Màn hình sẽ hiện mã QR cỡ lớn — chiếu lên trong lúc diễn giả trình bày.

---

## 5. Nhập kết quả trong ngày

### Cách 1 — Bảng BTC trên trang (đơn giản nhất)

Mở `địa-chỉ-trang/?btc=1` (hoặc bấm `Shift + B`, hoặc nút *Bảng BTC* ở cuối trang).

- Nhập điểm từng trận. Đội thắng **tự động đi tiếp** sang vòng sau, bục trao giải tự cập nhật.
- Nút **Bốc thăm vị trí**: xếp ngẫu nhiên các đội lên nhánh đấu, **xếp lại giờ thi đấu
  để không ai phải đánh hai trận cùng lúc**, rồi đưa ra đoạn `seeds: […]`
  để dán vào `data.js` cho khỏi mất.
  Kết quả bốc thăm lưu trên máy này; trang sẽ ghi rõ điều đó ngay trên nhánh đấu.
- Nút **Tải CSV** / **Sao chép CSV**: xuất kết quả đã nhập.

> Điểm nhập ở đây **chỉ lưu trên máy đang dùng** (trình duyệt của thư ký / máy chiếu).
> Điện thoại của người khác không thấy. Muốn cả nhà cùng thấy thì làm thêm Cách 2.

### Cách 2 — Cập nhật trực tiếp qua Google Sheets (cả nhà cùng thấy)

1. Tạo một Google Sheet với đúng 3 cột, dòng đầu là tiêu đề:

   | match_id | score_a | score_b |
   |---|---|---|
   | pb-mix-TK-1 | 11 | 7 |
   | pb-mix-TK-2 | 9 | 11 |

   `match_id` lấy ngay trên thẻ trận ở mục **Lịch thi đấu** (dòng chữ nhỏ màu xám, ví dụ `pb-nam-VL-1`).
   `score_a` là điểm của đội ghi ở **dòng trên**, `score_b` là đội ở **dòng dưới**.

2. Lấy link CSV. **Nên dùng cách A** — cách B có độ trễ vài phút:

   **A. Link trực tiếp (cập nhật gần như tức thì)**

   Chia sẻ sheet ở chế độ *Bất kỳ ai có đường liên kết → Người xem*, rồi dùng link dạng:

   ```
   https://docs.google.com/spreadsheets/d/<ID_SHEET>/gviz/tq?tqx=out:csv&sheet=<tên_sheet>
   ```

   `<ID_SHEET>` là đoạn giữa `/d/` và `/edit` trên thanh địa chỉ.

   **B. Xuất bản lên web**

   *File → Chia sẻ → Xuất bản lên web* → chọn sheet → định dạng **CSV** → *Xuất bản* → copy link.
   Cách này Google chỉ làm mới bản xuất bản sau vài phút, nên kết quả hiện chậm hơn.

3. Dán link vào `resultsCsvUrl` trong `config.js`, đưa file lên lại.

Từ đó trang tự tải lại kết quả mỗi 30 giây (sửa `pollSeconds` nếu muốn khác).
Thư ký chỉ cần gõ điểm vào Google Sheet trên điện thoại, mọi người refresh là thấy.

> Nhớ thử trước ngày hội: mở trang, xem dòng trạng thái ở mục **Phần Thể thao**.
> Nếu báo "Chưa đọc được bảng kết quả trực tiếp" thì sheet chưa được chia sẻ công khai.

Thứ tự ưu tiên khi lấy kết quả: `data.js` → Google Sheet → điểm nhập trên máy đó.

---

## 6. Cách trang tính lịch và nhánh đấu

Không có trận nào được viết tay. Tất cả sinh ra từ `data.js`:

- **Thể thức** (`format`) quyết định bộ trận:
  - `ko12b4` — 12 đội, 4 đội bốc được miễn vòng loại vào thẳng tứ kết (11 trận).
  - `ko8` — 8 đội loại trực tiếp từ tứ kết (7 trận).
  - `r6diff` — 6 đội, 3 trận vòng đầu, 2 đội thắng có hiệu số cao nhất đánh chung kết,
    đội thắng còn lại hạng ba (4 trận).
- **Xếp sân và giờ**: mỗi khu sân có `slotMinutes` (pickleball 15 phút, cầu lông 20 phút)
  và `roundOrder` — thứ tự các vòng được đưa lên sân. Trang xếp lần lượt, bảo đảm
  **một trận không bao giờ bắt đầu trước khi các trận nó phụ thuộc đã đấu xong**,
  và **hai trận chung kết không trùng giờ nhau** để mọi người xem được hết.
  Đổi thứ tự trong `roundOrder` là đổi được cả lịch.
- **Vị trí trên nhánh** (`seeds`): để `[]` thì nhánh hiện "Đội 1 … Đội N" (chờ bốc thăm).
  Điền id đội theo đúng thứ tự vị trí để hiện tên thật.

- **Tránh trùng người**: 39 trong 63 người đăng ký từ 2 nội dung trở lên
  (8 người có mặt ở cả hai nội dung đôi nam nữ). Trang tự giãn lịch để
  **không ai phải đánh hai trận cùng lúc**, và mỗi người được nghỉ ít nhất
  `playerRestMinutes` phút giữa hai trận của mình.
  Ràng buộc này **chỉ có tác dụng sau khi đã bốc thăm vị trí** — trước đó trang chưa biết
  ai đánh trận nào. Vì vậy: **bốc thăm xong hãy in lịch**.
  Danh sách người đăng ký nhiều nội dung hiện ngay trong mục *Lịch thi đấu*.

Lịch hiện tại (chưa bốc thăm): 33 trận, 13:00 – 15:30.
Sau khi bốc thăm lịch sẽ giãn ra đôi chút; nếu vượt mốc `endBy` (mặc định 16:00)
trang sẽ hiện cảnh báo ngay trong mục Lịch thi đấu. Khi đó rút `slotMinutes`
hoặc đổi thứ tự `roundOrder` trong `data.js`.

Các tham số xếp lịch nằm trong `schedule` ở đầu `data.js`:
`roundRestMinutes`, `playerRestMinutes`, `endBy`; mỗi khu sân có thêm
`slotMinutes` (thời lượng một trận) và `gridMinutes` (lưới giờ hiển thị).

---

## 7. Những chỗ dữ liệu còn thiếu / cần BTC chốt

Trang đang hiển thị rõ các điểm này để không ai hiểu nhầm:

1. **Người trình bày Bài 1** mới ghi là “Đại diện Bộ phận Hành chính Tổng hợp”,
   chưa có tên cụ thể. Điền vào `talks[0].speaker` trong `data.js` khi đã chốt.
2. **Mini game**: chưa chốt nền tảng (Kahoot / Quizizz / Google Forms) và chưa có link phòng chơi.
   Điền `quizJoinUrl` trong `config.js`.
3. **Google Form đặt câu hỏi** chưa có — điền `formEmbedUrl` trong `config.js`.
4. **Địa chỉ web công khai** chưa có — điền `siteUrl` để mã QR trỏ đúng.
5. **Buổi chiều**: kế hoạch chính thức chỉ ghi “Đại hội thể thao, kế hoạch riêng,
   Ô. Tuấn Patu phụ trách”. Trang đang để **13:00 – 13:15 khai mạc, 13:15 bắt đầu thi đấu**
   (theo khung giờ trong biên bản họp).
   File `261017_Ngày hội VH - TT 2026.xlsx` (sheet *Times line*) lại ghi
   **13:25 khai mạc, 13:30 – 16:30 thi đấu tại Nhà thi đấu BV 354**.
   Nếu đó là bản chốt, sửa `venues[].start` thành `'13:30'` trong `data.js`
   và `venueName` phần chiều trong `config.js`.
6. **Pickleball đôi nam và Cầu lông đôi nam chưa chia nhóm Mạnh/Yếu** nên chưa ghép được đội.
   Pickleball đôi nam đang có 27 người đăng ký cho 24 suất.
7. **Cả hai nội dung đôi nam nữ đều dư cặp so với số suất trên nhánh:**
   - Pickleball nam nữ: bảng chia đội có **9 cặp**, nhánh đấu 8 suất.
   - Cầu lông nam nữ: bảng chia đội có **8 cặp**, bộ luật ghi thể thức **6 đội**.

   BTC cần chốt bỏ cặp nào, hoặc đổi thể thức trong `data.js`
   (ví dụ cầu lông nam nữ: `format: 'ko8'` và `teamCount: 8`).
   Nút **Bốc thăm vị trí** sẽ hỏi lại trước khi bốc ngẫu nhiên cả suất thi lẫn cặp phải nghỉ,
   và ghi rõ cặp nào nghỉ.
8. **Đôi nam nữ còn thiếu nữ:** pickleball còn 5 nam, cầu lông còn 3 nam chưa có bạn đánh.
   Nguyễn Thị Quý Thương (có mặt trong cả hai nội dung) **chưa xác nhận tham gia**.
9. **Cơ cấu giải thưởng chưa chốt** (biên bản ghi đang ở mức đề xuất).
10. **Danh sách nhảy dây** lấy từ bản chia đội trước, cần xác nhận lại.

Những mục sau trong kế hoạch **cố ý không đưa lên trang** vì đây là trang công khai
cho toàn công ty: mức bồi dưỡng diễn giả, các mục “chờ duyệt”, hạn nộp đề cương và slide,
quy ước nhắc giờ của MC, câu hỏi mồi, hoạt động dự phòng, phân công nhân sự từng tiểu ban,
và **bộ câu hỏi mẫu của mini game** (công bố trước là mất hay, nhất là nhóm câu hỏi
về chính ba bài phát biểu buổi sáng).

---

## 8. Cấu trúc file

```
index.html                  khung trang + sprite icon
assets/css/style.css        toàn bộ giao diện
assets/js/config.js         CẤU HÌNH — chỗ BTC sửa nhiều nhất
assets/js/data.js           DỮ LIỆU — chương trình, trục văn hóa, diễn giả, đội, luật
assets/js/tournament.js     sinh trận, xếp sân xếp giờ, tính đội đi tiếp
assets/js/live.js           tính "đang diễn ra" theo giờ Việt Nam
assets/img/                 nơi bỏ ảnh thật (diễn giả, ngày hội)
assets/js/app.js            dựng giao diện và hiệu ứng
assets/js/vendor-qrcode.js  thư viện tạo mã QR (MIT, Kazuhiko Arase)
.claude/launch.json         cấu hình chạy thử trong Claude Code
```

Không dùng framework, không có bước build. Sửa file, lưu, F5 là thấy.

---

## 9. Phím tắt

| Phím | Tác dụng |
|---|---|
| `Shift + B` | Mở/đóng bảng nhập kết quả của BTC |
| `Shift + Q` | Mở/đóng chế độ máy chiếu (QR cỡ lớn) |
| `Esc` | Đóng bảng đang mở |

---

## 9b. Giao diện

Giao diện dựng theo lối bố cục của các trang giải đấu thể thao điện tử:
cột biểu tượng dọc bên trái, khối mở đầu là một thẻ lớn bo góc, bảng số
cỡ đại ngay dưới, và các khối nội dung là thẻ trắng bo góc 24–32px.

Chỉ mượn **cách bố trí**. Không dùng logo, ảnh, video, phông chữ hay chữ
nghĩa của bất kỳ trang nào khác — toàn bộ hình vẽ, màu và nội dung trong
trang này là của CHP.

**Màu.** Nền trang `#f1f1f1`, thẻ trắng, chữ `#151515`. Mọi màu chữ đều đạt
chuẩn tương phản WCAG AA (≥ 4.5:1) trên cả ba nền đang dùng: `#ffffff`,
`#f1f1f1` và `#e9e9e9`. Riêng thẻ mở đầu để nền tối cho ảnh cầu nổi lên —
chữ trên đó là trắng, tương phản 18:1.

**Chữ.** `Archivo` (có trục bề rộng, đặt `font-stretch: 118–125%`) cho tiêu đề,
`Inter` cho phần đọc. Cả hai đều có bộ dấu tiếng Việt đầy đủ.
Trước khi đổi sang phông khác, hãy thử với chuỗi **“Văn hóa & Thể thao”** ở cỡ
lớn: nhiều phông xếp sai dấu chồng (ể, ẵ, ỗ). Playfair Display đã bị loại vì lỗi này.

**Thanh điều hướng.** Trên 1000px là cột dọc bên trái rộng 110px
(`--rail-w`). Dưới 1000px cột đó thành thanh ngang ở đáy màn hình, cuộn
ngang được, cao 70px (`--tabbar-h`). Hai biến này nằm ở đầu `style.css`.

**Quay lại giao diện cũ.** Bản sáng trước đó vẫn còn nguyên ở
`assets/css/style.light.css`. Đổi một dòng trong `index.html`:

```html
<link rel="stylesheet" href="assets/css/style.light.css">
```

Lưu ý: file đó chỉ là **bảng màu và kiểu chữ** của bản cũ. Bản cũ dùng thanh
ngang ở trên chứ không phải cột bên trái, nên muốn quay lại hoàn toàn thì phải
sửa cả khối `<header class="rail">` trong `index.html` thành thanh ngang —
đổi mỗi dòng `<link>` sẽ ra giao diện lai, không dùng được ngay.

Chế độ máy chiếu (`Shift + Q`) vẫn giữ nền tối để mã QR nổi khi chiếu lên tường.

---

## 10. Nguồn dữ liệu

| File | Dùng cho |
|---|---|
| `KeHoach_NgayHoiVanHoa_CHP_2026.docx` | Chủ đề, ngày giờ, địa điểm, chương trình buổi sáng, diễn giả, mini game |
| `Luat_thi_dau_Ngay_hoi_VHTT.pptx` | Toàn bộ luật thi đấu buổi chiều |
| `Chia_doi_Ngay_hoi_VHTT_2026.xlsx` | Danh sách đăng ký và chia cặp |
| `Chia_doi_Ngay_hoi_VH-TT_2026.xlsx` | Danh sách nhảy dây |
| `Bien_ban_hop_Ngay_hoi_VHTT.docx` | Khung giờ buổi chiều, tiệc tối |
