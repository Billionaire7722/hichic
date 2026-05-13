export type VirtualTryOnTextCard = {
  title: string
  text: string
}

export type VirtualTryOnLevel = {
  title: string
  badge: string
  description: string
  bullets: string[]
}

export type VirtualTryOnProductCopy = {
  name: string
  category: string
  colors: Record<string, string>
}

export type VirtualTryOnMessages = {
  metaTitle: string
  metaDescription: string
  hero: {
    label: string
    title: string
    lede: string
    ctaPrimary: string
    ctaSecondary: string
    mockTag: string
    miniCards: Array<{ name: string; status: string }>
  }
  insight: {
    label: string
    heading: string
    copy: string
    cards: VirtualTryOnTextCard[]
  }
  levels: {
    label: string
    heading: string
    copy: string
    cards: VirtualTryOnLevel[]
  }
  demo: {
    label: string
    heading: string
    copy: string
    chooseBodyAreaAria: string
    upperRegion: string
    lowerRegion: string
    avatarAria: string
    upperZoneAria: string
    lowerZoneAria: string
    bodyProfileLabel: string
    measurementsHeading: string
    selectedAreaLabel: string
    upperAreaHeading: string
    lowerAreaHeading: string
    suggestedSize: string
    currentOutfit: string
    upperSize: string
    lowerSize: string
    addToCart: string
    checkout: string
    disclaimer: string
    checkoutMessage: string
    cm: string
    inCentimeters: string
    pantsLength: string
    skirtLength: string
    garmentLengthAria: string
    colorsAriaSuffix: string
    stock: {
      available: string
      unavailable: string
      availableAria: string
      unavailableAria: string
    }
    added: {
      prefix: string
      colorWord: string
      and: string
      suffix: string
    }
    measurements: Record<string, string>
    handles: Record<string, string>
    products: Record<string, VirtualTryOnProductCopy>
  }
  journey: {
    label: string
    heading: string
    steps: Array<VirtualTryOnTextCard & { step: string }>
  }
  business: {
    label: string
    heading: string
    copy: string
    cards: VirtualTryOnTextCard[]
  }
  privacy: {
    label: string
    heading: string
    copy: string
    points: string[]
  }
  cta: {
    label: string
    heading: string
    copy: string
    primary: string
    secondary: string
  }
}

