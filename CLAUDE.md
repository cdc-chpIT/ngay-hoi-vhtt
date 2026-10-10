# Ngày hội Văn hóa – Thể thao CHP 2026

Trang thông tin công khai cho ngày hội của CHP Group, **Thứ Bảy 17/10/2026**.
Sáng: ba bài chia sẻ văn hóa + mini game tại hội trường. Chiều: đại hội thể
thao trên 5 sân tại Nhà thi đấu Bệnh viện 354. Tối: liên hoan.

## Người dùng thật là ai

60–80 cán bộ nhân viên, **phần lớn mở trên điện thoại**, nhiều người mở từ
trình duyệt trong Zalo hoặc Facebook (bản WebView cũ, thiếu tính năng mới).
Đúng ngày hội họ dùng trang này **giữa nhà thi đấu**: tra xem sân nào đang
đánh trận gì, mấy giờ tới lượt mình, luật ra sao.

Suy ra thứ tự ưu tiên khi phải chọn:

1. **Thông tin đúng và đọc được** — sai giờ, sai tên, sai cặp đấu là hỏng việc thật.
2. **Đọc được trên điện thoại ngoài sáng** — tương phản đủ, chữ đủ lớn.
3. **Đẹp và đáng nhớ** — quan trọng, nhưng không được đổi lấy hai điều trên.

Một trang đẹp mà hôm đó ai đó tra nhầm sân là trang hỏng.

## Ràng buộc kỹ thuật — không thương lượng

- **Không có bước build.** Thẻ `<script>` cổ điển, không ES module, không
  bundler. Đẩy thẳng lên GitHub Pages (`.github/workflows/deploy-pages.yml`).
- **JavaScript viết kiểu ES5**: `var`, `function`, không arrow function,
  không template literal, không optional chaining. Lý do là WebView cũ.
- **CSS thuần**, không preprocessor, không Tailwind.
- Tính năng mới (`:has()`, `backdrop-filter`, `background-clip: text`) dùng
  được, nhưng **phải có đường lui**: trình duyệt không hỗ trợ thì vẫn đọc
  được nội dung, chỉ mất phần trang trí.

## Dữ liệu nằm ở đâu

- `assets/js/data.js` — **nguồn sự thật duy nhất**: chương trình, các nội
  dung thi đấu, bảng ghép cặp, luật, nhảy dây. Sửa nội dung thì sửa ở đây,
  đừng viết thẳng vào HTML.
- `assets/js/config.js` — thứ BTC tự sửa được mà không cần biết code: ngày
  giờ, địa điểm, link form, link QR.
- `assets/js/tournament.js` — bộ dựng nhánh đấu và xếp lịch sân.
- `assets/js/live.js` — tính "đang diễn ra", neo theo `Asia/Ho_Chi_Minh`.
- `assets/js/app.js` — toàn bộ phần dựng giao diện.
- `assets/js/motion.js` — tách chữ tiêu đề và kích hoạt chuyển động.

**Bảng ghép cặp lấy đúng theo bốn bảng BTC gửi.** Đừng tự bốc lại thứ tự.

## Không đưa lên trang công khai

Trang này ai có link cũng xem được. **Cấm** đưa lên: thù lao diễn giả, các
mốc hạn nội bộ, phân công nhân sự từng tiểu ban, khoản tài trợ, bảng việc
cần làm của BTC, bộ câu hỏi mini game, các mục còn "chờ duyệt".

Ngoại lệ đã được chốt: **mức thưởng 100.000đ mỗi câu đúng và danh sách người
trúng** thì được hiện — chủ nhà đã đồng ý công khai.

## Hệ thiết kế hiện có

**Chữ.** `--ff-d` = Archivo (biến thiên, có trục bề ngang `font-stretch`,
đủ dấu tiếng Việt) cho tiêu đề; `--ff` = Inter cho phần đọc. Độ tương phản
đến từ **bề ngang và độ đậm của Archivo**, không phải từ việc thêm font thứ
ba. Playfair Display và Lora đã thử và loại — chúng xếp dấu tiếng Việt sai.

