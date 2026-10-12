/* =====================================================================
   CẤU HÌNH NHANH — BTC chỉ cần sửa file này
   ---------------------------------------------------------------------
   Mọi thứ trong file này đều có thể sửa mà không cần biết lập trình.
   ===================================================================== */

var SITE_CONFIG = {

  /* --- 1. Ngày diễn ra sự kiện ------------------------------------
     Định dạng: 'YYYY-MM-DDTHH:mm'  (giờ Việt Nam)
     Để null nếu chưa chốt ngày -> trang sẽ ẩn phần đếm ngược.
     BIÊN BẢN HỌP KHÔNG GHI NGÀY SỰ KIỆN (06/10/2026 là ngày họp),
     nên mục này đang để trống, BTC điền vào khi đã chốt.            */
  eventDate: '2026-10-17T08:30',       // Thứ Bảy 17/10/2026, theo kế hoạch BTC
  doorsOpen: '08:30',                  // giờ mở cửa đón khách
  dayEnd:    '17:00',                  // giờ khép lại ngày hội
  eventDateLabel: 'Đang chốt ngày',    // chữ hiển thị khi chưa có ngày

  /* --- 2. Địa điểm ------------------------------------------------- */
  venueName: 'Hội trường Viện Hàn lâm Khoa học xã hội Việt Nam',
  venueAddress: 'Số 1 Phố Liễu Giai, Ngọc Hà, Hà Nội',
  venueNote: 'Buổi sáng tại hội trường; buổi chiều chuyển sang nhà thi đấu.',
  venueHours: '08:30 – 11:25',       // khủng giờ phần văn hóa
  /* Link bản đồ: dùng dạng tìm kiếm chứ không dùng mã địa điểm — dạng này
     luôn mở được trên mọi máy, đổi địa chỉ ở trên thì sửa luôn đoạn query. */
  venueMapUrl: 'https://www.google.com/maps/search/?api=1&query=Vi%E1%BB%87n%20H%C3%A0n%20l%C3%A2m%20Khoa%20h%E1%BB%8Dc%20x%C3%A3%20h%E1%BB%99i%20Vi%E1%BB%87t%20Nam%2C%20s%E1%BB%91%201%20Ph%E1%BB%91%20Li%E1%BB%85u%20Giai%2C%20Ng%E1%BB%8Dc%20H%C3%A0%2C%20H%C3%A0%20N%E1%BB%99i',

  /* --- Ảnh nền khối mở đầu -------------------------------------------
     Bỏ ảnh vào assets/img/ rồi khai ở đây. Nhiều ảnh thì trang tự chạy
     mờ chuyển qua lại. Để mảng rỗng thì quay về tranh vẽ cầu dây văng. */
  heroPhotos: [
    'assets/img/ngay-hoi-2025.jpg',
    'assets/img/hop-mat.jpg'
  ],
  heroPhotoSeconds: 9,         // bao lâu thì đổi sang ảnh kế tiếp

  /* Buổi chiều thi đấu ở chỗ khác, không cùng chỗ với buổi sáng */
  sportVenueName: 'Nhà thi đấu Bệnh viện Quân y 354',
  sportHours: '13:30 – 16:30',        // khung giờ in trên dải tối mục Thể thao
  sportVenueAddress: '120 Phố Đốc Ngữ, Ngọc Hà, Hà Nội',
  sportVenueMapUrl: 'https://www.google.com/maps/search/?api=1&query=Nh%C3%A0%20thi%20%C4%91%E1%BA%A5u%20B%E1%BB%87nh%20vi%E1%BB%87n%20Qu%C3%A2n%20y%20354%2C%20120%20Ph%E1%BB%91%20%C4%90%E1%BB%91c%20Ng%E1%BB%AF%2C%20Ng%E1%BB%8Dc%20H%C3%A0%2C%20H%C3%A0%20N%E1%BB%99i',
  dinnerPlace: 'Tiệc giao lưu buổi tối',

  /* --- 3. Google Form đặt câu hỏi ----------------------------------
     Cách lấy link nhúng:
       Mở Google Form -> Gửi (Send) -> chọn tab <>  -> copy giá trị src
     Dán đúng link dạng  https://docs.google.com/forms/d/e/.../viewform?embedded=true
     Để '' nếu chưa có -> trang hiện hướng dẫn thay cho form.         */
  formEmbedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdJS3QGCS6hvi5JxPLerN2XFWkie4sTTPi-S4JuwnqwPcBCqQ/viewform?embedded=true',
  formOpenUrl: 'https://forms.gle/RWESNtXvSpQERPqs8',   // link rút gọn để mở form ở tab mới / in QR

  /* --- 3b. Link vào phòng mini game (Wayground / Quizizz / Kahoot)
     Điền vào đây thì mục Mini game hiện mã QR, nút phóng to và nút vào
     phòng chơi. Để '' thì chỗ mã QR chỉ ghi "BTC chiếu mã lên màn hình".

     LƯU Ý: đoạn ?gc=... là MÃ CỦA MỘT VÁN CHƠI, không phải địa chỉ cố định.
     Wayground cấp mã mới mỗi lần mở phòng, nên sáng 17/10 BTC mở phòng xong
     thì copy link mới dán đè vào đây — mã QR trên trang tự đổi theo.      */
  quizJoinUrl: 'https://wayground.com/join?gc=083047',

  /* --- 3c. Phòng Zoom cho phần văn hóa -----------------------------
     Để '' thì mục Văn hóa không hiện khối Zoom.

     LƯU Ý: đường link dưới đã gài sẵn mật khẩu trong đoạn ?pwd=, mà trang
     này ai có link cũng xem được — tức là ai cũng vào được phòng họp.
     Muốn chặt hơn thì để zoomUrl = '' và chỉ giữ zoomId, BTC đọc mật khẩu
     lúc bắt đầu.                                                        */
  zoomUrl:  'https://us06web.zoom.us/j/99067690239?pwd=MjlBMnYvTUI2OVlldm9TdGVCUG9iZz09',
  zoomId:   '990 6769 0239',
  zoomCode: '666999',

  /* --- 4. Link công khai của trang này (dùng để tạo mã QR) ---------
     Để '' thì trang tự lấy địa chỉ hiện tại trên thanh URL.          */
  siteUrl: '',

  /* --- 5. Cập nhật kết quả trực tiếp (không bắt buộc) --------------
     Cách dùng:
       1. Mở Google Sheets, tạo 1 sheet với đúng 3 cột, dòng đầu là tiêu đề:
            match_id | score_a | score_b
          (match_id hiện ngay trên thẻ trận ở mục Lịch thi đấu, vd pb-mix-TK-1)
       2. Chia sẻ sheet: Bất kỳ ai có đường liên kết -> Người xem.
       3. Dán link dạng sau vào resultsCsvUrl (cập nhật gần như tức thì):
            https://docs.google.com/spreadsheets/d/<ID_SHEET>/gviz/tq?tqx=out:csv&sheet=<tên_sheet>
          <ID_SHEET> là đoạn giữa /d/ và /edit trên thanh địa chỉ.

     Cũng dùng được link "Xuất bản lên web -> CSV", nhưng Google chỉ làm mới
     bản xuất bản sau vài phút nên kết quả hiện chậm hơn.

     Trang sẽ tự tải lại kết quả mỗi `pollSeconds` giây,
     điện thoại của mọi người đều thấy kết quả mới.                  */
  resultsCsvUrl: '',
  pollSeconds: 30,

  /* --- 6. Bảng điều khiển của BTC ----------------------------------
     Mở trang với ?btc=1 (hoặc bấm Shift+B) để nhập điểm ngay trên trang.
     Điểm nhập ở đây CHỈ lưu trên máy đang dùng (dành cho máy chiếu /
     máy của thư ký), sau đó bấm "Xuất CSV" để dán lên Google Sheets.  */
  adminHint: 'Thêm ?btc=1 vào cuối địa chỉ để mở bảng nhập điểm',

  /* --- 7. Xem thử phần "Đang diễn ra" ------------------------------
     Thêm ?gio=09:20 vào cuối địa chỉ để xem trang như lúc 9h20 ngày hội.
     Dùng để BTC thử trước, không ảnh hưởng gì tới ngày thật.          */
  previewParam: 'gio'
};
