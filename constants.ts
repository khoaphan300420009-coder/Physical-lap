
import { TimelineEvent, Formula, Scientist } from './types';

// Helper for long description
const LONG_LOREM = `
Sự kiện này đánh dấu một bước ngoặt quan trọng trong lịch sử phát triển của vật lý học, mở ra những chân trời mới cho sự hiểu biết của con người về vũ trụ.
Trước thời điểm này, các quan niệm cũ kỹ và giáo điều đã kìm hãm sự tiến bộ của khoa học. Những nhà tư tưởng vĩ đại đã phải đấu tranh không mệt mỏi để bảo vệ chân lý.
Khám phá này không chỉ có ý nghĩa lý thuyết thuần túy mà còn dẫn đến vô số ứng dụng thực tiễn, thay đổi hoàn toàn diện mạo của đời sống xã hội.
Từ những tính toán trên giấy nháp đến các thí nghiệm được kiểm chứng nghiêm ngặt, quá trình này là minh chứng cho sức mạnh của trí tuệ và lòng kiên trì.
Nó kết nối các hiện tượng tưởng chừng như rời rạc thành một bức tranh thống nhất, tuân theo các quy luật toán học đẹp đẽ và chặt chẽ.
Ngày nay, chúng ta vẫn đang tiếp tục thừa hưởng và phát triển di sản của khám phá này, áp dụng nó vào công nghệ vũ trụ, y học hạt nhân, và điện tử vi mô.
Thật khó để hình dung thế giới hiện đại sẽ ra sao nếu thiếu đi cột mốc lịch sử này. Nó là ngọn hải đăng soi sáng con đường chinh phục tri thức của nhân loại.
`;

const CONTENT_TEMPLATE = `
**1. Cơ sở Lý thuyết & Bản chất Vật lý (Theory & Nature)**
Công thức này không chỉ là một phương trình toán học khô khan, mà là sự cô đọng của hàng trăm năm quan sát và thực nghiệm. Nó mô tả mối quan hệ định lượng chính xác giữa các đại lượng vật lý cơ bản, cho phép chúng ta dự đoán hành vi của tự nhiên với độ chính xác đáng kinh ngạc. 
Bản chất của hiện tượng nằm ở sự tương tác giữa các trường lực và vật chất. Khi đi sâu vào phân tích, ta thấy rằng công thức này tuân thủ các nguyên lý bảo toàn cơ bản nhất của vũ trụ: bảo toàn năng lượng, bảo toàn động lượng và tính đối xứng của không-thời gian.

Ví dụ, nếu xét trong hệ quy chiếu quán tính, các định luật vật lý giữ nguyên dạng, điều này dẫn đến tính bất biến của phương trình. Sự tương tác giữa các thành phần trong hệ thống được điều chỉnh bởi các hằng số vật lý cơ bản, những con số bí ẩn định hình nên cấu trúc của thực tại.

**2. Lịch sử Khám phá & Phát triển (History & Context)**
Hành trình tìm ra định luật này đầy rẫy những chông gai. Ban đầu, các nhà khoa học chỉ có những quan sát rời rạc và định tính. Phải mất nhiều thập kỷ, với sự đóng góp của nhiều trí tuệ vĩ đại, các mảnh ghép mới dần được lắp ráp hoàn chỉnh.
Thí nghiệm kiểm chứng đầu tiên rất thô sơ, thường được thực hiện với những dụng cụ tự chế đơn giản nhưng đầy sáng tạo. Các nhà bác học thời đó đã phải vượt qua những giới hạn về công nghệ đo lường, sai số dụng cụ và cả những định kiến của thời đại để tìm ra chân lý.
Sau này, với công nghệ hiện đại hơn, độ chính xác của công thức đã được kiểm nghiệm tới hàng chục chữ số thập phân, khẳng định tính đúng đắn tuyệt đối trong phạm vi áp dụng của nó.

**3. Phân tích Chi tiết & Ý nghĩa các Đại lượng (Deep Dive)**
Để hiểu rõ công thức, ta cần mổ xẻ từng thành phần:
- Đại lượng vế trái thường đại diện cho kết quả hoặc trạng thái của hệ (như Lực, Năng lượng, hoặc Tần số).
- Các đại lượng vế phải là các biến số đầu vào (Khối lượng, Vận tốc, Điện tích...).
- Các hằng số tỷ lệ đóng vai trò cầu nối, chuẩn hóa các đơn vị đo lường.
Mối quan hệ này thường là tuyến tính hoặc phi tuyến (bậc 2, hàm mũ), cho thấy sự nhạy cảm của hệ thống đối với sự thay đổi của các tham số đầu vào. Một thay đổi nhỏ ở đầu vào có thể dẫn đến sự biến đổi lớn ở đầu ra.

**4. Ứng dụng Thực tiễn trong Đời sống & Công nghệ (Applications)**
Ngày nay, công thức này hiện diện khắp nơi xung quanh chúng ta, là trái tim của nền văn minh công nghiệp 4.0:
- **Kỹ thuật xây dựng:** Tính toán kết cấu chịu lực cho các tòa nhà chọc trời và cầu treo dây văng.
- **Giao thông vận tải:** Thiết kế khí động học cho ô tô, máy bay và tàu vũ trụ, tối ưu hóa nhiên liệu.
- **Điện tử & Viễn thông:** Là nền tảng cho sự hoạt động của mạch điện, sóng vô tuyến, mạng 5G và internet toàn cầu.
- **Y học hiện đại:** Ứng dụng trong các máy MRI, X-quang, phẫu thuật laser và xạ trị ung thư.

**5. Mở rộng & Giới hạn (Limits & Extensions)**
Mặc dù rất chính xác, công thức này cũng có những giới hạn của nó. Khi xét đến các điều kiện cực đoan (vận tốc gần bằng ánh sáng $c$, kích thước siêu nhỏ cấp nguyên tử $\hbar$, hoặc trường hấp dẫn cực mạnh của lỗ đen), ta cần phải sử dụng các lý thuyết tổng quát hơn như Thuyết Tương đối hay Cơ học Lượng tử. 
Tuy nhiên, trong đời sống hàng ngày và kỹ thuật thông thường, đây vẫn là công cụ đắc lực, đơn giản và hiệu quả nhất, giúp con người chinh phục thiên nhiên.
`;