**Màu.** Nền sáng `--bg #f1f1f1`, thẻ trắng. Các màu nhấn trong `:root` đều
đã chỉnh để đạt 4.5:1 trên nền sáng; các biến `-hi` chỉ dùng trên nền tối.

**Mỗi mục một phong cách riêng.** Đây là ý đồ có chủ đích, không phải lộn
xộn: Hỏi diễn giả có dấu hỏi kẹp hai bên; Mini game kiểu máy điện tử; Đại
hội thể thao là mặt sân cỏ (vệt cỏ cắt, vạch sân kẻ bằng CSS);
Nhánh đấu là dải neon hồng; Luật là neon hồng tím. Thêm mục mới thì cho nó
một phong cách riêng, đừng sao chép.

## Luật thiết kế

- **Mỗi khối chỉ ba màu**: một nền, một chữ, một nhấn. Nhấn dùng tiết kiệm.
- **Mọi cặp màu chữ/nền phải đạt 4.5:1.** Với chữ tô bằng dải chuyển màu
  thì phải đo **mọi điểm trên dải**, không chỉ hai đầu. Có sẵn
  `tools/contrast.py` để đo.
- **Khối mang bản sắc của mục được phép phá khuôn** — tràn mép, nghiêng,
  chồng lớp, nền tối giữa trang sáng. Phần còn lại giữ nhịp thẻ chung cho
  dễ đọc. Đừng để cả trang là một rừng thẻ bo góc giống hệt nhau.
- **Cấm**: emoji làm biểu tượng (dùng bộ icon SVG có sẵn trong sprite đầu
  `index.html`); dải chuyển màu dùng làm trang trí mặc định ở chỗ không
  mang ý nghĩa gì.
- **Chuyển động**: mỗi mục một ý riêng, không fade-up ở mọi nơi. Easing
  expo.out / power4.out, có lệch nhịp. Mỗi hiệu ứng chạy một lần rồi đứng
  yên. Mọi hiệu ứng **bắt buộc có nhánh `prefers-reduced-motion`** chốt về
  trạng thái đã hiện — thiếu là mất chữ.

## Bẫy tiếng Việt và CSS — đã trả giá, đừng dẫm lại

Những lỗi dưới đây đều **không báo lỗi**, chỉ âm thầm mất chữ.

- **Nền cắt theo nét chữ (`background-clip: text`) chỉ vẽ trong khung của
  thẻ.** Dấu thanh chồng trên dấu mũ (Ấ, Ế, Ể) nhô cao hơn khung, dấu nặng
  (Ậ, Ạ) thụt xuống dưới — phần nhô ra không có nền để hiện nên **mất sạch**,
  in ra thành "ĐÂU", "KÊT", "THÊ". Cách sửa đang dùng: biến `--ink-pad`,
  nới khung bằng `padding` rồi kéo lại bằng `margin` âm.
- **`clip-path: inset(0 …)` cắt đúng mép khung chữ** nên cũng nuốt dấu
  thanh. Mép trên và mép dưới phải để số âm.
- **`line-height` dưới 1.1 cắt dấu của chữ hoa tiếng Việt.** Đã dính ở
  `.94` và `1.02`.
- **Phép xoay 3D đặt trên chữ con của thẻ có `background-clip: text` làm
  mất trắng chữ** — nó tạo lớp vẽ mới, nền của thẻ cha không ăn sang được.
  Đặt phép xoay lên chính thẻ cha.
- **Tách tiêu đề theo ký tự làm vỡ chữ giữa từ** ("VĂN HÓA & TH / Ể THAO").
  `motion.js` tách theo **từ và theo dòng**, giữ nguyên như vậy.
- Trước khi kết luận font thiếu dấu, **hãy đo**: `canvas.measureText(ch)
  .actualBoundingBoxAscent` của "Ấ" so với "Â". Lệch nhau là font có đủ dấu,
  lỗi nằm ở CSS.

