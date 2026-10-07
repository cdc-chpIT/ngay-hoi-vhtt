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
    /* ---- BUỔI SÁNG — PHẦN VĂN HÓA (hội trường) ---- */
    { start: '08:30', end: '08:50', fixed: true, part: 'morning', icon: 'door',
      title: 'Tập trung, ổn định chỗ ngồi',
      desc: 'Quét mã QR để mở trang này, nhận chỗ và chuẩn bị vào chương trình.',
      owner: 'Tiểu ban Hậu cần' },

    { start: '08:50', end: '09:00', fixed: true, part: 'morning', icon: 'flag',
      title: 'Phát biểu khai mạc',
      desc: 'Ban lãnh đạo mở đầu ngày hội và xác lập ba trục văn hóa của năm.',
      owner: 'Ban Giám đốc' },

    { start: '09:00', end: '09:05', fixed: true, part: 'morning', icon: 'mic',
      title: 'MC dẫn dắt chương trình',
      desc: 'Giới thiệu đại biểu, chủ đề văn hóa và cách đặt câu hỏi cho diễn giả.',
      owner: 'MC' },

    { start: '09:10', end: '09:25', fixed: true, part: 'morning', icon: 'talk',
      title: 'Bài 1 — Văn hóa Truyền thống CHP',
      desc: 'Truyền thống là nền tảng: chuyện của những người đi trước.',
      talk: 1 },

    { start: '09:30', end: '09:50', fixed: true, part: 'morning', icon: 'talk',
      title: 'Bài 2 — Văn hóa Tự chủ',
      desc: 'Tự lực là mục tiêu: làm chủ công việc và làm chủ chất lượng.',
      talk: 2 },

    { start: '09:50', end: '10:00', fixed: true, part: 'morning', icon: 'rest',
      title: 'Nghỉ giải lao',
      desc: 'Uống nước, chụp ảnh, gửi câu hỏi cho diễn giả qua form.' },

    { start: '10:00', end: '10:15', fixed: true, part: 'morning', icon: 'talk',
      title: 'Bài 3 — Văn hóa Thích ứng',
      desc: 'Thích ứng là phương thức: đổi cách làm khi điều kiện đổi.',
      talk: 3 },

    { start: '10:15', end: '10:45', fixed: true, part: 'morning', icon: 'talk',
      title: 'Hỏi – đáp',
      desc: 'Hỏi trực tiếp tại hội trường hoặc gửi qua form trên trang này.',
      tag: 'Gửi câu hỏi được cả trước và trong giờ' },

    { start: '10:45', end: '11:15', fixed: true, part: 'morning', icon: 'game',
      title: 'Vui chơi có thưởng',
      desc: 'Mini game trắc nghiệm, có câu lấy ngay từ ba bài vừa nghe.',
      tag: 'Có thưởng' },

    { start: '11:15', end: '11:25', fixed: true, part: 'morning', icon: 'camera',
      title: 'Tổng kết, bế mạc, chụp ảnh',
      desc: 'Chốt lại phần Văn hóa và chụp ảnh chung.' },

    { start: '11:25', end: '13:00', fixed: true, part: 'noon', icon: 'rest',
      title: 'Nghỉ trưa, ăn trưa tự túc',
      desc: 'Dọn dẹp hội trường rồi di chuyển sang Nhà thi đấu BV 354.' },

    /* ---- BUỔI CHIỀU — ĐẠI HỘI THỂ THAO (Nhà thi đấu BV 354) ---- */
    { start: '13:00', end: '13:25', fixed: true, part: 'afternoon', icon: 'pin',
      title: 'Có mặt tại Nhà thi đấu BV 354',
      desc: 'Nhận áo, khởi động, kiểm tra danh sách đội và sân.',
      owner: 'Tiểu ban Hậu cần' },

    { start: '13:25', end: '13:40', fixed: true, part: 'afternoon', icon: 'flag',
      title: 'Khai mạc phần thể thao',
      desc: 'Thông báo thể thức thi đấu và cơ cấu giải thưởng.',
      owner: 'Trưởng ban trọng tài' },

    { start: '13:40', end: '16:10', part: 'afternoon', icon: 'ball',
      title: 'Thi đấu trên 5 sân',
      desc: 'Hai sân Pickleball và ba sân Cầu lông chạy song song. ' +
            'Lịch từng trận xem ở mục Lịch thi đấu.',
      sport: true },

    { start: '16:15', end: '16:30', fixed: true, part: 'afternoon', icon: 'trophy',
      title: 'Tổng hợp kết quả & trao giải',
      desc: 'Trao giải chung cho cả bốn nội dung và nội dung nhảy dây.' },

    { start: '17:30', end: null, fixed: true, part: 'evening', icon: 'dinner',
      title: 'Liên hoan',
      desc: 'Phần mở rộng, không bắt buộc.',
      tag: 'Tự nguyện' }
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
    /* Sơ đồ thi đấu của BTC: ai phải đá hai lượt liền nhau thì trọng tài
       cho nghỉ 5 phút rồi lùi giờ trận đó tương ứng. */
    playerRestMinutes: 5,
    endBy: '16:10'          /* mốc phải xong phần thi đấu; quá thì trang báo đỏ */
  },

  /* ================== SÂN & KHU THI ĐẤU ==================
     Hai sân Pickleball dùng chung cho CẢ HAI nội dung pickleball, ba sân
     Cầu lông dùng chung cho cả hai nội dung cầu lông — không cố định mỗi
     nội dung một sân. Đây là điều kiện để chạy hết 48 trận trong 150 phút. */
  venues: [
    {
      id: 'pb',
      name: 'Khu Pickleball',
      sport: 'pickleball',
      slotMinutes: 10,       /* mặc định; từng vòng có thời lượng riêng ở durations */
      gridMinutes: 5,
      start: '13:40',
      finalsTogether: true,  /* hai chung kết pickleball đá đồng thời trên 2 sân */
      courts: [
        { id: 'PB1', name: 'Sân Pickleball 1', short: 'PB 1' },
        { id: 'PB2', name: 'Sân Pickleball 2', short: 'PB 2' }
      ],
      /* Thứ tự ưu tiên khi hai trận cùng xếp được vào một giờ. */
      roundOrder: [
        ['pb-nam', 'VL'],
        ['pb-mix', 'TK'],
        ['pb-nam', 'VV'],
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
      slotMinutes: 15,
      gridMinutes: 5,
      start: '13:40',
      courts: [
        { id: 'CL1', name: 'Sân Cầu lông 1', short: 'CL 1' },
        { id: 'CL2', name: 'Sân Cầu lông 2', short: 'CL 2' },
        { id: 'CL3', name: 'Sân Cầu lông 3', short: 'CL 3' }
      ],
      roundOrder: [
        ['cl-nam', 'VL'],
        ['cl-mix', 'TK'],
        ['cl-nam', 'VV'],
        ['cl-nam', 'TK'],
        ['cl-mix', 'BK'],
        ['cl-nam', 'BK'],
        ['cl-mix', 'TB'],
        ['cl-nam', 'TB'],
        ['cl-mix', 'CK'],
        ['cl-nam', 'CK']
      ]
    }
  ],

  /* ================== CÁC NỘI DUNG THI ĐẤU ==================
     format:
       'q12r'   = 12 đội, không ai được miễn. 6 trận vòng loại, 6 đội thắng
                  vào thẳng tứ kết; 6 đội thua đấu 3 trận vòng vớt, lấy thêm
                  2 đội theo hiệu số rồi tổng điểm.
       'ko8'    = 8 đội, loại trực tiếp từ tứ kết.
       'ko12b4' = 12 đội, 4 đội được miễn vòng loại (không dùng năm nay).
       'r6diff' = 6 đội, 3 trận rồi lấy 2 hiệu số cao nhất (không dùng năm nay).
     durations: thời lượng mỗi trận theo từng vòng, tính bằng phút.
     thirdPlace: có trận tranh hạng Ba hay không.
     seeds: thứ tự bốc thăm. Đây là thứ tự đội trong bảng chia của BTC;
            bấm "Bốc thăm vị trí" trong Bảng BTC để xáo lại.                */
  events: [

    /* ---------- PICKLEBALL ĐÔI NAM ---------- */
    {
      id: 'pb-nam',
      name: 'Pickleball đôi nam',
      short: 'PB đôi nam',
      sport: 'pickleball',
      venueId: 'pb',
      format: 'q12r',
      teamCount: 12,
      thirdPlace: false,
      targetScore: 11,
      durations: { VL: 10, VV: 10, TK: 10, BK: 16, CK: 16 },
      scoring: 'Vòng loại, vòng vớt và tứ kết ăn điểm trực tiếp. ' +
               'Bán kết và chung kết tính điểm theo lượt giao.',
      drawRule: 'Đội đã ghép sẵn theo bảng chia của BTC. ' +
                'Vòng loại ghép lần lượt Đội 1–2, 3–4 … 11–12.',
      status: 'ok',
      statusNote: 'Đội 12 còn một suất chưa chốt người.',
      teams: [
        { id: 1, p1: 'Hồ Thái Hùng', p2: 'Nguyễn Đức Thắng', dept: 'BGĐ · A&I' },
        { id: 2, p1: 'Nguyễn Khắc Cường', p2: 'Vũ Đức Mạnh', dept: 'A&I' },
        { id: 3, p1: 'Phạm Tiến Dũng', p2: 'Nguyễn Quốc Tuấn', dept: 'ADM · CHPS' },
        { id: 4, p1: 'Vũ Minh Đức', p2: 'Nguyễn Huy Bình', dept: 'GMD · IBIM' },
        { id: 5, p1: 'Đoàn Bảo Quốc', p2: 'Trần Quảng Toản', dept: 'IBIM' },
        { id: 6, p1: 'Nguyễn Hậu Cần', p2: 'Phạm Trung Đức', dept: 'IBIM' },
        { id: 7, p1: 'Nguyễn Tất Quý Bình', p2: 'Hoàng Nghĩa Quang', dept: 'PMD · SRI' },
        { id: 8, p1: 'Cấn Huy Hoàng', p2: 'Kiều Bá Quyên', dept: 'SRI' },
        { id: 9, p1: 'Trần Thế Anh', p2: 'Nguyễn Văn Duy', dept: 'SRI' },
        { id: 10, p1: 'Nguyễn Ngọc Tuấn', p2: 'Ngô Tấn Sơn', dept: 'TED' },
        { id: 11, p1: 'Nguyễn Tuyển Việt', p2: 'Trần Việt Hùng', dept: 'UHRI' },
        { id: 12, p1: 'Nguyễn Huy Hoàng', p2: 'Tuyển thủ nam 3', dept: 'VPĐD', pending: true }
      ],
      seeds: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
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
      thirdPlace: false,
      targetScore: 11,
      durations: { TK: 10, BK: 16, CK: 16 },
      scoring: 'Tứ kết ăn điểm trực tiếp. Bán kết và chung kết tính điểm theo lượt giao.',
      drawRule: 'Tám đội vào thẳng tứ kết theo thứ tự trong bảng chia.',
      status: 'ok',
      statusNote: 'Bốn suất dự bị trong bảng chia chưa gán tên, chưa xếp vào đội nào.',
      waiting: {
        label: 'Suất dự bị chưa chốt người',
        names: ['Tuyển thử nữ 1', 'Tuyển thử nữ 2', 'Tuyển thủ nam 1', 'Tuyển thủ nam 2']
      },
      teams: [
        { id: 1, p1: 'Nguyễn Quỳnh Trang', p2: 'Nguyễn Đức Thắng', dept: 'BGĐ · A&I' },
        { id: 2, p1: 'Nguyễn Khắc Cường', p2: 'Nguyễn Thị Thanh Hoa', dept: 'A&I · ADM' },
        { id: 3, p1: 'Trương Xuân Phương', p2: 'Nguyễn Quốc Tuấn', dept: 'CDC · CHPS' },
        { id: 4, p1: 'Bùi Thị Trâm', p2: 'Trần Thị Xuyến', dept: 'FIN' },
        { id: 5, p1: 'Trần Mạnh Cường', p2: 'Nguyễn Thị Quý Thương', dept: 'GMD' },
        { id: 6, p1: 'Mai Lệ Hằng', p2: 'Nguyễn Tất Quý Bình', dept: 'HPTC · PMD' },
        { id: 7, p1: 'Hà Quang Đạt', p2: 'Nguyễn Ngọc Tuấn', dept: 'SRI · TED' },
        { id: 8, p1: 'Ngô Tấn Sơn', p2: 'Ngô Trung Phương', dept: 'TED · UHRI' }
      ],
      seeds: [
        1, 2, 3, 4, 5, 6, 7, 8
      ]
    },

    /* ---------- CẦU LÔNG ĐÔI NAM ---------- */
    {
      id: 'cl-nam',
      name: 'Cầu lông đôi nam',
      short: 'CL đôi nam',
      sport: 'cầu lông',
      venueId: 'cl',
      format: 'q12r',
      teamCount: 12,
      thirdPlace: true,
      targetScore: 21,
      durations: { mac_dinh: 15 },
      scoring: 'Mọi vòng đánh 1 hiệp 21 điểm, ăn điểm trực tiếp theo luật BWF.',
      drawRule: 'Đội đã ghép sẵn theo bảng chia của BTC. ' +
                'Vòng loại ghép lần lượt Đội 1–2, 3–4 … 11–12.',
      status: 'ok',
      teams: [
        { id: 1, p1: 'Nguyễn Đức Thắng', p2: 'Nguyễn Khắc Cường', dept: 'A&I' },
        { id: 2, p1: 'Hoàng Quốc Đại', p2: 'Phạm Tiến Dũng', dept: 'A&I · ADM' },
        { id: 3, p1: 'Nguyễn Trường Lâm', p2: 'Đặng Minh Hưng', dept: 'CDC · CHPS' },
        { id: 4, p1: 'Nguyễn Quốc Tuấn', p2: 'Trần Mạnh Cường', dept: 'CHPS · GMD' },
        { id: 5, p1: 'Nguyễn Sơn Tùng', p2: 'Nguyễn Tất Quý Bình', dept: 'PMD' },
        { id: 6, p1: 'Nguyễn Sách Hưng', p2: 'Hoàng Nghĩa Quang', dept: 'PMD · SRI' },
        { id: 7, p1: 'Cấn Huy Hoàng', p2: 'Kiều Bá Quyên', dept: 'SRI' },
        { id: 8, p1: 'Hà Quang Đạt', p2: 'Trần Thế Anh', dept: 'SRI' },
        { id: 9, p1: 'Mai Xuân Hòa', p2: 'Nguyễn Văn Duy', dept: 'SRI' },
        { id: 10, p1: 'Đỗ Thanh Sơn', p2: 'Đỗ Quang Tùng', dept: 'TED' },
        { id: 11, p1: 'Nguyễn Mạnh Hùng', p2: 'Trần Đức Thái', dept: 'TED' },
        { id: 12, p1: 'Nguyễn Thanh Bình', p2: 'Ngô Trung Phương', dept: 'TED · UHRI' }
      ],
      seeds: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
      ]
    },

    /* ---------- CẦU LÔNG ĐÔI NAM NỮ ---------- */
    {
      id: 'cl-mix',
      name: 'Cầu lông đôi nam nữ',
      short: 'CL nam nữ',
      sport: 'cầu lông',
      venueId: 'cl',
      format: 'ko8',
      teamCount: 8,
      thirdPlace: true,
      targetScore: 21,
      durations: { mac_dinh: 15 },
      scoring: 'Đánh 1 hiệp 21 điểm, ăn điểm trực tiếp theo luật BWF.',
      drawRule: 'Tám đội vào thẳng tứ kết theo thứ tự trong bảng chia.',
      status: 'needs-decision',
      statusNote: 'Nội dung này có 19 người đăng ký — số lẻ. ' +
                  'Bảng chia mới ghép được 8 đội, còn 3 người chưa có đồng đội.',
      waiting: {
        label: 'Đã đăng ký nhưng chưa ghép được đội',
        names: ['Trần Đức Thái', 'Nguyễn Thanh Bình', 'Ngô Trung Phương']
      },
      teams: [
        { id: 1, p1: 'Nguyễn Khắc Cường', p2: 'Lê Thị Ngọc', dept: 'A&I · ADM' },
        { id: 2, p1: 'Nguyễn Thị Thanh Hoa', p2: 'Trương Xuân Phương', dept: 'ADM · CDC' },
        { id: 3, p1: 'Đặng Minh Hưng', p2: 'Nguyễn Quốc Tuấn', dept: 'CHPS' },
        { id: 4, p1: 'Bùi Thị Trâm', p2: 'Trần Thị Xuyến', dept: 'FIN' },
        { id: 5, p1: 'Nguyễn Thị Quý Thương', p2: 'Hà Thị Nga', dept: 'GMD' },
        { id: 6, p1: 'Mai Lệ Hằng', p2: 'Phạm Trung Đức', dept: 'HPTC · IBIM' },
        { id: 7, p1: 'Nguyễn Sơn Tùng', p2: 'Nguyễn Sách Hưng', dept: 'PMD' },
        { id: 8, p1: 'Hà Quang Đạt', p2: 'Mai Xuân Hòa', dept: 'SRI' }
      ],
      seeds: [
        1, 2, 3, 4, 5, 6, 7, 8
      ]
    }
  ],

  /* ================== NHẢY DÂY 1 PHÚT ==================
     Thi cá nhân theo lượt, xếp hạng riêng nam và nữ.
     Nhập kết quả: thêm trường count cho từng người, ví dụ count: 124   */
  jumpRope: {
    id: 'jump',
    name: 'Nhảy dây 1 phút',
    station: 'Khu nhảy dây',
    start: '13:40',
    statusNote: 'Ba nguồn đang lệch nhau: bản đăng ký có 33 người tick nhảy dây, ' +
                'sheet "DS Nhảy dây" liệt kê 24 người, danh sách dưới đây có 30. ' +
                'BTC cần chốt lại một danh sách trước ngày hội.',
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
          { title: 'Tính điểm — vòng loại, vòng vớt, tứ kết (ăn điểm trực tiếp)', items: [
              'Thắng pha bóng nào được 1 điểm pha đó, dù đang giao hay nhận.',
              'Đội giao thua pha bóng thì đổi quyền giao.',
              'Điểm đội giao chẵn: giao từ ô phải. Lẻ: giao từ ô trái.',
              'Mỗi trận 1 hiệp, chạm 11 điểm và hơn đối thủ 2 điểm là thắng.',
              'Mỗi trận gói trong 10 phút.' ] },
          { title: 'Tính điểm — bán kết và chung kết (theo lượt giao)', items: [
              'Chỉ đội đang giao bóng mới được ghi điểm.',
              'Đội nhận thắng pha bóng: không có điểm, chỉ giành lượt giao.',
              'Mỗi đội có 2 lượt giao (mỗi người 1 lượt); đội giao đầu trận chỉ có 1 lượt.',
              'Ghi điểm thì người giao đổi ô và giao tiếp.',
              'Mỗi trận 1 hiệp, chạm 11 điểm và hơn đối thủ 2 điểm là thắng.',
              'Mỗi trận gói trong 16 phút.' ] }
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
              'Mỗi trận 1 hiệp 21 điểm, hơn đối thủ 2 điểm mới thắng.',
              'Hòa 29–29 thì ai chạm 30 trước là thắng.',
              'Mỗi trận gói trong 15 phút.',
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