export const EVENTS_DATA: TimelineEvent[] = [
    // --- CƠ HỌC (8 sự kiện) ---
    { 
        id: 1, year: "250 TCN", numericYear: -250, title: "Nguyên lý Archimedes", physicist: "Archimedes", category: "Cơ học",
        shortDesc: "Lực đẩy và chiếc vương miện vàng.", 
        fullDesc: "Archimedes phát hiện ra nguyên lý thủy tĩnh học khi đang tắm. " + LONG_LOREM, highlights: ["Thủy tĩnh học", "Eureka!", "Lực đẩy Ác-si-mét"], img: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=2072",
        link: "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_Archimedes"
    },
    { 
        id: 2, year: "1638", numericYear: 1638, title: "Sự rơi tự do", physicist: "Galileo Galilei", category: "Cơ học",
        shortDesc: "Thí nghiệm tháp nghiêng Pisa.", 
        fullDesc: "Galileo chứng minh rằng mọi vật rơi với gia tốc như nhau bất kể khối lượng. " + LONG_LOREM, highlights: ["Gia tốc g", "Thực nghiệm", "Quán tính"], img: "https://images.unsplash.com/photo-1548543604-a87c9909abec?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/R%C6%A1i_t%E1%BB%B1_do"
    },
    { 
        id: 3, year: "1687", numericYear: 1687, title: "Các định luật Newton", physicist: "Isaac Newton", category: "Cơ học",
        shortDesc: "Principia Mathematica ra đời.", 
        fullDesc: "Ba định luật chuyển động và định luật vạn vật hấp dẫn. " + LONG_LOREM, highlights: ["Động lực học", "Hấp dẫn", "Vi tích phân"], img: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/C%C3%A1c_%C4%91%E1%BB%8Bnh_lu%E1%BA%ADt_v%E1%BB%81_chuy%E1%BB%83n_%C4%91%E1%BB%99ng_c%E1%BB%A7a_Newton"
    },
    { 
        id: 4, year: "1660", numericYear: 1660, title: "Định luật Hooke", physicist: "Robert Hooke", category: "Cơ học",
        shortDesc: "Sự đàn hồi của lò xo.", 
        fullDesc: "Lực đàn hồi tỉ lệ thuận với độ biến dạng. " + LONG_LOREM, highlights: ["Đàn hồi", "Ứng suất", "Biến dạng"], img: "https://images.unsplash.com/photo-1517646331032-9e8563c523a1?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_Hooke"
    },
    { 
        id: 5, year: "1738", numericYear: 1738, title: "Định luật Bernoulli", physicist: "Daniel Bernoulli", category: "Cơ học",
        shortDesc: "Cơ học chất lưu động.", 
        fullDesc: "Áp suất giảm khi vận tốc dòng chảy tăng. Cơ sở của lực nâng cánh máy bay. " + LONG_LOREM, highlights: ["Khí động học", "Áp suất", "Bảo toàn năng lượng"], img: "https://images.unsplash.com/photo-1457364887197-9150188c107b?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/Nguy%C3%AAn_l%C3%BD_Bernoulli"
    },
    { 
        id: 6, year: "1851", numericYear: 1851, title: "Con lắc Foucault", physicist: "Léon Foucault", category: "Cơ học",
        shortDesc: "Chứng minh Trái Đất tự quay.", 
        fullDesc: "Sự quay của mặt phẳng dao động con lắc chứng tỏ Trái Đất quay quanh trục. " + LONG_LOREM, highlights: ["Hệ quy chiếu", "Coriolis", "Quay quanh trục"], img: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=2080",
        link: "https://vi.wikipedia.org/wiki/Con_l%E1%BA%AFc_Foucault"
    },
    { 
        id: 7, year: "1905", numericYear: 1905, title: "Chuyển động Brown", physicist: "Albert Einstein", category: "Cơ học",
        shortDesc: "Bằng chứng sự tồn tại của nguyên tử.", 
        fullDesc: "Giải thích chuyển động ngẫu nhiên của hạt phấn hoa trong nước do va chạm phân tử. " + LONG_LOREM, highlights: ["Thống kê", "Nguyên tử", "Dao động nhiệt"], img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/Chuy%E1%BB%83n_%C4%91%E1%BB%99ng_Brown"
    },
    { 
        id: 8, year: "1963", numericYear: 1963, title: "Lý thuyết Hỗn loạn", physicist: "Edward Lorenz", category: "Cơ học",
        shortDesc: "Hiệu ứng cánh bướm.", 
        fullDesc: "Hệ động lực nhạy cảm với điều kiện ban đầu. " + LONG_LOREM, highlights: ["Chaos", "Phi tuyến", "Dự báo thời tiết"], img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/L%C3%BD_thuy%E1%BA%BFt_h%E1%BB%97n_lo%E1%BA%A1n"
    },

    // --- ĐIỆN TỪ (8 sự kiện) ---
    { 
        id: 9, year: "1785", numericYear: 1785, title: "Định luật Coulomb", physicist: "Charles-Augustin de Coulomb", category: "Điện từ",
        shortDesc: "Lực tương tác điện tích.", fullDesc: "Cơ sở của tĩnh điện học. " + LONG_LOREM, highlights: ["Tĩnh điện", "Lực điện", "Điện tích điểm"], img: "https://images.unsplash.com/photo-1605648916319-cf082f7524a1?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_Coulomb"
    },
    { 
        id: 10, year: "1800", numericYear: 1800, title: "Pin Volta", physicist: "Alessandro Volta", category: "Điện từ",
        shortDesc: "Nguồn điện hóa học đầu tiên.", fullDesc: "Tạo ra dòng điện một chiều ổn định. " + LONG_LOREM, highlights: ["Pin", "Dòng điện", "Điện hóa"], img: "https://images.unsplash.com/photo-1565891741441-64926e441838?q=80&w=2071",
        link: "https://vi.wikipedia.org/wiki/Pin_Volta"
    },
    { 
        id: 11, year: "1820", numericYear: 1820, title: "Tác dụng từ của dòng điện", physicist: "Hans Christian Ørsted", category: "Điện từ",
        shortDesc: "Kim nam châm bị lệch gần dây điện.", fullDesc: "Khám phá mối liên hệ giữa điện và từ. " + LONG_LOREM, highlights: ["Điện từ trường", "La bàn", "Từ trường"], img: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=2074",
        link: "https://vi.wikipedia.org/wiki/Hans_Christian_%C3%98rsted"
    },
    { 
        id: 12, year: "1831", numericYear: 1831, title: "Cảm ứng điện từ", physicist: "Michael Faraday", category: "Điện từ",
        shortDesc: "Biến từ thành điện.", fullDesc: "Nguyên lý của máy phát điện và biến thế. " + LONG_LOREM, highlights: ["Máy phát điện", "Từ thông", "Cảm ứng"], img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2041",
        link: "https://vi.wikipedia.org/wiki/C%E1%BA%A3m_%E1%BB%A9ng_%C4%91i%E1%BB%87n_t%E1%BB%AB"
    },
    { 
        id: 13, year: "1865", numericYear: 1865, title: "Phương trình Maxwell", physicist: "James Clerk Maxwell", category: "Điện từ",
        shortDesc: "Thống nhất điện từ học.", fullDesc: "Dự đoán sự tồn tại của sóng điện từ. " + LONG_LOREM, highlights: ["Sóng điện từ", "Ánh sáng", "Trường"], img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072",
        link: "https://vi.wikipedia.org/wiki/Ph%C6%B0%C6%A1ng_tr%C3%ACnh_Maxwell"
    },
    { 
        id: 14, year: "1888", numericYear: 1888, title: "Sóng vô tuyến", physicist: "Heinrich Hertz", category: "Điện từ",
        shortDesc: "Kiểm chứng lý thuyết Maxwell.", fullDesc: "Tạo ra và thu sóng điện từ trong phòng thí nghiệm. " + LONG_LOREM, highlights: ["Radio", "Tần số", "Anten"], img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2072",
        link: "https://vi.wikipedia.org/wiki/Heinrich_Hertz"
    },
    { 
        id: 15, year: "1897", numericYear: 1897, title: "Khám phá Electron", physicist: "J.J. Thomson", category: "Điện từ",
        shortDesc: "Hạt hạ nguyên tử đầu tiên.", fullDesc: "Tìm ra bản chất tia âm cực. " + LONG_LOREM, highlights: ["Hạt cơ bản", "Tia âm cực", "Điện tích"], img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/Electron"
    },
    { 
        id: 16, year: "1911", numericYear: 1911, title: "Siêu dẫn", physicist: "Heike Kamerlingh Onnes", category: "Điện từ",
        shortDesc: "Điện trở bằng 0.", fullDesc: "Phát hiện thủy ngân mất điện trở ở nhiệt độ Heli lỏng. " + LONG_LOREM, highlights: ["Nhiệt độ thấp", "Từ trường", "Meissner"], img: "https://images.unsplash.com/photo-1518331393690-34907f9095bb?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/Si%C3%AAu_d%E1%BA%ABn"
    },

    // --- THIÊN VĂN (8 sự kiện) ---
    { 
        id: 17, year: "1543", numericYear: 1543, title: "Thuyết Nhật tâm", physicist: "Nicolaus Copernicus", category: "Thiên văn",
        shortDesc: "Trái Đất quay quanh Mặt Trời.", fullDesc: "Cuộc cách mạng thay đổi vị trí con người trong vũ trụ. " + LONG_LOREM, highlights: ["Hệ Mặt Trời", "Quỹ đạo", "Heliocentrism"], img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
        link: "https://vi.wikipedia.org/wiki/Thuy%E1%BA%BFt_Nh%E1%BA%ADt_t%C3%A2m"
    },
    { 
        id: 18, year: "1609", numericYear: 1609, title: "Kính viễn vọng", physicist: "Galileo Galilei", category: "Thiên văn",
        shortDesc: "Mở mắt nhìn bầu trời.", fullDesc: "Quan sát vệ tinh Sao Mộc, vành đai Sao Thổ. " + LONG_LOREM, highlights: ["Vệ tinh", "Quan sát", "Sao Mộc"], img: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/K%C3%ADnh_thi%C3%AAn_v%C4%83n"
    },
    { 
        id: 19, year: "1619", numericYear: 1619, title: "Định luật Kepler", physicist: "Johannes Kepler", category: "Thiên văn",
        shortDesc: "Quỹ đạo Ellip.", fullDesc: "Mô tả chính xác chuyển động hành tinh. " + LONG_LOREM, highlights: ["Ellip", "Cơ học thiên thể", "Diện tích"], img: "https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_Kepler_v%E1%BB%81_chuy%E1%BB%83n_%C4%91%E1%BB%99ng_thi%C3%AAn_th%E1%BB%83"
    },
    { 
        id: 20, year: "1929", numericYear: 1929, title: "Vũ trụ giãn nở", physicist: "Edwin Hubble", category: "Thiên văn",
        shortDesc: "Định luật Hubble.", fullDesc: "Các thiên hà đang rời xa nhau. " + LONG_LOREM, highlights: ["Big Bang", "Dịch chuyển đỏ", "Thiên hà"], img: "https://images.unsplash.com/photo-1462331940185-327043d83013?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_Hubble"
    },
    { 
        id: 21, year: "1965", numericYear: 1965, title: "Bức xạ nền vi sóng", physicist: "Penzias & Wilson", category: "Thiên văn",
        shortDesc: "Tiếng vọng của Big Bang.", fullDesc: "Bức xạ nhiệt tàn dư từ thuở sơ khai của vũ trụ. " + LONG_LOREM, highlights: ["CMB", "Vũ trụ học", "Nhiệt độ vũ trụ"], img: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/B%E1%BB%A9c_x%E1%BA%A1_ph%C3%B4ng_vi_s%C3%B3ng_v%C5%A9_tr%E1%BB%A5"
    },
    { 
        id: 22, year: "1990", numericYear: 1990, title: "Kính Hubble", physicist: "NASA", category: "Thiên văn",
        shortDesc: "Đôi mắt ngoài không gian.", fullDesc: "Chụp ảnh vũ trụ sâu chưa từng thấy. " + LONG_LOREM, highlights: ["Vũ trụ sâu", "Tinh vân", "Trường sâu"], img: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072",
        link: "https://vi.wikipedia.org/wiki/K%C3%ADnh_vi%E1%BB%85n_v%E1%BB%8Dng_kh%C3%B4ng_gian_Hubble"
    },
    { 
        id: 23, year: "2015", numericYear: 2015, title: "Sóng hấp dẫn", physicist: "LIGO", category: "Thiên văn",
        shortDesc: "Rung động không-thời gian.", fullDesc: "Phát hiện sáp nhập lỗ đen. " + LONG_LOREM, highlights: ["Einstein", "Lỗ đen", "LIGO"], img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/S%C3%B3ng_h%E1%BA%A5p_d%E1%BA%ABn"
    },
    { 
        id: 24, year: "2019", numericYear: 2019, title: "Ảnh Lỗ Đen", physicist: "EHT Collaboration", category: "Thiên văn",
        shortDesc: "Chụp ảnh cái bóng lỗ đen.", fullDesc: "Lần đầu tiên chụp được lỗ đen M87*. " + LONG_LOREM, highlights: ["Sự kiện chân trời", "Xử lý ảnh", "M87*"], img: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=2078",
        link: "https://vi.wikipedia.org/wiki/L%E1%BB%97_%C4%91en"
    },

    // --- LƯỢNG TỬ & HẠT NHÂN (8 sự kiện) ---
    { 
        id: 25, year: "1900", numericYear: 1900, title: "Giả thuyết Lượng tử", physicist: "Max Planck", category: "Lượng tử",
        shortDesc: "Năng lượng không liên tục.", fullDesc: "Giải quyết khủng hoảng vùng tử ngoại. " + LONG_LOREM, highlights: ["Hằng số Planck", "Bức xạ đen", "Lượng tử hóa"], img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/Max_Planck"
    },
    { 
        id: 26, year: "1905", numericYear: 1905, title: "Hiệu ứng Quang điện", physicist: "Albert Einstein", category: "Lượng tử",
        shortDesc: "Ánh sáng là hạt (Photon).", fullDesc: "Giải Nobel cho Einstein. " + LONG_LOREM, highlights: ["Photon", "Lưỡng tính", "Công thoát"], img: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/Hi%E1%BB%87u_%E1%BB%A9ng_quang_%C4%91i%E1%BB%87n"
    },
    { 
        id: 27, year: "1913", numericYear: 1913, title: "Mô hình Bohr", physicist: "Niels Bohr", category: "Lượng tử",
        shortDesc: "Cấu trúc nguyên tử Hydro.", fullDesc: "Electron chuyển động trên quỹ đạo dừng. " + LONG_LOREM, highlights: ["Quang phổ", "Mức năng lượng", "Tiên đề Bohr"], img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/M%C3%B4_h%C3%ACnh_Bohr"
    },
    { 
        id: 28, year: "1924", numericYear: 1924, title: "Sóng vật chất", physicist: "Louis de Broglie", category: "Lượng tử",
        shortDesc: "Hạt cũng là sóng.", fullDesc: "Mọi vật chất đều có tính sóng. " + LONG_LOREM, highlights: ["Lưỡng tính", "Sóng", "De Broglie"], img: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=2167",
        link: "https://vi.wikipedia.org/wiki/Louis_de_Broglie"
    },
    { 
        id: 29, year: "1926", numericYear: 1926, title: "Phương trình Schrödinger", physicist: "Erwin Schrödinger", category: "Lượng tử",
        shortDesc: "Cơ học sóng.", fullDesc: "Mô tả trạng thái lượng tử qua hàm sóng. " + LONG_LOREM, highlights: ["Hàm sóng", "Xác suất", "Orbital"], img: "https://images.unsplash.com/photo-1614726365723-49cfa0b86561?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/Ph%C6%B0%C6%A1ng_tr%C3%ACnh_Schr%C3%B6dinger"
    },
    { 
        id: 30, year: "1927", numericYear: 1927, title: "Nguyên lý Bất định", physicist: "Werner Heisenberg", category: "Lượng tử",
        shortDesc: "Giới hạn của sự đo lường.", fullDesc: "Không thể biết chính xác đồng thời vị trí và động lượng. " + LONG_LOREM, highlights: ["Bất định", "Đo lường", "Ma trận"], img: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=2071",
        link: "https://vi.wikipedia.org/wiki/Nguy%C3%AAn_l%C3%BD_b%E1%BA%A5t_%C4%91%E1%BB%8Bnh"
    },
    { 
        id: 31, year: "1938", numericYear: 1938, title: "Phân hạch Hạt nhân", physicist: "Otto Hahn & Lise Meitner", category: "Hạt nhân",
        shortDesc: "Chia tách nguyên tử.", fullDesc: "Cơ sở của năng lượng hạt nhân và bom nguyên tử. " + LONG_LOREM, highlights: ["Năng lượng", "Uranium", "Dây chuyền"], img: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2070",
        link: "https://vi.wikipedia.org/wiki/Ph%C3%A2n_h%E1%BA%A1ch_h%E1%BA%A1t_nh%C3%A2n"
    },
    { 
        id: 32, year: "2012", numericYear: 2012, title: "Hạt Higgs", physicist: "CERN", category: "Hạt nhân",
        shortDesc: "Hạt của Chúa.", fullDesc: "Giải thích nguồn gốc khối lượng của các hạt cơ bản. " + LONG_LOREM, highlights: ["Mô hình chuẩn", "LHC", "Trường Higgs"], img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080",
        link: "https://vi.wikipedia.org/wiki/Boson_Higgs"
    }
];

