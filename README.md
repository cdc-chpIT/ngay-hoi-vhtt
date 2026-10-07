# Web Ngày hội Văn hóa – Thể thao CHP 2026

Trang web một chiều cuộn cho **Ngày hội Văn hóa – Thể thao CHP 2026**,
Thứ Bảy **17/10/2026**, Hội trường Viện Hàn lâm Khoa học xã hội Việt Nam (số 1 Liễu Giai, Hà Nội).
Chủ đề: *Xây dựng Văn hóa CHP — Truyền thống · Tự lực · Thích ứng*.

Nội dung trên trang: ba trục văn hóa, lịch cả ngày, mini game,
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
| Lịch chương trình cả ngày | mảng `timeline` trong `assets/js/data.js` |
| Ba trục văn hóa | mảng `pillars` trong `assets/js/data.js` |
| Mini game | object `miniGame` trong `assets/js/data.js` |
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

Có ba lối vào, chọn lối nào cũng được:

- Nút **Nhập kết quả** ngay trên từng thẻ nội dung ở mục *Thể thao* — mở bảng và
  **cuộn thẳng tới nội dung đó**, nhanh nhất khi đang đứng ở sân.
- Bấm `Shift + B`.
- Nút *Bảng BTC* ở cuối trang, hoặc mở `địa-chỉ-trang/?btc=1`.

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

**Thể thức** (`format`) quyết định bộ trận:

| format | Dùng cho | Bộ trận |
|---|---|---|
| `q12r` | PB đôi nam, CL đôi nam (12 đội) | 6 vòng loại + 3 vòng vớt + 4 tứ kết + 2 bán kết + 1 chung kết = **16 trận**, thêm 1 trận tranh hạng Ba nếu `thirdPlace: true` |
| `ko8` | PB nam nữ, CL nam nữ (8 đội) | 4 tứ kết + 2 bán kết + 1 chung kết = **7 trận**, thêm tranh hạng Ba nếu bật |
| `ko12b4` | không dùng năm nay | 12 đội, 4 đội miễn vòng loại (11 trận) |
| `r6diff` | không dùng năm nay | 6 đội, 3 trận rồi lấy 2 hiệu số cao nhất (4 trận) |

Năm nay: 16 + 7 + 17 + 8 = **48 trận**, đúng bằng con số trong sơ đồ BTC gửi.

**Thể thức `q12r` chạy thế nào.** Không đội nào được miễn. Vòng loại ghép lần lượt
Đội 1–2, 3–4 … 11–12. Sáu đội thắng vào thẳng tứ kết. Sáu đội thua đấu tiếp 3 trận
vòng vớt; trong ba đội thắng vớt lấy **2 đội** theo thứ tự xét: hiệu số trận vớt →
tổng điểm ghi được → bằng cả hai thì trang **báo "cần bốc thăm"** chứ không tự chọn hộ.
Hai đội vớt được xếp vào hai nhánh khác nhau (tứ kết 1 và tứ kết 4) và trang tự đổi chỗ
hai đội đó nếu một đội rơi vào đúng đối thủ đã loại mình ở vòng loại.

**Thời lượng mỗi trận tính theo vòng**, khai trong `durations` của từng nội dung:

```js
durations: { VL: 10, VV: 10, TK: 10, BK: 16, CK: 16 }   // pickleball
durations: { mac_dinh: 15 }                             // cầu lông, mọi vòng
```

Pickleball vòng ngoài ăn điểm trực tiếp nên nhanh hơn; bán kết và chung kết đánh luật
ăn điểm theo lượt giao nên cần 16 phút. Không khai `durations` thì lấy `slotMinutes`
của khu sân.

**Sân dùng chung.** Hai sân Pickleball phục vụ **cả hai** nội dung pickleball, ba sân
Cầu lông phục vụ cả hai nội dung cầu lông — không cố định mỗi nội dung một sân. Đây là
điều kiện để chạy hết 48 trận trong 150 phút.

**Hai chung kết đá đồng thời.** Khu sân nào đặt `finalsTogether: true` thì hai trận
chung kết của khu đó xếp cùng giờ trên hai sân, để khán giả tập trung một chỗ và trao
giải luôn. Bỏ dòng đó đi thì trang quay lại xếp hai chung kết lần lượt.

**Vị trí trên nhánh** (`seeds`): đang điền theo đúng thứ tự Đội 1 … Đội N trong bảng chia
của BTC. Để `[]` thì nhánh hiện "Đội 1 … Đội N" (chờ bốc thăm). Bấm *Bốc thăm vị trí*
trong Bảng BTC để xáo lại.

**Tránh trùng người.** Nhiều người đăng ký từ 2 nội dung trở lên. Trang tự giãn lịch để
**không ai phải đánh hai trận cùng lúc**, và mỗi người được nghỉ ít nhất
`playerRestMinutes` phút giữa hai trận của mình — đang để **5 phút** theo đúng ghi chú
trong sơ đồ BTC. Ràng buộc này chỉ có tác dụng khi `seeds` đã có; trước đó trang chưa biết
ai đánh trận nào. Vì vậy: **bốc thăm xong hãy in lịch**.

