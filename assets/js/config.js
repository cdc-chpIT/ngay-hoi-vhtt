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
  doorsOpen: '08:00',                  // giờ bắt đầu đón khách
  eventDateLabel: 'Đang chốt ngày',    // chữ hiển thị khi chưa có ngày

  /* --- 2. Địa điểm ------------------------------------------------- */
  venueName: 'Hội trường Viện Hàn lâm Khoa học xã hội Việt Nam',
  venueAddress: 'Số 1 Liễu Giai, Ba Đình, Hà Nội',
  venueNote: 'Buổi sáng tại hội trường; buổi chiều chuyển sang nhà thi đấu.',
  /* Buổi chiều thi đấu ở chỗ khác, không cùng chỗ với buổi sáng */
  sportVenueName: 'Nhà thi đấu Bệnh viện 354',
  sportVenueAddress: '',
  dinnerPlace: 'Tiệc giao lưu buổi tối',

  /* --- 3. Google Form đặt câu hỏi ----------------------------------
     Cách lấy link nhúng:
       Mở Google Form -> Gửi (Send) -> chọn tab <>  -> copy giá trị src
     Dán đúng link dạng  https://docs.google.com/forms/d/e/.../viewform?embedded=true
     Để '' nếu chưa có -> trang hiện hướng dẫn thay cho form.         */
  formEmbedUrl: '',
  formOpenUrl: '',             // link rút gọn để mở form ở tab mới / in QR

  /* --- 3b. Link vào phòng mini game (Kahoot / Quizizz / Google Forms)
     Để '' thì trang chỉ hiện hướng dẫn, không hiện nút và mã QR.      */
  quizJoinUrl: '',

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