export const SCIENTISTS_DATA: Scientist[] = [
    {
        id: 'einstein', name: 'Albert Einstein', life: '1879 - 1955', field: 'Vật lý lý thuyết',
        desc: 'Cha đẻ của Thuyết tương đối, thay đổi hoàn toàn cách nhìn về không gian, thời gian và hấp dẫn.',
        image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2070'
    },
    {
        id: 'newton', name: 'Isaac Newton', life: '1643 - 1727', field: 'Cơ học, Toán học',
        desc: 'Người đặt nền móng cho cơ học cổ điển và quang học. Phát minh ra vi tích phân.',
        image: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=2070'
    },
    {
        id: 'curie', name: 'Marie Curie', life: '1867 - 1934', field: 'Phóng xạ',
        desc: 'Người phụ nữ đầu tiên đoạt giải Nobel, người duy nhất đoạt giải ở hai lĩnh vực khác nhau (Lý & Hóa).',
        image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=2070'
    },
    {
        id: 'feynman', name: 'Richard Feynman', life: '1918 - 1988', field: 'Điện động lực học lượng tử',
        desc: 'Thiên tài giảng dạy, nổi tiếng với Biểu đồ Feynman và đóng góp cho dự án Manhattan.',
        image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070'
    },
    {
        id: 'hawking', name: 'Stephen Hawking', life: '1942 - 2018', field: 'Vũ trụ học',
        desc: 'Khám phá bức xạ Hawking của lỗ đen, tác giả cuốn Lược sử thời gian.',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070'
    },
    {
        id: 'tesla', name: 'Nikola Tesla', life: '1856 - 1943', field: 'Điện từ',
        desc: 'Nhà phát minh đại tài, cha đẻ của dòng điện xoay chiều (AC) và động cơ cảm ứng.',
        image: 'https://images.unsplash.com/photo-1620204738596-4db0928925d4?q=80&w=2070'
    },
    {
        id: 'maxwell', name: 'James Clerk Maxwell', life: '1831 - 1879', field: 'Điện từ',
        desc: 'Người thống nhất điện và từ, dự đoán sự tồn tại của sóng điện từ.',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072'
    },
    {
        id: 'bohr', name: 'Niels Bohr', life: '1885 - 1962', field: 'Lượng tử',
        desc: 'Đặt nền móng cho cấu trúc nguyên tử và cơ học lượng tử.',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070'
    },
    {
        id: 'galileo', name: 'Galileo Galilei', life: '1564 - 1642', field: 'Thiên văn, Động học',
        desc: 'Cha đẻ của khoa học hiện đại, bảo vệ thuyết Nhật tâm.',
        image: 'https://images.unsplash.com/photo-1548543604-a87c9909abec?q=80&w=2070'
    },
    {
        id: 'planck', name: 'Max Planck', life: '1858 - 1947', field: 'Lượng tử',
        desc: 'Người khai sinh ra thuyết lượng tử với giả thuyết về năng lượng gián đoạn.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070'
    }
];