export const virtualTryOnMessages: Record<'en' | 'vi', VirtualTryOnMessages> = {
  en: {
    metaTitle: 'Hichic - Virtual Try-On',
    metaDescription:
      'Preview office shirts, blazers, skirts, and full outfits with Hichic Virtual Try-On.',
    hero: {
      label: 'Virtual Try-On',
      title: 'Try office outfits before you wear them',
      lede:
        'Upload a half-body photo, preview shirts, blazers, and full office outfits, then shop with more confidence.',
      ctaPrimary: 'Start Virtual Try-On',
      ctaSecondary: 'How it works',
      mockTag: 'Before / After',
      miniCards: [
        { name: 'Silk blouse', status: 'Previewed' },
        { name: 'Beige blazer', status: 'Try next' },
        { name: 'Pencil skirt', status: 'Complete look' },
      ],
    },
    insight: {
      label: 'Shopping insight',
      heading: 'Office wear decisions are personal',
      copy:
        'Online shoppers often need to know whether a piece fits their body, suits their coloring, and feels right for work, interviews, and meetings.',
      cards: [
        {
          title: 'Fit confidence',
          text: 'Preview how shirts and blazers may look on your own body before buying.',
        },
        {
          title: 'Style clarity',
          text: 'See whether a color, collar, or silhouette matches your personal office style.',
        },
        {
          title: 'Less hesitation',
          text: 'Make faster decisions and reduce the fear of ordering the wrong item online.',
        },
      ],
    },
    levels: {
      label: 'Three-level roadmap',
      heading: 'Start light, then personalize, then add AI',
      copy:
        'The idea can launch as a simple overlay tool and grow into a richer try-on profile without promising AI before it is ready.',
      cards: [
        {
          title: 'Level 1 - Quick Photo Overlay',
          badge: 'MVP',
          description:
            'Upload a half-body photo and preview office tops with a simple adjustable overlay. Fast to build, easy to test, and perfect for validating user interest.',
          bullets: [
            'Upload half-body photo',
            'Adjust product overlay',
            'Preview shirts and blazers',
            'Save or share the look',
            'Add item to cart',
          ],
        },
        {
          title: 'Level 2 - Personal Style Profile',
          badge: 'Personalized',
          description:
            'Customers save their body photo, usual size, fit preference, and style profile. Every product page can then show a View on me preview.',
          bullets: [
            'Saved body photo',
            'Height, weight, usual size',
            'Fit preference: slim, regular, relaxed',
            'Favorite colors and office style',
            'Faster repeat try-ons',
            'Better size recommendations',
          ],
        },
        {
          title: 'Level 3 - AI Virtual Try-On',
          badge: 'Future upgrade',
          description:
            'AI generates a more realistic preview of the customer wearing selected office outfits, including shirts, blazers, trousers, skirts, and full looks.',
          bullets: [
            'Realistic AI-generated preview',
            'Full outfit try-on',
            'Lighting and body proportion awareness',
            'Outfit comparison',
            'Save and share looks',
            'Personalized recommendations',
          ],
        },
      ],
    },
    demo: {
      label: 'Virtual fitting room',
      heading: 'Virtual Fitting Room for office fashion',
      copy:
        'Build a body profile, choose tailored office pieces, and preview the full look with fit guidance before adding it to cart.',
      chooseBodyAreaAria: 'Choose body area',
      upperRegion: 'Upper body',
      lowerRegion: 'Waist / hips',
      avatarAria: 'Adjustable body model with selected office wear',
      upperZoneAria: 'Select shirts and blazers',
      lowerZoneAria: 'Select pants and skirts',
      bodyProfileLabel: 'Body profile',
      measurementsHeading: 'Centimeter measurements',
      selectedAreaLabel: 'Selected area',
      upperAreaHeading: 'Shirts and blazers',
      lowerAreaHeading: 'Pants and skirts',
      suggestedSize: 'Suggested size',
      currentOutfit: 'Current outfit',
      upperSize: 'upper size',
      lowerSize: 'lower size',
      addToCart: 'Add outfit to cart',
      checkout: 'Continue to checkout',
      disclaimer:
        'Preview images are for style reference only. Please check the size guide before ordering.',
      checkoutMessage: 'Checkout is ready for a future payment integration.',
      cm: 'cm',
      inCentimeters: 'in centimeters',
      pantsLength: 'Pants length',
      skirtLength: 'Skirt length',
      garmentLengthAria: 'Garment length in centimeters',
      colorsAriaSuffix: 'available colors',
      stock: {
        available: 'Available',
        unavailable: 'Temporarily unavailable',
        availableAria: 'available',
        unavailableAria: 'temporarily unavailable',
      },
      added: {
        prefix: 'Added',
        colorWord: 'in',
        and: 'and',
        suffix: 'Checkout is a frontend placeholder for now.',
      },
      measurements: {
        height: 'Height',
        shoulders: 'Shoulders',
        bust: 'Chest / bust',
        waist: 'Waist',
        hips: 'Hips',
        inseam: 'Leg / inseam',
        weight: 'Weight',
      },
      handles: {
        height: 'Height',
        shoulders: 'Shoulders',
        bust: 'Chest',
        waist: 'Waist',
        hips: 'Hips',
        inseam: 'Leg',
        pantHem: 'Pant hem',
        skirtHem: 'Skirt hem',
        dressHem: 'Dress hem',
      },
      products: {
        'silk-blouse': {
          name: 'Silk Charmeuse Blouse',
          category: 'Soft collar blouse',
          colors: {
            ivory: 'Ivory',
            navy: 'Navy',
            'pearl-gray': 'Pearl gray',
          },
        },
        'soft-blazer': {
          name: 'Soft Office Blazer',
          category: 'Single-button tailoring',
          colors: {
            beige: 'Beige',
            espresso: 'Espresso',
            chalk: 'Chalk',
          },
        },
        'crepe-shell': {
          name: 'Crêpe Shell Top',
          category: 'Sleeveless office layer',
          colors: {
            black: 'Black',
            oat: 'Oat',
            sage: 'Sage',
          },
        },
        'tailored-trousers': {
          name: 'Tailored Trousers',
          category: 'Straight-leg office pant',
          colors: {
            black: 'Black',
            charcoal: 'Charcoal',
            'warm-oat': 'Warm oat',
          },
        },
        'pencil-skirt': {
          name: 'Tailored Pencil Skirt',
          category: 'High-rise work skirt',
          colors: {
            black: 'Black',
            taupe: 'Taupe',
            'deep-navy': 'Deep navy',
          },
        },
        'midi-a-line-skirt': {
          name: 'Midi A-Line Skirt',
          category: 'Soft structured midi',
          colors: {
            ink: 'Ink',
            camel: 'Camel',
            'winter-white': 'Winter white',
          },
        },
        'executive-sheath-dress': {
          name: 'Executive Sheath Dress',
          category: 'Structured office dress',
          colors: {
            espresso: 'Espresso',
            ink: 'Ink',
            'winter-cream': 'Winter cream',
          },
        },
      },
    },
    journey: {
      label: 'Customer journey',
      heading: 'From photo to confident cart',
      steps: [
        {
          step: '01',
          title: 'Upload your photo',
          text: 'Use a clear half-body photo with good lighting.',
        },
        {
          step: '02',
          title: 'Choose an item',
          text: 'Pick a shirt, blazer, pants, skirt, or full office outfit.',
        },
        {
          step: '03',
          title: 'Preview your look',
          text: 'Adjust the item and see how the style works on your body.',
        },
        {
          step: '04',
          title: 'Shop with confidence',
          text: 'Save the look, share it, or add the outfit to your cart.',
        },
      ],
    },
    business: {
      label: 'Business value',
      heading: 'Why it helps fashion commerce',
      copy:
        'A practical try-on layer makes product discovery feel personal while giving the business richer shopping signals.',
      cards: [
        {
          title: 'Higher conversion',
          text: 'Customers who can visualize themselves in an outfit are more likely to add items to cart.',
        },
        {
          title: 'Lower return anxiety',
          text: 'Better visual confidence and size guidance can reduce hesitation and potential size-related returns.',
        },
        {
          title: 'More engagement',
          text: 'Try-on interactions keep customers exploring more products and outfit combinations.',
        },
        {
          title: 'Viral sharing',
          text: 'Users can save or share outfit previews with friends, creating organic social traffic.',
        },
      ],
    },
    privacy: {
      label: 'Privacy and trust',
      heading: 'Personal photos need clear promises',
      copy:
        'Try-on should feel helpful, not invasive. The product experience should explain photo use plainly before upload and give customers control over saved profile data.',
      points: [
        'Photos are used only for try-on previews.',
        'Users can delete uploaded photos.',
        'Saved body profile is optional.',
        'AI try-on should require explicit consent.',
        'The product should clearly explain how photos are stored and used.',
      ],
    },
    cta: {
      label: 'Ready to preview',
      heading: 'Make online office wear shopping feel personal.',
      copy:
        'Help customers see themselves in every shirt, blazer, and outfit before they buy.',
      primary: 'Start Virtual Try-On',
      secondary: 'Back to Home',
    },
  },
  vi: {
    metaTitle: 'Hichic - Thử đồ ảo',
    metaDescription:
      'Xem trước áo sơ mi, blazer, chân váy, quần tây và set đồ công sở với Hichic Thử đồ ảo.',
    hero: {
      label: 'Thử đồ ảo',
      title: 'Thử trang phục công sở trước khi mặc',
      lede:
        'Tải lên ảnh nửa người, xem trước áo sơ mi, blazer và cả set đồ công sở, rồi mua sắm tự tin hơn.',
      ctaPrimary: 'Bắt đầu thử đồ',
      ctaSecondary: 'Cách hoạt động',
      mockTag: 'Trước / Sau',
      miniCards: [
        { name: 'Áo lụa', status: 'Đang xem' },
        { name: 'Blazer be', status: 'Thử tiếp' },
        { name: 'Chân váy bút chì', status: 'Hoàn thiện set' },
      ],
    },
    insight: {
      label: 'Insight mua sắm',
      heading: 'Quyết định mua đồ công sở rất cá nhân',
      copy:
        'Khách mua online thường muốn biết món đồ có hợp dáng, hợp màu da và đủ phù hợp cho công việc, phỏng vấn hay cuộc họp không.',
      cards: [
        {
          title: 'Tự tin về phom dáng',
          text: 'Xem trước áo sơ mi và blazer có thể lên dáng như thế nào trên cơ thể của chính bạn.',
        },
        {
          title: 'Rõ hơn về phong cách',
          text: 'Kiểm tra màu sắc, kiểu cổ áo và dáng cắt có hợp với phong cách công sở cá nhân không.',
        },
        {
          title: 'Ít do dự hơn',
          text: 'Ra quyết định nhanh hơn và giảm nỗi lo đặt nhầm món khi mua online.',
        },
      ],
    },
    levels: {
      label: 'Lộ trình ba cấp độ',
      heading: 'Bắt đầu gọn nhẹ, cá nhân hóa dần, rồi nâng cấp AI',
      copy:
        'Ý tưởng có thể ra mắt bằng công cụ overlay đơn giản, sau đó phát triển thành hồ sơ thử đồ sâu hơn mà không hứa AI trước khi sẵn sàng.',
      cards: [
        {
          title: 'Cấp độ 1 - Overlay ảnh nhanh',
          badge: 'MVP',
          description:
            'Tải lên ảnh nửa người và thử áo công sở bằng lớp overlay có thể chỉnh. Dễ xây dựng, dễ kiểm chứng và phù hợp để đo nhu cầu người dùng.',
          bullets: [
            'Tải lên ảnh nửa người',
            'Chỉnh vị trí sản phẩm',
            'Xem trước áo sơ mi và blazer',
            'Lưu hoặc chia sẻ outfit',
            'Thêm sản phẩm vào giỏ',
          ],
        },
        {
          title: 'Cấp độ 2 - Hồ sơ phong cách cá nhân',
          badge: 'Cá nhân hóa',
          description:
            'Khách lưu ảnh cơ thể, size thường mặc, kiểu phom yêu thích và hồ sơ phong cách. Mỗi trang sản phẩm có thể hiển thị nhanh nút Xem trên tôi.',
          bullets: [
            'Lưu ảnh cơ thể',
            'Chiều cao, cân nặng, size thường mặc',
            'Phom yêu thích: ôm, vừa, rộng',
            'Màu sắc và phong cách công sở yêu thích',
            'Thử lại nhanh hơn',
            'Gợi ý size tốt hơn',
          ],
        },
        {
          title: 'Cấp độ 3 - Thử đồ ảo bằng AI',
          badge: 'Nâng cấp tương lai',
          description:
            'AI tạo bản xem trước chân thực hơn khi khách mặc áo sơ mi, blazer, quần tây, chân váy hoặc cả set đồ công sở.',
          bullets: [
            'Bản xem trước AI chân thực',
            'Thử cả set đồ',
            'Nhận biết ánh sáng và tỷ lệ cơ thể',
            'So sánh nhiều outfit',
            'Lưu và chia sẻ outfit',
            'Gợi ý cá nhân hóa',
          ],
        },
      ],
    },
    demo: {
      label: 'Studio chỉnh phom tương tác',
      heading: 'Chỉnh hồ sơ cơ thể, rồi mặc đồ cho từng vùng',
      copy:
        'Kéo các điểm chỉnh hoặc nhập số đo chính xác theo centimet. Chọn phần thân trên để thử áo và blazer, hoặc vùng eo/hông để thử quần và chân váy.',
      chooseBodyAreaAria: 'Chọn vùng cơ thể',
      upperRegion: 'Thân trên',
      lowerRegion: 'Eo / hông',
      avatarAria: 'Mô hình cơ thể có thể chỉnh với trang phục công sở đã chọn',
      upperZoneAria: 'Chọn áo sơ mi và blazer',
      lowerZoneAria: 'Chọn quần và chân váy',
      bodyProfileLabel: 'Hồ sơ cơ thể',
      measurementsHeading: 'Số đo centimet',
      selectedAreaLabel: 'Vùng đang chọn',
      upperAreaHeading: 'Áo sơ mi và blazer',
      lowerAreaHeading: 'Quần và chân váy',
      suggestedSize: 'Size gợi ý',
      currentOutfit: 'Outfit hiện tại',
      upperSize: 'size thân trên',
      lowerSize: 'size thân dưới',
      addToCart: 'Thêm outfit vào giỏ',
      checkout: 'Tiếp tục thanh toán',
      disclaimer:
        'Hình xem trước chỉ dùng để tham khảo phong cách. Vui lòng kiểm tra bảng size trước khi đặt hàng.',
      checkoutMessage: 'Luồng thanh toán đã sẵn sàng cho tích hợp payment sau này.',
      cm: 'cm',
      inCentimeters: 'theo centimet',
      pantsLength: 'Chiều dài quần',
      skirtLength: 'Chiều dài váy',
      garmentLengthAria: 'Chiều dài trang phục theo centimet',
      colorsAriaSuffix: 'màu có sẵn',
      stock: {
        available: 'Còn hàng',
        unavailable: 'Tạm hết màu này',
        availableAria: 'còn hàng',
        unavailableAria: 'tạm hết hàng',
      },
      added: {
        prefix: 'Đã thêm',
        colorWord: 'màu',
        and: 'và',
        suffix: 'Thanh toán hiện là placeholder frontend.',
      },
      measurements: {
        height: 'Chiều cao',
        shoulders: 'Vai',
        bust: 'Ngực',
        waist: 'Eo',
        weight: 'Can nang',
        hips: 'Hông',
        inseam: 'Chân / đáy quần',
      },
      handles: {
        height: 'Cao',
        shoulders: 'Vai',
        bust: 'Ngực',
        waist: 'Eo',
        dressHem: 'Gau vay lien',
        hips: 'Hông',
        inseam: 'Chân',
        pantHem: 'Gấu quần',
        skirtHem: 'Gấu váy',
      },
      products: {
        'silk-blouse': {
          name: 'Áo lụa charmeuse',
          category: 'Áo cổ mềm',
          colors: {
            ivory: 'Trắng ngà',
            navy: 'Xanh navy',
            'pearl-gray': 'Xám ngọc trai',
          },
        },
        'soft-blazer': {
          name: 'Blazer công sở mềm',
          category: 'Blazer một nút',
          colors: {
            beige: 'Be',
            espresso: 'Nâu đậm',
            chalk: 'Phấn nhạt',
          },
        },
        'crepe-shell': {
          name: 'Áo shell crêpe',
          category: 'Áo công sở không tay',
          colors: {
            black: 'Đen',
            oat: 'Yến mạch',
            sage: 'Xanh sage',
          },
        },
        'tailored-trousers': {
          name: 'Quần tây may đo',
          category: 'Quần ống suông công sở',
          colors: {
            black: 'Đen',
            charcoal: 'Xám than',
            'warm-oat': 'Yến mạch ấm',
          },
        },
        'pencil-skirt': {
          name: 'Chân váy bút chì may đo',
          category: 'Chân váy công sở cạp cao',
          colors: {
            black: 'Đen',
            taupe: 'Nâu taupe',
            'deep-navy': 'Navy đậm',
          },
        },
        'midi-a-line-skirt': {
          name: 'Chân váy midi chữ A',
          category: 'Midi đứng phom mềm',
          colors: {
            ink: 'Đen mực',
            camel: 'Camel',
            'winter-white': 'Trắng mùa đông',
          },
        },
      },
    },
    journey: {
      label: 'Hành trình khách hàng',
      heading: 'Từ ảnh cá nhân đến giỏ hàng tự tin',
      steps: [
        {
          step: '01',
          title: 'Tải ảnh lên',
          text: 'Dùng ảnh nửa người rõ nét với ánh sáng tốt.',
        },
        {
          step: '02',
          title: 'Chọn sản phẩm',
          text: 'Chọn áo sơ mi, blazer, quần, chân váy hoặc cả set công sở.',
        },
        {
          step: '03',
          title: 'Xem trước outfit',
          text: 'Chỉnh sản phẩm và xem phong cách đó hoạt động thế nào trên cơ thể bạn.',
        },
        {
          step: '04',
          title: 'Mua sắm tự tin hơn',
          text: 'Lưu outfit, chia sẻ hoặc thêm sản phẩm vào giỏ.',
        },
      ],
    },
    business: {
      label: 'Giá trị kinh doanh',
      heading: 'Vì sao tính năng này giúp thương mại thời trang',
      copy:
        'Một lớp thử đồ thực tế giúp khám phá sản phẩm trở nên cá nhân hơn và tạo thêm tín hiệu mua sắm hữu ích cho doanh nghiệp.',
      cards: [
        {
          title: 'Tăng chuyển đổi',
          text: 'Khách có thể hình dung chính mình trong outfit sẽ dễ thêm sản phẩm vào giỏ hơn.',
        },
        {
          title: 'Giảm lo lắng khi đổi trả',
          text: 'Tự tin hơn về hình ảnh và size có thể giảm do dự cũng như rủi ro trả hàng do sai size.',
        },
        {
          title: 'Tăng tương tác',
          text: 'Thao tác thử đồ giữ khách khám phá thêm nhiều sản phẩm và cách phối.',
        },
        {
          title: 'Dễ chia sẻ',
          text: 'Người dùng có thể lưu hoặc chia sẻ outfit với bạn bè, tạo thêm lưu lượng tự nhiên.',
        },
      ],
    },
    privacy: {
      label: 'Quyền riêng tư và niềm tin',
      heading: 'Ảnh cá nhân cần cam kết rõ ràng',
      copy:
        'Thử đồ nên tạo cảm giác hữu ích, không xâm phạm. Trải nghiệm cần giải thích rõ cách dùng ảnh trước khi tải lên và cho khách kiểm soát dữ liệu hồ sơ đã lưu.',
      points: [
        'Ảnh chỉ được dùng để xem trước thử đồ.',
        'Người dùng có thể xóa ảnh đã tải lên.',
        'Hồ sơ cơ thể đã lưu là tùy chọn.',
        'Thử đồ bằng AI cần có sự đồng ý rõ ràng.',
        'Sản phẩm cần giải thích minh bạch cách lưu trữ và sử dụng ảnh.',
      ],
    },
    cta: {
      label: 'Sẵn sàng xem thử',
      heading: 'Biến mua sắm công sở online thành trải nghiệm cá nhân.',
      copy:
        'Giúp khách nhìn thấy chính mình trong từng chiếc áo, blazer và outfit trước khi mua.',
      primary: 'Bắt đầu thử đồ',
      secondary: 'Về trang chủ',
    },
  },
}
