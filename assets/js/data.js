/* =====================================================================
   DỮ LIỆU NGÀY HỘI VĂN HÓA – THỂ THAO CHP 2026
   ---------------------------------------------------------------------
   Nguồn:
     - KeHoach_NgayHoiVanHoa_CHP_2026.docx    (kế hoạch chính thức, 28/08/2026)
     - Luat_thi_dau_Ngay_hoi_VHTT.pptx        (bộ luật thi đấu buổi chiều)
     - Chia_doi_Ngay_hoi_VHTT_2026.xlsx       (danh sách & chia cặp)
     - Chia_doi_Ngay_hoi_VH-TT_2026.xlsx      (bản trước, lấy phần nhảy dây)
     - Bien_ban_hop_Ngay_hoi_VHTT.docx        (biên bản họp 06/10/2026)

   Khi có số liệu mới: sửa trong file này, trang web tự cập nhật.
   ===================================================================== */

var VHTT_DATA = {

  /* ================== GIỚI THIỆU ================== */
  intro: {
    org: 'CHP Group',
    title: 'Ngày hội Văn hóa – Thể thao',
    year: '2026',
    theme: 'Xây dựng Văn hóa CHP',
    pillarLine: 'Truyền thống · Tự lực · Thích ứng',
    message: 'Truyền thống là nền tảng — Tự lực là mục tiêu — Thích ứng là phương thức',
    tagline: 'Một ngày để nghe nhau, chơi cùng nhau và cổ vũ hết mình.',
    summary:
      'Buổi sáng là phần Văn hóa với ba bài chia sẻ và mini game. ' +
      'Buổi chiều là Đại hội thể thao trên 5 sân. Buổi tối cả nhà cùng ăn.',
    members: ['CKJVN', 'HPEC', 'HPTC', 'UHRI Hub'],
    audience: 'Ban Giám đốc, Giám đốc các khối bộ phận và CBNV CHP Group ' +
              'tại Hà Nội và TP. Hồ Chí Minh',
    stats: [
      { text: '3',       label: 'trục văn hóa' },
      { text: '60–80',   label: 'người dự' },
      { value: 'matches', label: 'trận thể thao' },
      { value: 'courts',  label: 'sân song song' }
    ]
  },

  /* ================== BA TRỤC VĂN HÓA ================== */
  pillars: [
    {
      key: 'truyenthong',
      name: 'Truyền thống',
      role: 'là nền tảng',
      short: 'Chúng ta đứng trên nền móng nào',
      body: 'Những gì CHP đang có hôm nay không tự nhiên mà có. ' +
            'Trước khi nói về công nghệ và tương lai, hãy nhớ chúng ta đứng trên nền móng nào.'
    },
    {
      key: 'tuluc',
      name: 'Tự lực',
      role: 'là mục tiêu',
      short: 'Tự quyết và chịu trách nhiệm đến cùng',
      body: 'Tự lực không phải là khẩu hiệu trên slide, mà là điều diễn ra hằng ngày ở công trường: ' +
            'tự quyết, tự xoay xở và chịu trách nhiệm đến cùng.'
    },
    {
      key: 'thichung',
      name: 'Thích ứng',
      role: 'là phương thức',
      short: 'Học nhanh hơn tốc độ thay đổi',
      body: 'Thích ứng không phải là chạy theo công nghệ, mà là giữ được khả năng học nhanh hơn ' +
            'tốc độ thay đổi. AI là công cụ để người CHP làm chủ, không phải thứ thay thế con người.'
    }
  ],

  /* ================== BA BÀI CHIA SẺ ==================
     Dàn ý chi tiết là gợi ý của BTC, diễn giả chủ động điều chỉnh,
     nên trang chỉ hiện phần giới thiệu ngắn.                          */
  talks: [
    {
      no: 1,
      pillar: 'truyenthong',
      name: 'Văn hóa truyền thống CHP',
      altTitle: 'Mười lăm năm một chữ TIN',
      speaker: 'Đại diện Bộ phận Hành chính Tổng hợp',
      speakerNote: 'BTC đang chốt người trình bày',
      minutes: 20,
      qa: 5,
      teaser: 'Hơn một thập kỷ đồng hành: HPEC 15 năm, CKJVN 11 năm. ' +
              'Triết lý “We value trust”, những cam kết công ty đã giữ với người lao động, ' +
              'và DNA C – H – P: Chuyên nghiệp – Hạnh phúc – Phong cách.'
    },
    {
      no: 2,
      pillar: 'tuluc',
      name: 'Văn hóa tự lực',
      altTitle: 'Tự lực – chuyện kể từ công trường Đại Ngãi',
      speaker: 'Ô. Nguyễn Hậu Cần và Ô. Nguyễn Khắc Cường',
      speakerRole: 'Bộ phận Quản lý dự án (PMD)',
      speakerNote: 'Vừa hoàn thành nhiệm vụ tại công trường cầu Đại Ngãi và về trình bày trực tiếp',
      minutes: 20,
      qa: 5,
      teaser: 'Một ngày ở công trường Đại Ngãi: tự lực nghĩa là gì khi cách văn phòng hàng trăm cây số, ' +
              'tình huống khó nhất đã gặp và cách đội xử lý, cùng lời nhắn cho các kỹ sư trẻ sắp ra công trường.'
    },
    {
      no: 3,
      pillar: 'thichung',
      name: 'Văn hóa thích ứng: Thời đại AI',
      altTitle: 'Thích ứng để làm chủ: người CHP trong thời đại AI',
      speaker: 'Ô. Nguyễn Trường Lâm',
      speakerRole: 'Giám đốc Trung tâm Quản trị Dữ liệu (CDC)',
      minutes: 20,
      qa: 5,
      teaser: 'Một năm CHP ứng dụng AI: làm được gì, tiết kiệm bao nhiêu thời gian, và cả những việc ' +
              'AI làm chưa tốt. Từ “biết dùng AI” đến “dùng AI có kỷ luật”, và vì sao dữ liệu sạch là điều kiện.'
    }
  ],

  /* ================== CHƯƠNG TRÌNH ==================
     start/end : giờ bắt đầu và kết thúc, dùng cho phần "Đang diễn ra"
     fixed     : true = đã chốt trong kế hoạch; false = dự kiến
     derive    : để trang tự tính giờ từ lịch thi đấu                  */
  timeline: [
    { start: '08:00', end: '08:30', fixed: true, part: 'morning', icon: 'door',
      title: 'Đón khách & check-in',
      desc: 'Nhận số báo danh và quà lưu niệm, chụp ảnh ở backdrop sự kiện, quét mã QR để mở trang này.',
      owner: 'Tiểu ban Hậu cần' },

    { start: '08:30', end: '08:35', fixed: true, part: 'morning', icon: 'mic',
      title: 'Ổn định tổ chức',
      desc: 'MC tuyên bố lý do, giới thiệu đại biểu và chủ đề văn hóa của năm.',
      owner: 'MC' },

    { start: '08:35', end: '08:50', fixed: true, part: 'morning', icon: 'flag',
      title: 'Khai mạc: Định hướng Văn hóa CHP 2026',
      desc: 'Ban lãnh đạo mở đầu ngày hội và xác lập ba trục văn hóa của năm.',
      owner: 'Tổng Giám đốc' },

    { start: '08:50', end: '09:15', fixed: true, part: 'morning', icon: 'talk',
      title: 'Bài 1 — Văn hóa truyền thống CHP',
      desc: '20 phút trình bày và 5 phút hỏi đáp.',
      owner: 'Đại diện Bộ phận Hành chính Tổng hợp',
      talk: 1, tag: 'Hỏi đáp 5 phút cuối' },

    { start: '09:15', end: '09:40', fixed: true, part: 'morning', icon: 'talk',
      title: 'Bài 2 — Văn hóa tự lực',
      desc: '20 phút trình bày và 5 phút hỏi đáp. Chuyện kể từ công trường cầu Đại Ngãi.',
      owner: 'Ô. Nguyễn Hậu Cần và Ô. Nguyễn Khắc Cường (PMD)',
      talk: 2, tag: 'Hỏi đáp 5 phút cuối' },

    { start: '09:40', end: '10:00', fixed: true, part: 'break', icon: 'rest',
      title: 'Giải lao – teabreak',
      desc: 'Nghỉ giữa giờ và chụp ảnh theo bộ phận.',
      owner: 'Tiểu ban Hậu cần' },

    { start: '10:00', end: '10:25', fixed: true, part: 'morning', icon: 'talk',
      title: 'Bài 3 — Văn hóa thích ứng: Thời đại AI',
      desc: '20 phút trình bày và 5 phút hỏi đáp.',
      owner: 'Ô. Nguyễn Trường Lâm — Giám đốc CDC',
      talk: 3, tag: 'Hỏi đáp 5 phút cuối' },

    { start: '10:25', end: '10:55', fixed: true, part: 'morning', icon: 'game',
      title: 'Mini game trắc nghiệm nhanh',
      desc: 'Cả hội trường cùng chơi trên điện thoại, bảng xếp hạng hiện trực tiếp trên màn hình.',
      owner: 'MC và Tiểu ban Nội dung', tag: '30 phút' },

    { start: '10:55', end: '11:05', fixed: true, part: 'morning', icon: 'medal',
      title: 'Công bố kết quả & trao giải mini game',
      desc: 'Trao giải cá nhân ngay tại chỗ cho những người dẫn đầu bảng xếp hạng.',
      owner: 'Ban Giám đốc và MC' },

    { start: '11:05', end: '11:20', fixed: true, part: 'morning', icon: 'flag',
      title: 'Tổng kết & bế mạc buổi sáng',
      desc: 'Ban lãnh đạo chốt lại mạch Truyền thống → Tự lực → Thích ứng của ngày hội.',
      owner: 'Ban Giám đốc' },

    { start: '11:20', end: '11:30', fixed: true, part: 'morning', icon: 'camera',
      title: 'Chụp ảnh tập thể',
      desc: 'Cả nhà tập trung chụp ảnh lưu niệm, khép lại chương trình buổi sáng đúng 11h30.',
      owner: 'Tiểu ban Truyền thông' },

    { start: '11:30', end: '13:00', fixed: false, part: 'break', icon: 'rest',
      title: 'Nghỉ trưa',
      desc: 'Ăn trưa, nghỉ ngơi và khởi động trước khi vào phần thể thao buổi chiều.' },

    { start: '13:00', end: '13:15', fixed: false, part: 'sport', icon: 'ball',
      title: 'Khai mạc Đại hội thể thao',
      desc: 'Phổ biến thể thức, giải thưởng, điểm danh các đội rồi bắt đầu thi đấu trên 5 sân.',
      owner: 'Ô. Tuấn Patu phụ trách' },

    { start: '13:30', end: '14:30', fixed: false, part: 'sport', icon: 'rope',
      title: 'Nhảy dây 1 phút',
      desc: 'Thi theo lượt tại khu nhảy dây, xếp hạng riêng nam và nữ.' },

    { derive: 'firstFinal', fixed: false, part: 'sport', icon: 'trophy',
      title: 'Các trận chung kết',
      desc: 'Hai chung kết pickleball ở khu pickleball, hai chung kết cầu lông ở khu cầu lông. ' +
            'Trong mỗi khu, hai trận xếp lần lượt để mọi người xem được cả hai.' },

    { derive: 'awards', fixed: false, part: 'sport', icon: 'medal',
      title: 'Tổng hợp kết quả & trao giải',
      desc: 'Trao huy chương, cúp cho các nội dung thể thao và chụp ảnh lưu niệm.' },

    { start: '17:30', end: '18:00', fixed: true, part: 'night', icon: 'dinner',
      title: 'Tiệc giao lưu buổi tối',
      desc: 'Cả nhà cùng ăn và tổng kết ngày hội theo thông lệ hằng năm.' }
  ],

  /* ================== MINI GAME ================== */
  miniGame: {
    name: 'Mini game trắc nghiệm nhanh',
    platform: 'Kahoot / Quizizz / Google Forms',
    minutes: 30,
    awardMinutes: 10,
    questions: '10 – 20 câu, mỗi câu 15 – 20 giây',
    how: [
      'Quét mã QR trên màn hình để vào phòng chơi.',
      'Đăng nhập bằng họ tên và bộ phận của mình.',
      'Điểm tính theo cả độ chính xác lẫn tốc độ trả lời.',
      'Bảng xếp hạng hiện trực tiếp trên màn hình hội trường.'
    ],
    topics: [
      { name: 'Lịch sử CHP',        desc: 'HPEC, CKJVN và các mốc thành lập' },
      { name: 'Tầm nhìn & giá trị', desc: 'Sứ mệnh, giá trị cốt lõi, DNA C – H – P' },
      { name: 'Dự án tiêu biểu',    desc: 'Đại Ngãi, Trần Hưng Đạo, cầu cảnh quan, UHRI Hub, CDC' },
      { name: 'Ba bài sáng nay',    desc: 'Nội dung ba bài phát biểu vừa nghe' }
    ],
    prizes: '01 giải Nhất, 01 giải Nhì, 01 giải Ba và các giải khuyến khích',
    prizeNote: 'Mức giải thưởng đang trình Ban lãnh đạo duyệt.'
  },

  /* ================== ẢNH NGÀY HỘI ==================
     Thêm ảnh: { src: 'assets/img/ten-anh.jpg', caption: 'Chú thích' }
     Để trống thì trang hiện khung chờ ảnh.                            */
  gallery: [],

  /* ================== PHẦN VĂN HÓA ================== */
  culture: {
    howToAsk: [
      'Nghe xong bài chia sẻ, giơ tay để hỏi trực tiếp trong 5 phút hỏi đáp.',
      'Hoặc quét mã QR, mở trang này và gửi câu hỏi qua form.',
      'Câu hỏi gửi qua form sẽ được MC đọc lên trong phần hỏi đáp.',
      'Có thể gửi câu hỏi ngay trong lúc diễn giả đang trình bày.',
      'BTC có quà nhỏ tặng tại chỗ cho người đặt câu hỏi.'
    ]
  },

  /* ================== THAM SỐ XẾP LỊCH ==================
     roundRestMinutes : nghỉ tối thiểu giữa trận trước và trận sau của cùng nhánh
     playerRestMinutes: nghỉ tối thiểu cho một người giữa hai trận của họ.
                        Rất nhiều người đăng ký 2–4 nội dung nên tham số này
                        giữ cho không ai phải đánh hai trận cùng lúc.
                        Chỉ có tác dụng sau khi đã bốc thăm vị trí (seeds).   */
  schedule: {
    roundRestMinutes: 1,
    playerRestMinutes: 10,
    endBy: '16:00'          /* mốc phải xong phần thi đấu; quá thì trang báo đỏ */
  },

  /* ================== SÂN & KHU THI ĐẤU ================== */
  venues: [
    {
      id: 'pb',
      name: 'Khu Pickleball',
      sport: 'pickleball',
      slotMinutes: 15,
      gridMinutes: 5,
      start: '13:15',
      courts: [
        { id: 'PB1', name: 'Sân Pickleball 1', short: 'PB 1' },
        { id: 'PB2', name: 'Sân Pickleball 2', short: 'PB 2' }
      ],
      /* Thứ tự các vòng được xếp lên sân. Đổi thứ tự ở đây là đổi lịch. */
      roundOrder: [
        ['pb-nam', 'VL'],
        ['pb-mix', 'TK'],
        ['pb-nam', 'TK'],
        ['pb-mix', 'BK'],
        ['pb-nam', 'BK'],
        ['pb-mix', 'CK'],
        ['pb-nam', 'CK']
      ]
    },
    {
      id: 'cl',
      name: 'Khu Cầu lông',
      sport: 'cầu lông',
      slotMinutes: 20,
      gridMinutes: 5,
      start: '13:15',
      courts: [
        { id: 'CL1', name: 'Sân Cầu lông 1', short: 'CL 1' },
        { id: 'CL2', name: 'Sân Cầu lông 2', short: 'CL 2' },
        { id: 'CL3', name: 'Sân Cầu lông 3', short: 'CL 3' }
      ],
      roundOrder: [
        ['cl-nam', 'VL'],
        ['cl-mix', 'R1'],
        ['cl-nam', 'TK'],
        ['cl-mix', 'CK'],
        ['cl-nam', 'BK'],
        ['cl-nam', 'CK']
      ]
    }
  ],

  /* ================== CÁC NỘI DUNG THI ĐẤU ==================
     format:
       'ko12b4' = 12 đội, 4 đội được miễn vòng loại (vào thẳng tứ kết)
       'ko8'    = 8 đội, loại trực tiếp từ tứ kết
       'r6diff' = 6 đội, 3 trận vòng đầu, 2 đội thắng có hiệu số cao nhất
                  vào chung kết, đội thắng còn lại hạng ba
     seeds:
       Vị trí trên nhánh đấu được xác định bằng bốc thăm.
       Để [] -> nhánh hiện "Chờ bốc thăm".
       Khi bốc xong: điền id đội theo đúng thứ tự vị trí 1, 2, 3...
       ví dụ seeds: [3, 7, 1, 5, 2, 8, 4, 6]
     targetScore: điểm chạm để thắng 1 hiệp (BO1)                     */
  events: [

    /* ---------- PICKLEBALL ĐÔI NAM ---------- */
    {
      id: 'pb-nam',
      name: 'Pickleball đôi nam',
      short: 'PB đôi nam',
      sport: 'pickleball',
      venueId: 'pb',
      format: 'ko12b4',
      teamCount: 12,
      targetScore: 11,
      scoring: 'Vòng loại ăn điểm trực tiếp. Từ tứ kết tính điểm theo lượt giao.',
      drawRule: '24 vận động viên chia 2 nhóm (12 Mạnh / 12 Yếu), bốc ngẫu nhiên ' +
                'mỗi nhóm 1 người ghép thành 1 đội cân sức.',
      status: 'pending-draw',
      statusNote: 'Chưa chia nhóm Mạnh/Yếu nên chưa ghép được đội. ' +
                  'Danh sách đăng ký đang có 27 người cho 24 suất.',
      teams: [],
      seeds: [],
      players: [
        { no: 1,  name: 'Hồ Thái Hùng',          dept: 'BGĐ'  },
        { no: 2,  name: 'Nguyễn Đức Thắng',      dept: 'A&I'  },
        { no: 3,  name: 'Nguyễn Khắc Cường',     dept: 'A&I'  },
        { no: 4,  name: 'Phan Thành Trung',      dept: 'A&I'  },
        { no: 5,  name: 'Vũ Đức Mạnh',           dept: 'A&I'  },
        { no: 6,  name: 'Phạm Tiến Dũng',        dept: 'ADM'  },
        { no: 7,  name: 'Nguyễn Quốc Tuấn',      dept: 'CHPS' },
        { no: 8,  name: 'Vũ Minh Đức',           dept: 'GMD'  },
        { no: 9,  name: 'Nguyễn Huy Bình',       dept: 'IBIM' },
        { no: 10, name: 'Đoàn Bảo Quốc',         dept: 'IBIM' },
        { no: 11, name: 'Trần Quảng Toản',       dept: 'IBIM' },
        { no: 12, name: 'Nguyễn Hậu Cần',        dept: 'IBIM' },
        { no: 13, name: 'Phạm Trung Đức',        dept: 'IBIM' },
        { no: 14, name: 'Nguyễn Tất Quý Bình',   dept: 'PMD'  },
        { no: 15, name: 'Nguyễn Sách Hưng',      dept: 'PMD'  },
        { no: 16, name: 'Hoàng Nghĩa Quang',     dept: 'SRI'  },
        { no: 17, name: 'Cấn Huy Hoàng',         dept: 'SRI'  },
        { no: 18, name: 'Kiều Bá Quyên',         dept: 'SRI'  },
        { no: 19, name: 'Trần Thế Anh',          dept: 'SRI'  },
        { no: 20, name: 'Nguyễn Văn Duy',        dept: 'SRI'  },
        { no: 21, name: 'Nguyễn Ngọc Tuấn',      dept: 'TED'  },
        { no: 22, name: 'Ngô Tấn Sơn',           dept: 'TED'  },
        { no: 23, name: 'Ngô Trung Phương',      dept: 'UHRI' },
        { no: 24, name: 'Nguyễn Tuyển Việt',     dept: 'UHRI' },
        { no: 25, name: 'Trần Việt Hùng',        dept: 'UHRI', note: 'Chưa xác nhận' },
        { no: 26, name: 'Nguyễn Huy Hoàng',      dept: 'VPĐD' },
        { no: 27, name: 'Tuyển thủ nam 3',       dept: 'VPĐD', note: 'Chờ xác định' }
      ]
    },

    /* ---------- PICKLEBALL ĐÔI NAM NỮ ---------- */
    {
      id: 'pb-mix',
      name: 'Pickleball đôi nam nữ',
      short: 'PB nam nữ',
      sport: 'pickleball',
      venueId: 'pb',
      format: 'ko8',
      teamCount: 8,
      targetScore: 11,
      scoring: 'Tính điểm theo lượt giao, đánh 1 hiệp chạm 11 điểm.',
      drawRule: 'Các cặp nam nữ được bốc thăm ngẫu nhiên, không đổi đồng đội sau khi bốc.',
      status: 'needs-decision',
      statusNote: 'Bảng chia đội đã ghép được 9 cặp, nhưng nhánh đấu chỉ có 8 suất. ' +
                  'BTC cần chốt bỏ 1 cặp, hoặc cho 1 cặp miễn vòng đầu.',
      teams: [
        { id: 1, p1: 'Tuyển thủ nam 1',      p2: 'Tuyển thủ nữ 2',         dept: 'VPĐD' },
        { id: 2, p1: 'Tuyển thủ nam 2',      p2: 'Tuyển thủ nữ 1',         dept: 'VPĐD' },
        { id: 3, p1: 'Nguyễn Đức Thắng',     p2: 'Nguyễn Thị Thanh Hoa',   dept: 'A&I · ADM' },
        { id: 4, p1: 'Phạm Trung Đức',       p2: 'Nguyễn Quỳnh Trang',     dept: 'IBIM · BGĐ' },
        { id: 5, p1: 'Nguyễn Tất Quý Bình',  p2: 'Mai Lệ Hằng',            dept: 'PMD · HPTC' },
        { id: 6, p1: 'Trần Mạnh Cường',      p2: 'Hà Thị Nga',             dept: 'GMD' },
        { id: 7, p1: 'Ngô Tấn Sơn',          p2: 'Trương Xuân Phương',     dept: 'TED · CDC' },
        { id: 8, p1: 'Hồ Thái Hùng',         p2: 'Bùi Thị Trâm',           dept: 'BGĐ · FIN' },
        { id: 9, p1: 'Hà Quang Đạt',         p2: 'Nguyễn Thị Quý Thương',  dept: 'SRI · GMD',
          note: 'Nguyễn Thị Quý Thương chưa xác nhận tham gia' }
      ],
      seeds: [],
      waiting: {
        label: 'Nam đã đăng ký nhưng chưa có bạn đánh',
        names: ['Nguyễn Ngọc Tuấn', 'Nguyễn Khắc Cường', 'Nguyễn Huy Bình',
                'Ngô Trung Phương', 'Nguyễn Quốc Tuấn']
      }
    },

    /* ---------- CẦU LÔNG ĐÔI NAM ---------- */
    {
      id: 'cl-nam',
      name: 'Cầu lông đôi nam',
      short: 'CL đôi nam',
      sport: 'cầu lông',
      venueId: 'cl',
      format: 'ko12b4',
      teamCount: 12,
      targetScore: 21,
      scoring: 'Đánh 1 hiệp đến 21 điểm, thắng pha cầu nào được điểm pha đó.',
      drawRule: '24 vận động viên chia 2 nhóm (12 Mạnh / 12 Yếu), bốc ngẫu nhiên ' +
                'mỗi nhóm 1 người ghép thành 1 đội cân sức.',
      status: 'pending-draw',
      statusNote: 'Chưa chia nhóm Mạnh/Yếu nên chưa ghép được đội. ' +
                  'Danh sách đăng ký đang có đúng 24 người.',
      teams: [],
      seeds: [],
      players: [
        { no: 1,  name: 'Nguyễn Đức Thắng',    dept: 'A&I'  },
        { no: 2,  name: 'Nguyễn Khắc Cường',   dept: 'A&I'  },
        { no: 3,  name: 'Hoàng Quốc Đại',      dept: 'A&I'  },
        { no: 4,  name: 'Phạm Tiến Dũng',      dept: 'ADM'  },
        { no: 5,  name: 'Nguyễn Trường Lâm',   dept: 'CDC'  },
        { no: 6,  name: 'Đặng Minh Hưng',      dept: 'CHPS' },
        { no: 7,  name: 'Nguyễn Quốc Tuấn',    dept: 'CHPS' },
        { no: 8,  name: 'Trần Mạnh Cường',     dept: 'GMD'  },
        { no: 9,  name: 'Nguyễn Văn Tình',     dept: 'HPTC' },
        { no: 10, name: 'Nguyễn Sơn Tùng',     dept: 'PMD'  },
        { no: 11, name: 'Nguyễn Tất Quý Bình', dept: 'PMD'  },
        { no: 12, name: 'Nguyễn Sách Hưng',    dept: 'PMD'  },
        { no: 13, name: 'Hoàng Nghĩa Quang',   dept: 'SRI'  },
        { no: 14, name: 'Cấn Huy Hoàng',       dept: 'SRI'  },
        { no: 15, name: 'Kiều Bá Quyên',       dept: 'SRI'  },
        { no: 16, name: 'Hà Quang Đạt',        dept: 'SRI'  },
        { no: 17, name: 'Trần Thế Anh',        dept: 'SRI'  },
        { no: 18, name: 'Mai Xuân Hòa',        dept: 'SRI'  },
        { no: 19, name: 'Nguyễn Văn Duy',      dept: 'SRI'  },
        { no: 20, name: 'Đỗ Thanh Sơn',        dept: 'TED'  },
        { no: 21, name: 'Đỗ Quang Tùng',       dept: 'TED'  },
        { no: 22, name: 'Trần Đức Thái',       dept: 'TED'  },
        { no: 23, name: 'Nguyễn Thanh Bình',   dept: 'TED'  },
        { no: 24, name: 'Ngô Trung Phương',    dept: 'UHRI' }
      ]
    },

    /* ---------- CẦU LÔNG ĐÔI NAM NỮ ---------- */
    {
      id: 'cl-mix',
      name: 'Cầu lông đôi nam nữ',
      short: 'CL nam nữ',
      sport: 'cầu lông',
      venueId: 'cl',
      format: 'r6diff',
      teamCount: 6,
      targetScore: 21,
      scoring: '3 trận vòng đầu. Hai đội thắng có hiệu số điểm cao nhất vào chung kết, ' +
               'đội thắng còn lại nhận hạng ba.',
      drawRule: 'Các cặp nam nữ được bốc thăm ngẫu nhiên, không đổi đồng đội sau khi bốc.',
      status: 'needs-decision',
      statusNote: 'Bộ luật ghi thể thức 6 đội, nhưng danh sách đã ghép được 8 cặp. ' +
                  'BTC cần chốt lấy 6 đội nào, hoặc chuyển sang thể thức 8 đội.',
      teams: [
        { id: 1, p1: 'Phạm Trung Đức',     p2: 'Trần Thị Xuyến',         dept: 'IBIM · FIN' },
        { id: 2, p1: 'Đặng Minh Hưng',     p2: 'Nguyễn Thị Thanh Hoa',   dept: 'CHPS · ADM' },
        { id: 3, p1: 'Ngô Trung Phương',   p2: 'Trương Xuân Phương',     dept: 'UHRI · CDC' },
        { id: 4, p1: 'Trần Đức Thái',      p2: 'Lê Thị Ngọc',            dept: 'TED · ADM' },
        { id: 5, p1: 'Nguyễn Khắc Cường',  p2: 'Bùi Thị Trâm',           dept: 'A&I · FIN' },
        { id: 6, p1: 'Nguyễn Thanh Bình',  p2: 'Hà Thị Nga',             dept: 'TED · GMD' },
        { id: 7, p1: 'Mai Xuân Hòa',       p2: 'Nguyễn Thị Quý Thương',  dept: 'SRI · GMD',
          note: 'Nguyễn Thị Quý Thương chưa xác nhận tham gia' },
        { id: 8, p1: 'Hà Quang Đạt',       p2: 'Mai Lệ Hằng',            dept: 'SRI · HPTC' }
      ],
      seeds: [],
      waiting: {
        label: 'Nam đã đăng ký nhưng chưa có bạn đánh',
        names: ['Nguyễn Quốc Tuấn', 'Nguyễn Sách Hưng', 'Nguyễn Sơn Tùng']
      }
    }
  ],

  /* ================== NHẢY DÂY 1 PHÚT ==================
     Thi cá nhân theo lượt, xếp hạng riêng nam và nữ.
     Nhập kết quả: thêm trường count cho từng người, ví dụ count: 124   */
  jumpRope: {
    id: 'jump',
    name: 'Nhảy dây 1 phút',
    station: 'Khu nhảy dây',
    start: '13:30',
    heatMinutes: 10,
    rule: 'Mỗi người nhảy 1 lượt 60 giây. Mỗi lần dây qua trọn vẹn dưới hai chân ' +
          'tính 1 lần. Vấp dây là dừng. Ai nhiều lần nhất thì thắng.',
    groups: [
      {
        key: 'nam', label: 'Nhảy dây nam', heats: 4,
        athletes: [
          { heat: 1, bib: 'M01', name: 'Nguyễn Trường Lâm',     dept: 'CDC'  },
          { heat: 1, bib: 'M02', name: 'Nguyễn Văn Tình',       dept: 'HPTC' },
          { heat: 1, bib: 'M03', name: 'Tạ Anh Sơn',            dept: 'UHRI' },
          { heat: 1, bib: 'M04', name: 'Hoàng Quốc Đại',        dept: 'A&I'  },
          { heat: 1, bib: 'M05', name: 'Vũ Đức Mạnh',           dept: 'A&I'  },
          { heat: 2, bib: 'M06', name: 'Nguyễn Tuấn Cường',     dept: 'CHPS' },
          { heat: 2, bib: 'M07', name: 'Đặng Minh Hưng',        dept: 'CHPS' },
          { heat: 2, bib: 'M08', name: 'Trần Minh Thanh',       dept: 'CHPS' },
          { heat: 2, bib: 'M09', name: 'Nguyễn Ngọc Trình',     dept: 'CHPS' },
          { heat: 2, bib: 'M10', name: 'Phan Anh Tuấn',         dept: 'A&I'  },
          { heat: 3, bib: 'M11', name: 'Nguyễn Đức Thắng',      dept: 'A&I'  },
          { heat: 3, bib: 'M12', name: 'Phan Thành Trung',      dept: 'A&I'  },
          { heat: 3, bib: 'M13', name: 'Đinh Hoàng Phúc Hải',   dept: 'CHPS' },
          { heat: 3, bib: 'M14', name: 'Trần Mạnh Cường',       dept: 'GMD'  },
          { heat: 3, bib: 'M15', name: 'Hoàng Nghĩa Quang',     dept: 'SRI'  },
          { heat: 4, bib: 'M16', name: 'Nguyễn Thanh Bình',     dept: 'TED'  },
          { heat: 4, bib: 'M17', name: 'Nguyễn Minh Đức',       dept: 'TED'  },
          { heat: 4, bib: 'M18', name: 'Nguyễn Hậu Cần',        dept: 'IBIM' },
          { heat: 4, bib: 'M19', name: 'Vũ Hồng Phúc',          dept: 'CDC'  }
        ]
      },
      {
        key: 'nu', label: 'Nhảy dây nữ', heats: 2,
        athletes: [
          { heat: 1, bib: 'F01', name: 'Trịnh Thị Dung',        dept: 'FIN'  },
          { heat: 1, bib: 'F02', name: 'Lê Thị Ngọc',           dept: 'ADM'  },
          { heat: 1, bib: 'F03', name: 'Hà Thị Nga',            dept: 'GMD'  },
          { heat: 1, bib: 'F04', name: 'Huỳnh Minh Nguyệt',     dept: 'ADM'  },
          { heat: 1, bib: 'F05', name: 'Mai Lệ Hằng',           dept: 'HPTC' },
          { heat: 1, bib: 'F06', name: 'Nguyễn Thị Thanh Hoa',  dept: 'ADM'  },
          { heat: 2, bib: 'F07', name: 'Nguyễn Quỳnh Trang',    dept: 'BGĐ'  },
          { heat: 2, bib: 'F08', name: 'Trần Thị Xuyến',        dept: 'FIN'  },
          { heat: 2, bib: 'F09', name: 'Bùi Thị Trâm',          dept: 'FIN'  },
          { heat: 2, bib: 'F10', name: 'Trương Xuân Phương',    dept: 'CDC'  },
          { heat: 2, bib: 'F11', name: 'Nguyễn Thị Hồng Ngọc',  dept: 'CHPS' }
        ]
      }
    ],
    note: 'Danh sách lấy từ bản chia đội trước, BTC xác nhận lại trước giờ thi.'
  },

  /* ================== KẾT QUẢ ==================
     Điền theo dạng  'mã trận': [điểm đội trên, điểm đội dưới]
     Mã trận hiện ngay trên thẻ trận ở mục Lịch thi đấu.
     Ví dụ:  'pb-mix-TK-1': [11, 7]
     Đội thắng tự động đi tiếp sang vòng sau.                        */
  results: {},

  /* ================== GIẢI THƯỞNG ================== */
  awards: {
    note: 'Cơ cấu giải thưởng đang ở mức đề xuất, BTC sẽ chốt trước ngày hội.',
    perEvent: [
      { rank: 1, label: 'Giải Nhất', count: 1, note: 'Đội thắng chung kết' },
      { rank: 2, label: 'Giải Nhì',  count: 1, note: 'Đội thua chung kết' },
      { rank: 3, label: 'Giải Ba',   count: 2, note: 'Hai đội thua bán kết đồng giải ba' }
    ],
    lines: [
      'Bốn nội dung đôi: mỗi nội dung 1 Nhất, 1 Nhì, 2 Ba — tổng 32 huy chương.',
      'Nhảy dây xếp hạng riêng nam và nữ.',
      'Tổng cộng khoảng 40 huy chương cùng cúp cho các nội dung đôi.'
    ]
  },

  /* ================== LUẬT THI ĐẤU (từ bộ slide) ================== */
  rules: {
    common: {
      title: 'Quy định chung',
      items: [
        { n: 'Thể thức',  t: 'Tất cả các trận đánh 1 hiệp (BO1), không đánh lại.' },
        { n: 'Đúng giờ',  t: 'Đội vắng mặt quá 5 phút sau khi gọi tên bị xử thua.' },
        { n: 'Trọng tài', t: 'Mỗi sân có trọng tài và thư ký ghi điểm. Quyết định của trọng tài là cuối cùng.' },
        { n: 'Thắc mắc',  t: 'Báo trọng tài ngay tại pha bóng đó, không khiếu nại sau trận.' },
        { n: 'An toàn',   t: 'Khởi động kỹ, mang giày thể thao đế bám sân, uống đủ nước.' },
        { n: 'Tinh thần', t: 'Thi đấu vui, đẹp. Cổ vũ nhiệt tình cho đồng nghiệp.' }
      ]
    },
    groups: [
      {
        key: 'pickleball',
        label: 'Pickleball',
        accent: 'pb',
        court: {
          size: 'Sân 13,41 m × 6,10 m',
          detail: 'Bếp (vùng cấm vô lê) rộng 2,13 m mỗi bên lưới. Giao bóng chéo sân.'
        },
        blocks: [
          { title: 'Giao bóng', items: [
              'Giao bóng dưới tay, điểm chạm bóng thấp hơn thắt lưng.',
              'Đứng sau vạch cuối sân, giao chéo sân.',
              'Bóng giao rơi vào bếp hoặc chạm vạch bếp là lỗi.',
              'Mỗi lần giao chỉ được 1 quả.',
              'Bóng chạm vạch biên, vạch cuối sân vẫn tính trong sân.' ] },
          { title: 'Luật hai lần nảy', items: [
              'Bóng giao sang: bên nhận phải để bóng nảy 1 lần rồi mới đánh.',
              'Bóng trả về: bên giao cũng phải để bóng nảy 1 lần.',
              'Từ quả thứ ba mới được vô lê (đánh bóng chưa nảy).' ] },
          { title: 'Luật vùng bếp', items: [
              'Không vô lê khi đứng trong bếp hoặc giẫm vạch bếp.',
              'Vô lê xong bị đà kéo vào bếp cũng là lỗi.',
              'Được vào bếp để đánh bóng đã nảy trong bếp.' ] },
          { title: 'Mất bóng khi', items: [
              'Đánh ra ngoài sân.',
              'Bóng không qua lưới.',
              'Bóng nảy 2 lần bên sân mình.',
              'Phạm luật hai lần nảy hoặc luật vùng bếp.' ] },
          { title: 'Tính điểm — vòng loại (ăn điểm trực tiếp)', items: [
              'Thắng pha bóng nào được 1 điểm pha đó, dù đang giao hay nhận.',
              'Đội giao thua pha bóng thì đổi quyền giao.',
              'Điểm đội giao chẵn: giao từ ô phải. Lẻ: giao từ ô trái.',
              'Mỗi trận 1 hiệp, đội nào chạm 11 điểm trước là thắng.' ] },
          { title: 'Tính điểm — các vòng sau (theo lượt giao)', items: [
              'Chỉ đội đang giao bóng mới được ghi điểm.',
              'Đội nhận thắng pha bóng: không có điểm, chỉ giành lượt giao.',
              'Mỗi đội có 2 lượt giao (mỗi người 1 lượt); đội giao đầu trận chỉ có 1 lượt.',
              'Ghi điểm thì người giao đổi ô và giao tiếp.',
              'Mỗi trận 1 hiệp, đội nào chạm 11 điểm trước là thắng.' ] }
        ],
        examples: [
          { title: 'Ví dụ: ăn điểm trực tiếp (vòng loại)',
            head: ['Pha', 'Giao', 'Thắng pha', 'A – B', 'Tiếp theo'],
            rows: [
              ['1', 'Đội A', 'Đội A', '1 – 0', 'A giao tiếp'],
              ['2', 'Đội A', 'Đội B', '1 – 1', 'B giao'],
              ['3', 'Đội B', 'Đội B', '1 – 2', 'B giao tiếp'],
              ['4', 'Đội B', 'Đội A', '2 – 2', 'A giao']
            ] },
          { title: 'Ví dụ: ăn điểm theo lượt giao (các vòng sau)',
            head: ['Pha', 'Giao', 'Thắng pha', 'A – B', 'Tiếp theo'],
            rows: [
              ['1', 'A (đầu trận)', 'Đội A', '1 – 0', 'A giao tiếp'],
              ['2', 'A (đầu trận)', 'Đội B', '1 – 0', 'B giao, người 1'],
              ['3', 'B, người 1',   'Đội A', '1 – 0', 'B giao, người 2'],
              ['4', 'B, người 2',   'Đội B', '1 – 1', 'Người 2 giao tiếp'],
              ['5', 'B, người 2',   'Đội A', '1 – 1', 'A giao, người 1']
            ] }
        ],
        tip: 'Cùng là thắng pha bóng khi đang nhận: vòng loại thì được điểm, ' +
             'các vòng sau chỉ giành lại lượt giao.'
      },
      {
        key: 'caulong',
        label: 'Cầu lông',
        accent: 'cl',
        court: {
          size: 'Sân đôi 13,40 m × 6,10 m',
          detail: 'Vạch giao cầu ngắn cách lưới 1,98 m. Giao cầu chéo sân.'
        },
        blocks: [
          { title: 'Giao cầu', items: [
              'Giao cầu chéo sân, từ dưới lên, điểm chạm cầu thấp hơn 1,15 m.',
              'Hai chân chạm sân, không giẫm vạch khi giao.',
              'Điểm đội giao chẵn: giao từ ô phải. Lẻ: giao từ ô trái.',
              'Chỉ người đứng ô chéo được đỡ quả giao.',
              'Sau quả giao, hai người đánh tự do, không cần luân phiên.' ] },
          { title: 'Tính điểm', items: [
              'Mỗi trận 1 hiệp, đánh đến 21 điểm; đội chạm 21 trước là thắng.',
              'Thắng pha cầu nào được 1 điểm pha đó.',
              'Đội thắng pha cầu được giao quả tiếp theo.',
              'Đội đang giao ghi điểm: người giao đổi ô và giao tiếp.',
              'Đội nhận không đổi vị trí.' ] },
          { title: 'Các lỗi thường gặp', items: [
              'Cầu rơi ngoài sân (chạm vạch là trong sân).',
              'Cầu mắc lưới hoặc không qua lưới.',
              'Người hoặc vợt chạm lưới khi cầu còn trong cuộc.',
              'Đánh cầu khi cầu chưa sang sân mình.',
              'Một đội chạm cầu 2 lần liên tiếp.',
              'Cầu chạm người hoặc quần áo.' ] }
        ],
        examples: [
          { title: 'Ví dụ: điểm và vị trí giao cầu',
            head: ['Pha', 'Đội giao', 'Thắng pha', 'A – B', 'Quả tiếp theo'],
            rows: [
              ['1', 'Đội A (ô phải)', 'Đội A', '1 – 0', 'A giao tiếp. Điểm lẻ nên người vừa giao sang ô trái'],
              ['2', 'Đội A (ô trái)', 'Đội B', '1 – 1', 'B giao. Điểm B lẻ nên người ở ô trái của B giao'],
              ['3', 'Đội B (ô trái)', 'Đội B', '1 – 2', 'B giao tiếp. Điểm chẵn nên người vừa giao sang ô phải'],
              ['4', 'Đội B (ô phải)', 'Đội A', '2 – 2', 'A giao. Điểm A chẵn nên người ở ô phải của A giao']
            ] }
        ],
        tip: 'Mẹo nhớ: nhìn điểm của đội đang giao. Chẵn thì ô phải, lẻ thì ô trái. ' +
             'Chỉ đổi ô khi đang giao mà ghi điểm.'
      },
      {
        key: 'nhayday',
        label: 'Nhảy dây',
        accent: 'jr',
        blocks: [
          { title: 'Cách thi', items: [
              'Mỗi người nhảy 1 lượt, 60 giây, tính từ hiệu lệnh trọng tài.',
              'Mỗi lần dây qua dưới hai chân trọn vẹn tính 1 lần.',
              'Vấp dây: dừng, không tính điểm nữa.',
              'Chụm chân hay đổi chân đều được; mỗi lần bật chỉ tính 1 vòng dây.',
              'Ai nhảy được nhiều lần nhất thì thắng.',
              'Bằng điểm: nhảy lại 30 giây để phân hạng.' ] }
        ],
        examples: []
      }
    ]
  },

  /* ================== CÂU HỎI THƯỜNG GẶP ================== */
  faq: [
    { q: 'Tôi đăng ký nhiều nội dung, có bị trùng giờ không?',
      a: 'Lịch đã xếp các vòng lần lượt để hạn chế trùng. Nếu bạn thấy hai trận của mình ' +
         'sát nhau, báo trọng tài sân để đổi thứ tự trong cùng lượt.' },
    { q: 'Vợt và bóng có phải mang theo không?',
      a: 'BTC chuẩn bị vợt và bóng. Bạn chỉ cần mang giày thể thao đế bám sân. ' +
         'Ai có vợt quen tay thì mang theo dùng cho thoải mái.' },
    { q: 'Tôi muốn hỏi diễn giả nhưng không muốn nói trước đám đông?',
      a: 'Gửi câu hỏi qua form ở mục Hỏi diễn giả. Câu hỏi sẽ được MC đọc lên.' },
    { q: 'Trận của tôi đánh mấy hiệp?',
      a: 'Tất cả các trận đánh 1 hiệp (BO1). Pickleball chạm 11 điểm, cầu lông chạm 21 điểm.' },
    { q: 'Thua một trận là bị loại luôn?',
      a: 'Với các nội dung loại trực tiếp thì đúng. Riêng cầu lông đôi nam nữ, ba đội thắng ' +
         'vòng đầu được xếp hạng theo hiệu số điểm.' },
    { q: 'Kết quả trận đấu xem ở đâu?',
      a: 'Ngay trên trang này, mục Lịch thi đấu và Nhánh đấu. Thư ký sân cập nhật sau mỗi trận.' }
  ]
};
