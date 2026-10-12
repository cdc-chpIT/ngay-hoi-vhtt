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

Ngoại lệ đã được chốt: **cơ cấu giải mini game và danh sách người trúng**
thì được hiện — chủ nhà đã đồng ý công khai. Từ 12/10/2026 cơ cấu là **11
người có thưởng**: nhất 300.000đ, nhì 200.000đ, ba 100.000đ, hạng 4–11 mỗi người
50.000đ — tổng 1.000.000đ. Số nằm ở `miniGame.prizes` trong `data.js`, trang tự cộng
tổng. (Mức cũ “100.000đ mỗi câu đúng” đã bỏ.)

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

**Mục Lịch nằm NGAY DƯỚI banner** (chủ nhà chốt 12/10/2026) và xếp thành
**hai khối sáng / chiều**, mỗi khối là một lưới tự xuống dòng — **không còn kéo
ngang**. Mỗi mốc là **một dòng** (chấm · giờ · việc), không phải thẻ dựng
đứng: kiểu thẻ làm chiều cao hàng bị kéo theo ô cao nhất nên ô ngắn để lại
mảng trắng cao ngoậo. Đừng đổi về thẻ. Nghỉ trưa gộp vào buổi sáng, liên hoan tối gộp vào buổi chiều.
Lớp bọc vẫn tên `.tl-scroll` vì đó là chỗ mang dải thành phố; đổi tên là
mất cả ba lớp nền. Bộ kéo chuột và thanh ray `--run` đã xoá, đừng dựng lại.

**Dải thành phố dưới mục Lịch** là Hà Nội vẽ bằng ba lớp SVG nhúng thẳng
trong CSS (nhà gần 700×46, nhà xa 1000×72, mây 1400×26), có năm người đang
nhảy dây / đánh cầu lông / đánh pickleball ở lớp gần — người dùng đúng hai màu
mặt sân `#1d627e` và `#3f7338` của bảng sân bên dưới. **Năm người đứng gọn trên
một mảnh sân riêng ở khoảng x = 470–632**, không đè lên công trình nào — chủ
nhà chốt ngày 12/10/2026. Mảnh sân chỉ rộng 162 đơn vị nên **bỏ bớt
người nhảy dây thứ hai**; muốn thêm người thì phải dịch cần cẩu sang phải. Để có chỗ đó, **bốn khối nhà thường ở đoạn
482–654 đã bị bỏ đi có chủ đích** — đừng "sửa lại" bằng cách dựng chúng về. **Màn hẹp dùng chung
đúng ba lớp đó**, chỉ đổi `background-size` và quãng chạy (`troiPhoNho`);
trước đây điện thoại có bộ ảnh riêng nên bỏ lỡ cả màu lẫn người chơi —
đừng dựng lại bộ riêng nữa.

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
  expo.out / power4.out, có lệch nhịp. **Chạy lại mỗi lượt lướt qua** — chủ nhà
  chốt ngày 12/10/2026, trước đó là chạy một lần rồi đứng yên. Tiêu đề mục
  (`.sp-go`) và thẻ (`.reveal.in`) thu về khi đã ra HẴN khỏi khung nhìn theo
  chiều dọc, nên lướt ngược lên chúng diễn tiếp; hướng chạy đi theo chiều
  lướt (`.sp-up` / `.fx-up` = rơi từ trên xuống). **Khối mở đầu và đồng hồ
  đếm vẫn chỉ chạy một lần**: tên ngày hội kéo theo quầng sáng chạy vô hạn,
  còn chữ số đếm ngược dùng chung `data-countup` nên diễn lại là nhảy về 0.
  Chỉ xét chiều dọc: thứ nằm trong dải cuộn ngang cũng bị báo "không giao"
  khi kéo ngang, đụng vào là nhấp nháy mỗi lần kéo. Mọi hiệu ứng **bắt buộc có nhánh `prefers-reduced-motion`** chốt về
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
node tools/q12r_test.js   # 29 phép thử bộ dựng nhánh đấu
node tools/regress.js     # 12 phép thử lịch sân
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