**Lịch hiện tại**: Pickleball 13:40 – 16:06, Cầu lông 13:40 – 16:00. Không trùng sân,
không trùng người, không trận nào bị bỏ ngoài lịch. Nếu vượt mốc `endBy` (16:10) trang
sẽ hiện cảnh báo đỏ trong mục Lịch thi đấu; khi đó rút `durations`, giảm
`playerRestMinutes`, hoặc đổi thứ tự `roundOrder`.

Các tham số xếp lịch nằm trong `schedule` ở đầu `data.js`:
`roundRestMinutes`, `playerRestMinutes`, `endBy`; mỗi khu sân có thêm `slotMinutes`
(mặc định khi nội dung không khai `durations`), `gridMinutes` (lưới giờ) và
`roundOrder` (thứ tự ưu tiên khi hai trận cùng xếp được vào một giờ).

---

## 6b. Mục Lịch

Mục *Lịch* có một nút chuyển ở trên cùng:

- **Chương trình** — lịch cả ngày bày theo kiểu lịch: cột giờ bên trái, nội dung bên
  phải, chia theo buổi sáng / trưa / chiều / tối. Mốc đang diễn ra tự viền xanh.
  Dựng từ mảng `timeline` trong `data.js`.
- **Thể thao** — lịch thi đấu, mặc định mở ở **Lịch sân**: mỗi sân một cột, giờ chạy
  dọc, mỗi trận là một khối cao đúng bằng thời lượng của nó, nhìn phát biết sân nào
  đang trống. Còn bốn kiểu xem khác: Theo sân, Theo giờ, Theo nội dung, Nhảy dây.

Độ cao mỗi phút trên lịch sân đặt ở biến `--px` trong `.cc` (`style.css`), mặc định
2.6px một phút. Muốn lịch cao hơn cho dễ đọc thì tăng số này.

Ba mục **Chương trình**, **Diễn giả** và **Ảnh ngày hội** đã bỏ khỏi trang:
chương trình gộp vào Lịch, hai mục kia bỏ hẳn. Dữ liệu `talks` và `gallery` vẫn còn
trong `data.js` nhưng không còn chỗ nào hiển thị — xóa được nếu muốn gọn file.

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
assets/js/data.js           DỮ LIỆU — lịch chương trình, trục văn hóa, đội, luật
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

**Thanh điều hướng.** Trên 1000px là cột dọc bên trái rộng 110px — sửa ở
`--rail-w` đầu `style.css`. Dưới 1000px cột đó thành thanh ngang ở đáy màn
hình, cuộn ngang được. Chiều cao thanh dưới (`--tabbar-h`) **do JS đo** từ
chiều cao thật của thanh mỗi khi mở trang và khi xoay máy, vì nó đổi theo cỡ
chữ và vùng an toàn của máy khuyết đỉnh — chân trang và nút "Về đầu trang"
chừa chỗ theo biến này, nên đừng đặt cứng một con số.

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
| `261017_Ngày hội VH - TT 2026.xlsx` | **Nguồn chính hiện tại**: lịch trình cả ngày (sheet *Times line*), bảng chia đội 4 nội dung (sheet *DS Đội Thi Đấu (2026)*), danh sách đăng ký kèm bộ phận (sheet *DS ĐK Thi Đấu*), tổ trọng tài |
| Sơ đồ thi đấu BTC gửi (bản web) | Thể thức `q12r`, số trận từng nội dung, thời lượng theo vòng, sân dùng chung, giờ 13:40–16:10, hai chung kết pickleball đá đồng thời |

### Ba chỗ các nguồn lệch nhau

Ghi lại để BTC biết trang đang lấy theo cái nào:

1. **Môn thi đấu.** File có cả một bộ sheet **bóng bàn** (*IN Bóng bàn*, *Lịch thi đấu
   Bóng Bàn (IN)*) lẫn bộ **pickleball**. Trang lấy bộ pickleball + cầu lông, vì
   khớp cả bản đăng ký (cột đăng ký không có mục bóng bàn) lẫn sơ đồ BTC gửi; sheet
   *IN Bóng bàn (Đơn Nam)* còn đang lỗi `#REF!` nên là bản của kỳ trước.
2. **Cách tính điểm.** Sheet ghi pickleball chạm 7 (trần 11) và cầu lông trần 26.
   Sơ đồ BTC gửi ghi pickleball chạm 11 và cầu lông trần 30 theo luật BWF.
   Trang lấy theo sơ đồ. **Nếu sheet mới là đúng thì nói, sửa `targetScore` và mục Luật.**
3. **Nhảy dây.** Bản đăng ký có 33 người tick, sheet *DS Nhảy dây* liệt kê 24 người,
   danh sách đang chạy trên trang có 30. Trang giữ nguyên 30 và ghi chú cảnh báo
   ngay trong mục Thể thao — chưa tự sửa vì thiếu thông tin nam/nữ để chia lượt.