## Kiểm tra trước khi báo xong

Chạy đủ, đừng báo "xong" khi chưa chạy:

```bash
node tools/q12r_test.js   # 25 phép thử bộ dựng nhánh đấu
node tools/regress.js     # 10 phép thử lịch sân
```

Và trên trình duyệt:

- **Không lỗi console** — kiểm trên một tab mới, tab cũ còn giữ lỗi cũ trong bộ đệm.
- **Không tràn ngang** ở 1440px và 390px.
- Phần chạy theo giờ: thử đủ năm trạng thái bằng `?gio=` —
  `?gio=09:20` (sáng), `?gio=12:30`, `?gio=14:05` (chiều, 5 sân),
  `?gio=16:45` (nghỉ), `?gio=23:30` (đã xong), và không tham số (trước ngày hội).
- Đổi CSS hay JS thì **tăng số `?v=` trong `index.html`**, nếu không trình
  duyệt vẫn chạy bản cũ và bạn sẽ đuổi theo lỗi ma.

**Khung xem thử trong app tự ngắt vẽ khi cửa sổ bị che.** Lúc đó
`requestAnimationFrame`, IntersectionObserver và cuộn mượt đều đứng im —
chuyển động không chạy, tiêu đề không hiện, nút neo không nhảy. Đó là giới
hạn của khung, **không phải lỗi trang**. Chụp một ảnh màn hình để ép trang
vẽ lại rồi mới đo. `document.hidden` cho biết ngay.

## Cách làm việc

- **Việc thiết kế lớn** (dựng mục mới, đổi hẳn phong cách một mục): đề xuất
  **3 hướng khác hẳn nhau** — tên, bảng màu, ý tưởng bố cục — để chủ nhà
  chọn, rồi mới code. Việc nhỏ và việc sửa lỗi thì làm thẳng.
- **Sau khi dựng xong một mục**: chụp Playwright ở **1440px và 390px**, rồi
  **tự phê bình như giám khảo khó tính** — liệt kê 3 điểm yếu nhất về bố
  cục, chữ, chuyển động — sửa, chụp lại. Qua ít nhất một vòng rồi mới báo.
- **Nhìn tận mắt, đừng chỉ đo.** Nhiều lỗi ở trang này — mất dấu, chữ gãy
  giữa từ, chữ bị che — số đo đều sạch. Phóng to ảnh chụp mà soi.
- **Nói thật chỗ chưa chắc.** Nếu không kiểm được trong khung xem thử thì
  nói rõ là chưa kiểm được, đừng báo "đã xác nhận".
- **Không tự commit, không tự push.** Chủ nhà nói mới làm.

## Việc còn treo

- `quizJoinUrl` và `siteUrl` trong `config.js` còn trống.
- Bài 1 chưa có tên diễn giả.
- **Ba chỗ nói khác nhau về luật tính điểm**: bảng tính nói pickleball chạm
  7 / cầu lông trần 26, artifact nói 11 / 30. Trang đang theo artifact.
- Số người nhảy dây lệch nhau: 33 đăng ký / 24 trong sheet / 30 trên trang.
- **Năm suất còn ghi "tuyển thủ dự bị"**, BTC cần chốt tên trước ngày hội.
- **Trần Thị Xuyến đang đứng tên ở hai đội của cầu lông đôi nam nữ** (đội 3
  với Nguyễn Thanh Bình, đội 8 với Ngô Trung Phương, thêm ngày 10/10). Hai
  đội nằm hai nhánh nên nếu cùng thắng thì chung kết là chính người đó gặp
  mình. `tools/regress.js` có phép thử H bắt lỗi này — đang FAIL cho tới khi
  BTC chốt lại. Đội 7 cũng chưa có bộ phận của Nguyễn Bảo Châu.
- Mục Nhánh đấu vẫn dùng emoji 🥇🥈🥉 làm huy chương — trái luật ở trên,
  cần đổi sang icon SVG.
- Ba ảnh `*_n.jpg` trong `assets/img/` chưa dùng tới.