- `siteUrl` trong `config.js` còn trống.
- **Link Zoom để công khai là chủ nhà đã biết và đồng ý** (12/10/2026).
  Đường link có sẵn `?pwd=` nên ai mở được trang là vào được phòng họp.
  Muốn chặt hơn thì để `zoomUrl = ''`, giữ `zoomId`, BTC đọc mật khẩu lúc
  bắt đầu — trang tự bỏ nút "Vào phòng Zoom".
- **Mã phòng mini game là mã của một ván chơi, không phải địa chỉ cố định.**
  `quizJoinUrl` đang là `https://wayground.com/join?gc=083047` (chủ nhà gửi
  ngày 12/10/2026). Wayground cấp mã mới mỗi lần mở phòng, nên sáng 17/10 mở
  phòng xong phải dán link mới đè vào `config.js` — không thì mã QR trên trang
  dẫn vào một ván đã đóng. Ai có link trang cũng vào phòng được từ bây giờ.
- Bài 1 chưa có tên diễn giả.
- **Ba chỗ nói khác nhau về luật tính điểm**: bảng tính nói pickleball chạm
  7 / cầu lông trần 26, artifact nói 11 / 30. Trang đang theo artifact.
- Số người nhảy dây lệch nhau: 33 đăng ký / 24 trong sheet / 30 trên trang.
- **Ba cặp pickleball không còn trường `dept`** (PB đôi nam đội 2, PB nam nữ
  đội 3 và 6). Ngày 12/10/2026 chủ nhà chốt tên năm suất trống — Nguyễn Thị
  Loan, Nguyễn Thị Nga, Đỗ Trường Thi, Nguyễn Việt Anh, Vũ Thanh Hải — nhưng
  không gửi bộ phận, nên bỏ hẳn `dept` thay vì giữ giá trị cũ của chỗ trống.
  Có bộ phận thì thêm lại.
- **`renderTeamPane()` trong `app.js` là hàm chết**: không ai gọi, `#team-pane`
  cũng không có trong `index.html`. Nó là tàn dư của một mục đã bỏ. Hiện không
  chỗ nào trên trang in bộ phận ra — đã dò cả DOM, không khớp mã bộ phận nào.
  Nên xoá hàm đó cho gọn.
- **Trọng tài và người hỗ trợ từng sân còn trống** — điền vào `referee` và
  `helper` của mỗi sân trong `data.js`. Để trống thì trang không in gì.
- Cầu lông đôi nam nữ **đội 7 chưa có bộ phận của Nguyễn Bảo Châu** — không
  có trong bảng nào nên để trống, đừng đoán.
  (Chuyện Trần Thị Xuyến đứng tên ở hai đội đã xử xong ngày 12/10/2026:
  đội 3 nay là Huỳnh Minh Nguyệt. Phép thử H trong `tools/regress.js` giờ
  PASS — **cả 12 phép thử lịch sân đều xanh**, hỏng một cái là do mình.)
- Mục Nhánh đấu vẫn dùng emoji 🥇🥈🥉 làm huy chương — trái luật ở trên,
  cần đổi sang icon SVG.
- **Dải lịch không còn in `owner` và nhãn “dự kiến”** (chủ nhà yêu cầu bỏ ngày
  12/10/2026). Hai trường đó vẫn nằm trong `data.js` cho BTC dùng, chỉ là không vẽ
  ra trang. Hệ quả: mốc “Thi đấu trên 5 sân” không còn dấu hiệu nào cho biết giờ
  đó mới là dự kiến — nếu cần báo lại thì thêm vào `desc` của mốc đó.
- Bảng giải thưởng giờ liệt kê **đủ mọi đội / mọi người đăng ký**, nhóm theo vòng bị
  loại. Chưa có kết quả thì tất cả nằm ở nhóm “Đang thi đấu” — cố ý, **không
  bịa thứ tự 5-6-7-8** vì nhánh loại trực tiếp không đẻ ra thứ tự đó.
- Ba ảnh `*_n.jpg` trong `assets/img/` chưa dùng tới.