export const FORMULAS_DB: Formula[] = [
    // --- LỚP 10 (8 formulas) ---
    { 
        id: "newton2", grade: 10, cat: "Cơ học", name: "Định luật II Newton", eq: "\\vec{F} = m\\vec{a}", 
        intro: "Lực là nguyên nhân gây ra gia tốc.", 
        detail: CONTENT_TEMPLATE, 
        image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=2072" 
    },
    { 
        id: "gravity", grade: 10, cat: "Cơ học", name: "Định luật Vạn vật hấp dẫn", 
        eq: "F = G \\frac{m_1 m_2}{r^2}", 
        intro: "Lực hấp dẫn giữa mọi vật thể có khối lượng.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072" 
    },
    { 
        id: "momentum", grade: 10, cat: "Cơ học", name: "Động lượng", eq: "\\vec{p} = m\\vec{v}", 
        intro: "Đại lượng đặc trưng cho sự truyền tương tác.", 
        detail: CONTENT_TEMPLATE, 
        image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=2071" 
    },
    { 
        id: "hooke", grade: 10, cat: "Cơ học", name: "Định luật Hooke", eq: "F_{dh} = -k\\Delta l", 
        intro: "Lực đàn hồi của lò xo.", 
        detail: CONTENT_TEMPLATE, 
        image: "https://images.unsplash.com/photo-1517646331032-9e8563c523a1?q=80&w=2070" 
    },
    { 
        id: "centripetal", grade: 10, cat: "Cơ học", name: "Lực hướng tâm", eq: "F_{ht} = m\\frac{v^2}{r} = m\\omega^2 r", 
        intro: "Lực giữ vật chuyển động tròn.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=2074" 
    },
    { 
        id: "energy", grade: 10, cat: "Năng lượng", name: "Bảo toàn cơ năng", eq: "W = W_đ + W_t = const", 
        intro: "Cơ năng trong hệ kín được bảo toàn.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1464802622750-81774c94cd2b?q=80&w=2070" 
    },
    { 
        id: "ideal_gas", grade: 10, cat: "Nhiệt học", name: "Phương trình Clapeyron", eq: "pV = nRT", 
        intro: "Trạng thái khí lý tưởng.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1457364887197-9150188c107b?q=80&w=2070" 
    },
    { 
        id: "thermo1", grade: 10, cat: "Nhiệt học", name: "Nguyên lý I NĐLH", eq: "\\Delta U = A + Q", 
        intro: "Bảo toàn năng lượng trong nhiệt động lực học.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1525114758654-21915908b88d?q=80&w=2070" 
    },
    
    // --- LỚP 11 (8 formulas) ---
    { 
        id: "coulomb", grade: 11, cat: "Điện từ", name: "Định luật Coulomb", eq: "F = k \\frac{|q_1 q_2|}{\\varepsilon r^2}", 
        intro: "Lực tương tác tĩnh điện.", 
        detail: CONTENT_TEMPLATE, 
        image: "https://images.unsplash.com/photo-1605648916319-cf082f7524a1?q=80&w=2070" 
    },
    { 
        id: "efield", grade: 11, cat: "Điện từ", name: "Cường độ điện trường", eq: "E = k \\frac{|Q|}{\\varepsilon r^2}", 
        intro: "Đặc trưng cho khả năng tác dụng lực của điện trường.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1620204738596-4db0928925d4?q=80&w=2070" 
    },
    { 
        id: "ohm_closed", grade: 11, cat: "Điện từ", name: "Định luật Ohm toàn mạch", eq: "I = \\frac{\\mathcal{E}}{R_N + r}", 
        intro: "Dòng điện trong mạch kín có nguồn.", 
        detail: CONTENT_TEMPLATE, 
        image: "https://images.unsplash.com/photo-1565891741441-64926e441838?q=80&w=2071" 
    },
    { 
        id: "ampere", grade: 11, cat: "Điện từ", name: "Lực Ampere", eq: "F = BIl \\sin \\alpha", 
        intro: "Lực từ tác dụng lên dây dẫn mang dòng điện.", 
        detail: CONTENT_TEMPLATE, 
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072" 
    },
    { 
        id: "lorentz", grade: 11, cat: "Điện từ", name: "Lực Lorentz", eq: "f = |q|vB \\sin \\alpha", 
        intro: "Lực từ tác dụng lên hạt mang điện chuyển động.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070" 
    },
    { 
        id: "flux", grade: 11, cat: "Điện từ", name: "Từ thông", eq: "\\Phi = BS \\cos \\alpha", 
        intro: "Lượng từ trường xuyên qua một diện tích.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2041" 
    },
    { 
        id: "refraction", grade: 11, cat: "Quang học", name: "Định luật Khúc xạ", eq: "n_1 \\sin i = n_2 \\sin r", 
        intro: "Định luật Snell về sự gãy khúc của ánh sáng.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=2167" 
    },
    { 
        id: "lens", grade: 11, cat: "Quang học", name: "Công thức thấu kính", eq: "\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}", 
        intro: "Xác định vị trí ảnh qua thấu kính.", 
        detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2070" 
    },
    
    // --- LỚP 12 (8 formulas) ---
    {
        id: "shm", grade: 12, cat: "Cơ học", name: "Dao động điều hòa", eq: "x = A \\cos(\\omega t + \\varphi)",
        intro: "Phương trình cơ bản của dao động.", detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=2080"
    },
    {
        id: "pendulum", grade: 12, cat: "Cơ học", name: "Con lắc đơn", eq: "T = 2\\pi \\sqrt{\\frac{l}{g}}",
        intro: "Chu kỳ dao động con lắc đơn.", detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?q=80&w=2070"
    },
    {
        id: "wave", grade: 12, cat: "Cơ học", name: "Giao thoa sóng", eq: "u = 2a \\cos(\\frac{\\pi(d_2-d_1)}{\\lambda}) ...",
        intro: "Tổng hợp dao động từ hai nguồn.", detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1500491460312-c32fc2dbc751?q=80&w=2070"
    },
    {
        id: "ac_circuit", grade: 12, cat: "Điện từ", name: "Mạch RLC nối tiếp", eq: "Z = \\sqrt{R^2 + (Z_L - Z_C)^2}",
        intro: "Tổng trở của mạch xoay chiều.", detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1555664424-778a6902201b?q=80&w=2070"
    },
    {
        id: "lc", grade: 12, cat: "Điện từ", name: "Mạch dao động LC", eq: "f = \\frac{1}{2\\pi \\sqrt{LC}}",
        intro: "Tần số dao động riêng.", detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1617156948512-887413d7890b?q=80&w=2000"
    },
    {
        id: "light_interference", grade: 12, cat: "Quang học", name: "Giao thoa ánh sáng", eq: "i = \\frac{\\lambda D}{a}",
        intro: "Khoảng vân giao thoa Y-âng.", detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2068"
    },
    {
        id: "photoelectric", grade: 12, cat: "Lượng tử", name: "Hiện tượng quang điện", eq: "\\varepsilon = hf = A + K_{max}",
        intro: "Phương trình Einstein.", detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2074"
    },
    {
        id: "mass_energy", grade: 12, cat: "Hạt nhân", name: "Hệ thức Einstein", eq: "E = mc^2",
        intro: "Năng lượng nghỉ.", detail: CONTENT_TEMPLATE,
        image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080"
    }
];
